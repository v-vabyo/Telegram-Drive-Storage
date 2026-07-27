import { NextResponse } from 'next/server';
import { getQuery, runQuery } from '@/lib/db';
import { getUserId } from '@/lib/telegram';
import crypto from 'crypto';

export async function GET(req) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Cleanup expired links before fetching
    await runQuery('DELETE FROM shared_links WHERE expiresAt IS NOT NULL AND expiresAt < ?', [new Date().toISOString()]);

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId');
    const itemType = searchParams.get('itemType') || 'file';
    
    if (!itemId) return NextResponse.json({ error: 'Missing itemId' }, { status: 400 });

    const condition = itemType === 'folder' ? 'folderId = ?' : 'fileId = ?';
    const share = await getQuery(`SELECT id, expiresAt FROM shared_links WHERE ${condition} AND ownerId = ?`, [itemId, userId]);
    
    if (!share) return NextResponse.json({ share: null });

    return NextResponse.json({ share });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { itemId, itemType = 'file', password, expiresInMinutes } = await req.json();
    if (!itemId) return NextResponse.json({ error: 'Missing itemId' }, { status: 400 });

    if (itemType === 'folder') {
      const folder = await getQuery('SELECT id FROM folders WHERE id = ? AND ownerId = ? AND isDeleted = 0', [itemId, userId]);
      if (!folder) return NextResponse.json({ error: 'Folder not found or unauthorized' }, { status: 404 });
    } else {
      const file = await getQuery('SELECT id FROM files WHERE id = ? AND ownerId = ? AND isDeleted = 0', [itemId, userId]);
      if (!file) return NextResponse.json({ error: 'File not found or unauthorized' }, { status: 404 });
    }

    const hashId = crypto.randomBytes(8).toString('hex');
    let expiresAt = null;
    if (expiresInMinutes) {
        expiresAt = new Date(Date.now() + expiresInMinutes * 60000).toISOString();
    }

    let passwordHash = null;
    if (password) {
        passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    }

    const deleteCondition = itemType === 'folder' ? 'folderId = ?' : 'fileId = ?';
    await runQuery(`DELETE FROM shared_links WHERE ${deleteCondition} AND ownerId = ?`, [itemId, userId]);

    const dbFileId = itemType === 'file' ? itemId : 'NONE';
    const dbFolderId = itemType === 'folder' ? itemId : null;

    await runQuery(
      'INSERT INTO shared_links (id, fileId, folderId, ownerId, passwordHash, expiresAt) VALUES (?, ?, ?, ?, ?, ?)',
      [hashId, dbFileId, dbFolderId, userId, passwordHash, expiresAt]
    );

    return NextResponse.json({ success: true, shareId: hashId });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId');
    const itemType = searchParams.get('itemType') || 'file';
    
    if (!itemId) return NextResponse.json({ error: 'Missing itemId' }, { status: 400 });

    const condition = itemType === 'folder' ? 'folderId = ?' : 'fileId = ?';
    await runQuery(`DELETE FROM shared_links WHERE ${condition} AND ownerId = ?`, [itemId, userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
