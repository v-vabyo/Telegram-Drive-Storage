import { NextResponse } from 'next/server';
import { getQuery, allQuery } from '@/lib/db';
import crypto from 'crypto';

export async function GET(req, { params }) {
  const { searchParams } = new URL(req.url);
  return handleRequest(req, await params, null, searchParams.get('folderId'));
}

export async function POST(req, { params }) {
  try {
    const { password } = await req.json();
    const { searchParams } = new URL(req.url);
    return handleRequest(req, await params, password, searchParams.get('folderId'));
  } catch (err) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}

async function handleRequest(req, params, password, requestedFolderId) {
  try {
    const hashId = params.hash;
    if (!hashId) return NextResponse.json({ error: 'Missing hash' }, { status: 400 });

    const share = await getQuery('SELECT fileId, folderId, ownerId, expiresAt, passwordHash FROM shared_links WHERE id = ?', [hashId]);
    
    if (!share) {
      return NextResponse.json({ error: 'Tautan tidak ditemukan atau sudah kadaluarsa' }, { status: 404 });
    }

    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Tautan sudah kadaluarsa' }, { status: 410 });
    }

    if (share.passwordHash) {
      if (!password) {
        return NextResponse.json({ success: true, isPasswordProtected: true });
      }
      
      const inputHash = crypto.createHash('sha256').update(password).digest('hex');
      if (inputHash !== share.passwordHash) {
        return NextResponse.json({ error: 'Password salah' }, { status: 401 });
      }
    }

    if (share.folderId && share.folderId !== 'NONE') {
      let currentFolderId = share.folderId;
      let breadcrumbs = [];

      if (requestedFolderId && requestedFolderId !== share.folderId) {
        const check = await getQuery(`
          WITH RECURSIVE
            folder_tree AS (
              SELECT id, parentId FROM folders WHERE id = ? AND ownerId = ? AND isDeleted = 0
              UNION ALL
              SELECT f.id, f.parentId FROM folders f
              INNER JOIN folder_tree ft ON f.parentId = ft.id
              WHERE f.ownerId = ? AND f.isDeleted = 0
            )
          SELECT id FROM folder_tree WHERE id = ?
        `, [share.folderId, share.ownerId, share.ownerId, requestedFolderId]);

        if (!check) {
          return NextResponse.json({ error: 'Folder tidak valid atau diluar jangkauan tautan' }, { status: 403 });
        }
        currentFolderId = requestedFolderId;

        const breadcrumbsRaw = await allQuery(`
          WITH RECURSIVE
            parent_tree AS (
              SELECT id, parentId, name FROM folders WHERE id = ? AND ownerId = ? AND isDeleted = 0
              UNION ALL
              SELECT f.id, f.parentId, f.name FROM folders f
              INNER JOIN parent_tree pt ON pt.parentId = f.id
              WHERE f.ownerId = ? AND f.isDeleted = 0
            )
          SELECT id, name FROM parent_tree
        `, [currentFolderId, share.ownerId, share.ownerId]);

        // reverse it so it goes root -> child
        breadcrumbs = breadcrumbsRaw.reverse();
        // find the index of the shared root folder to truncate ancestors
        const rootIndex = breadcrumbs.findIndex(b => b.id === share.folderId);
        if (rootIndex !== -1) {
          breadcrumbs = breadcrumbs.slice(rootIndex);
        }
      } else {
        const rootFolder = await getQuery('SELECT id, name FROM folders WHERE id = ? AND ownerId = ? AND isDeleted = 0', [share.folderId, share.ownerId]);
        if (rootFolder) breadcrumbs = [rootFolder];
      }

      const folderMeta = await getQuery('SELECT id, name FROM folders WHERE id = ? AND ownerId = ? AND isDeleted = 0', [currentFolderId, share.ownerId]);
      if (!folderMeta) return NextResponse.json({ error: 'Folder tidak ditemukan' }, { status: 404 });

      const files = await allQuery('SELECT id, filename, size, mimeType FROM files WHERE folderId = ? AND ownerId = ? AND isDeleted = 0 ORDER BY filename ASC', [currentFolderId, share.ownerId]);
      const subFolders = await allQuery('SELECT id, name FROM folders WHERE parentId = ? AND ownerId = ? AND isDeleted = 0 ORDER BY name ASC', [currentFolderId, share.ownerId]);

      return NextResponse.json({ success: true, type: 'folder', folder: folderMeta, items: files, subFolders: subFolders, breadcrumbs });
    } else {
      const fileMeta = await getQuery('SELECT id, filename, size, mimeType FROM files WHERE id = ? AND ownerId = ? AND isDeleted = 0', [share.fileId, share.ownerId]);
      if (!fileMeta) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 404 });
      
      return NextResponse.json({ success: true, type: 'file', file: fileMeta });
    }

  } catch (error) {
    console.error('Public meta error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
