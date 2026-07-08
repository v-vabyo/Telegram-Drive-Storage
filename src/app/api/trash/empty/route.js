import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/telegram';
import { allQuery, runQuery } from '@/lib/db';
import { Api } from 'telegram';

export async function DELETE(req) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Empty trash in background to prevent timeout
    emptyTrashInBackground(userId).catch(e => console.error('Empty trash error:', e));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Empty trash trigger error:', error);
    return NextResponse.json({ error: 'Failed to empty trash' }, { status: 500 });
  }
}

async function emptyTrashInBackground(userId) {
  const { getClient } = await import('@/lib/telegram');
  const client = await getClient();
  const isAuthorized = await client.checkAuthorization();
  if (!isAuthorized) return;

  // Process files
  const files = await allQuery("SELECT id, telegramFileId, folderId FROM files WHERE ownerId = ? AND isDeleted = 1", [userId]);
  if (files && files.length > 0) {
    for (const file of files) {
      try {
        let targetPeer = "me";
        if (file.folderId) {
          const folderMeta = await allQuery('SELECT telegramChannelId FROM folders WHERE id = ?', [file.folderId]);
          if (folderMeta && folderMeta.length > 0 && folderMeta[0].telegramChannelId) {
            targetPeer = folderMeta[0].telegramChannelId;
          }
        } else {
          const setting = await allQuery('SELECT value FROM settings WHERE key = ?', [`rootChannelId_${userId}`]);
          if (setting && setting.length > 0 && setting[0].value) {
            targetPeer = setting[0].value;
          }
        }
        await client.deleteMessages(targetPeer, [parseInt(file.telegramFileId)], { revoke: true });
        await runQuery('DELETE FROM files WHERE id = ?', [file.id]);
      } catch (e) {
        console.error('Failed to delete file from trash:', file.id, e);
        // Force delete from DB to prevent getting stuck
        await runQuery('DELETE FROM files WHERE id = ?', [file.id]);
      }
    }
  }

  // Process folders
  const folders = await allQuery("SELECT id, telegramChannelId FROM folders WHERE ownerId = ? AND isDeleted = 1", [userId]);
  if (folders && folders.length > 0) {
    for (const folder of folders) {
      try {
        if (folder.telegramChannelId) {
          await client.invoke(
            new Api.channels.DeleteChannel({
              channel: folder.telegramChannelId
            })
          );
        }
        await runQuery('DELETE FROM files WHERE folderId = ?', [folder.id]);
        await runQuery('DELETE FROM folders WHERE id = ?', [folder.id]);
      } catch (e) {
        console.error('Failed to delete folder from trash:', folder.id, e);
        await runQuery('DELETE FROM files WHERE folderId = ?', [folder.id]);
        await runQuery('DELETE FROM folders WHERE id = ?', [folder.id]);
      }
    }
  }
}
