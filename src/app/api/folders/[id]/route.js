import { NextResponse } from 'next/server';
import { getClient, getUserId } from '@/lib/telegram';
import { getQuery, runQuery } from '@/lib/db';
import { Api } from 'telegram';

export async function DELETE(req, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const folderMeta = await getQuery('SELECT telegramChannelId FROM folders WHERE id = ? AND ownerId = ?', [id, userId]);
    
    if (!folderMeta) {
      return NextResponse.json({ error: 'Folder not found or unauthorized' }, { status: 404 });
    }

    const client = await getClient();
    const isAuthorized = await client.checkAuthorization();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    if (folderMeta.telegramChannelId) {
      try {
        // Delete the channel from Telegram
        await client.invoke(
          new Api.channels.DeleteChannel({
            channel: folderMeta.telegramChannelId
          })
        );
      } catch (tgError) {
        console.error("Failed to delete channel from Telegram:", tgError);
        // Continue to delete from DB even if Telegram channel deletion fails
      }
    }

    // Delete all files inside the folder from DB
    await runQuery('DELETE FROM files WHERE folderId = ? AND ownerId = ?', [id, userId]);
    // Delete the folder from DB
    await runQuery('DELETE FROM folders WHERE id = ? AND ownerId = ?', [id, userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete folder error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete folder' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, name } = body;
    
    let sql = '';
    let paramsArr = [];

    if (action === 'rename' || (!action && name)) {
      if (!name) return NextResponse.json({ error: 'Missing new name' }, { status: 400 });
      sql = 'UPDATE folders SET name = ? WHERE id = ? AND ownerId = ?';
      paramsArr = [name, id, userId];
    } else if (action === 'trash') {
      sql = 'UPDATE folders SET isDeleted = 1, deletedAt = CURRENT_TIMESTAMP WHERE id = ? AND ownerId = ?';
      paramsArr = [id, userId];
    } else if (action === 'restore') {
      sql = 'UPDATE folders SET isDeleted = 0, deletedAt = NULL WHERE id = ? AND ownerId = ?';
      paramsArr = [id, userId];
    } else if (action === 'star') {
      sql = 'UPDATE folders SET isStarred = 1 WHERE id = ? AND ownerId = ?';
      paramsArr = [id, userId];
    } else if (action === 'unstar') {
      sql = 'UPDATE folders SET isStarred = 0 WHERE id = ? AND ownerId = ?';
      paramsArr = [id, userId];
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const result = await runQuery(sql, paramsArr);
    if (result.changes === 0) {
       return NextResponse.json({ error: 'Folder not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, name });
  } catch (error) {
    console.error('Rename folder error:', error);
    return NextResponse.json({ error: error.message || 'Failed to rename folder' }, { status: 500 });
  }
}
