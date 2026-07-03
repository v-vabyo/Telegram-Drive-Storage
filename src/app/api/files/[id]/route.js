import { NextResponse } from 'next/server';
import { getClient, getUserId } from '@/lib/telegram';
import { getQuery, runQuery } from '@/lib/db';

export async function DELETE(req, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const fileMeta = await getQuery('SELECT telegramFileId, folderId FROM files WHERE id = ? AND ownerId = ?', [id, userId]);
    
    if (!fileMeta) {
      return NextResponse.json({ error: 'File not found or unauthorized' }, { status: 404 });
    }

    const client = await getClient();
    const isAuthorized = await client.checkAuthorization();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    let targetPeer = "me";
    if (fileMeta.folderId) {
      const folderMeta = await getQuery('SELECT telegramChannelId FROM folders WHERE id = ? AND ownerId = ?', [fileMeta.folderId, userId]);
      if (folderMeta && folderMeta.telegramChannelId) {
        targetPeer = folderMeta.telegramChannelId;
      }
    }

    // Delete message from Telegram
    await client.deleteMessages(targetPeer, [parseInt(fileMeta.telegramFileId)], { revoke: true });

    // Delete from DB
    await runQuery('DELETE FROM files WHERE id = ? AND ownerId = ?', [id, userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete file' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: 'Missing new name' }, { status: 400 });

    const result = await runQuery('UPDATE files SET filename = ? WHERE id = ? AND ownerId = ?', [name, id, userId]);
    if (result.changes === 0) {
       return NextResponse.json({ error: 'File not found or unauthorized' }, { status: 404 });
    }
    
    // We don't need to rename the file in Telegram, only the local DB reference is enough.

    return NextResponse.json({ success: true, name });
  } catch (error) {
    console.error('Rename file error:', error);
    return NextResponse.json({ error: error.message || 'Failed to rename file' }, { status: 500 });
  }
}
