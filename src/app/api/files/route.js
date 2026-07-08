import { NextResponse } from 'next/server';
import { allQuery, runQuery } from '@/lib/db';
import { getUserId } from '@/lib/telegram';

export async function GET(req) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('folderId');

    const search = searchParams.get('search');
    const filter = searchParams.get('filter');

    let sql = '';
    let params = [userId];

    if (filter === 'trash') {
      sql = 'SELECT id, filename, size, mimeType, isStarred, isDeleted, createdAt, deletedAt FROM files WHERE ownerId = ? AND isDeleted = 1 ORDER BY deletedAt DESC';
    } else if (filter === 'starred') {
      sql = 'SELECT id, filename, size, mimeType, isStarred, isDeleted, createdAt FROM files WHERE ownerId = ? AND isDeleted = 0 AND isStarred = 1 ORDER BY createdAt DESC';
    } else if (filter === 'recent') {
      sql = 'SELECT id, filename, size, mimeType, isStarred, isDeleted, createdAt FROM files WHERE ownerId = ? AND isDeleted = 0 ORDER BY createdAt DESC LIMIT 50';
    } else if (filter === 'media') {
      sql = 'SELECT id, filename, size, mimeType, isStarred, isDeleted, createdAt FROM files WHERE ownerId = ? AND isDeleted = 0 AND (mimeType LIKE "image/%" OR mimeType LIKE "video/%") ORDER BY createdAt DESC';
    } else if (search) {
      sql = 'SELECT id, filename, size, mimeType, isStarred, isDeleted, createdAt FROM files WHERE ownerId = ? AND isDeleted = 0 AND filename LIKE ? ORDER BY createdAt DESC';
      params.push(`%${search}%`);
    } else if (folderId) {
      sql = 'SELECT id, filename, size, mimeType, isStarred, isDeleted, createdAt FROM files WHERE ownerId = ? AND isDeleted = 0 AND folderId = ? ORDER BY createdAt DESC';
      params.push(folderId);
    } else {
      sql = 'SELECT id, filename, size, mimeType, isStarred, isDeleted, createdAt FROM files WHERE ownerId = ? AND isDeleted = 0 AND folderId IS NULL ORDER BY createdAt DESC';
    }

    const files = await allQuery(sql, params);
    
    // Background trash cleanup
    if (filter === 'trash') {
      cleanupTrash(userId).catch(e => console.error('Trash cleanup error:', e));
    }

    return NextResponse.json({ success: true, files });
  } catch (error) {
    console.error('Fetch files error:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}

async function cleanupTrash(userId) {
  // Find files in trash older than 30 days
  const oldFiles = await allQuery("SELECT id, telegramFileId, folderId FROM files WHERE ownerId = ? AND isDeleted = 1 AND deletedAt <= datetime('now', '-30 days')", [userId]);
  if (!oldFiles || oldFiles.length === 0) return;

  const { getClient } = await import('@/lib/telegram');
  const client = await getClient();
  const isAuthorized = await client.checkAuthorization();
  if (!isAuthorized) return;

  for (const file of oldFiles) {
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
      console.error('Failed to cleanup file:', file.id, e);
    }
  }
}
