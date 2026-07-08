import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/telegram';
import { getQuery, runQuery } from '@/lib/db';

export async function PUT(req, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { targetFolderId } = body; // targetFolderId can be null for root

    // Cannot move a folder into itself
    if (id === targetFolderId) {
      return NextResponse.json({ error: 'Cannot move folder into itself' }, { status: 400 });
    }

    const folderMeta = await getQuery('SELECT * FROM folders WHERE id = ? AND ownerId = ?', [id, userId]);
    if (!folderMeta) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Check if target folder exists (if not root)
    if (targetFolderId) {
      const targetMeta = await getQuery('SELECT id FROM folders WHERE id = ? AND ownerId = ?', [targetFolderId, userId]);
      if (!targetMeta) {
        return NextResponse.json({ error: 'Target folder not found' }, { status: 404 });
      }
      
      // Prevent moving into a child folder (circular dependency)
      // Since it's a simple flat hierarchy in DB, we'd ideally recursively check parentId.
      // For now, we do a simple check.
      let currentParent = targetFolderId;
      while (currentParent) {
        if (currentParent === id) {
          return NextResponse.json({ error: 'Cannot move folder into its own subfolder' }, { status: 400 });
        }
        const pMeta = await getQuery('SELECT parentId FROM folders WHERE id = ?', [currentParent]);
        currentParent = pMeta ? pMeta.parentId : null;
      }
    }

    // Update database
    // For folders, we don't need to move physical messages because the folder IS the channel.
    // The files inside it still belong to this folder's channel.
    await runQuery(
      'UPDATE folders SET parentId = ? WHERE id = ? AND ownerId = ?',
      [targetFolderId || null, id, userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Move folder error:', error);
    return NextResponse.json({ error: error.message || 'Failed to move folder' }, { status: 500 });
  }
}
