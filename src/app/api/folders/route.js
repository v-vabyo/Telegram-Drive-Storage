import { NextResponse } from 'next/server';
import { getClient, getUserId } from '@/lib/telegram';
import { runQuery, allQuery } from '@/lib/db';
import { Api } from 'telegram';
import crypto from 'crypto';

export async function GET(req) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get('parentId');

    const search = searchParams.get('search');
    const filter = searchParams.get('filter');

    let sql = '';
    let params = [userId];

    if (filter === 'trash') {
      sql = 'SELECT * FROM folders WHERE ownerId = ? AND isDeleted = 1 ORDER BY deletedAt DESC';
    } else if (filter === 'starred') {
      sql = 'SELECT * FROM folders WHERE ownerId = ? AND isDeleted = 0 AND isStarred = 1 ORDER BY createdAt DESC';
    } else if (filter === 'recent' || filter === 'media') {
      // Folders are not shown in recent or media views
      return NextResponse.json({ success: true, folders: [] });
    } else if (search) {
      sql = 'SELECT * FROM folders WHERE ownerId = ? AND isDeleted = 0 AND name LIKE ? ORDER BY createdAt DESC';
      params.push(`%${search}%`);
    } else if (searchParams.get('fetchAll') === 'true') {
      sql = 'SELECT * FROM folders WHERE ownerId = ? AND isDeleted = 0 ORDER BY createdAt DESC';
    } else if (parentId) {
      sql = 'SELECT * FROM folders WHERE ownerId = ? AND isDeleted = 0 AND parentId = ? ORDER BY createdAt DESC';
      params.push(parentId);
    } else {
      sql = 'SELECT * FROM folders WHERE ownerId = ? AND isDeleted = 0 AND parentId IS NULL ORDER BY createdAt DESC';
    }

    const folders = await allQuery(sql, params);

    // Background trash cleanup
    if (filter === 'trash') {
      cleanupTrashFolders(userId).catch(e => console.error('Trash folder cleanup error:', e));
    }

    return NextResponse.json({ success: true, folders });
  } catch (error) {
    console.error('Fetch folders error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch folders' }, { status: 500 });
  }
}

async function cleanupTrashFolders(userId) {
  // Find folders in trash older than 30 days
  const oldFolders = await allQuery("SELECT id, telegramChannelId FROM folders WHERE ownerId = ? AND isDeleted = 1 AND deletedAt <= datetime('now', '-30 days')", [userId]);
  if (!oldFolders || oldFolders.length === 0) return;

  const { getClient } = await import('@/lib/telegram');
  const client = await getClient();
  const isAuthorized = await client.checkAuthorization();
  if (!isAuthorized) return;

  for (const folder of oldFolders) {
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
      console.error('Failed to cleanup folder:', folder.id, e);
      // Delete from DB anyway to prevent infinite loops on stuck folders
      await runQuery('DELETE FROM files WHERE folderId = ?', [folder.id]);
      await runQuery('DELETE FROM folders WHERE id = ?', [folder.id]);
    }
  }
}

export async function POST(req) {
  try {
    const { name, parentId } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    const client = await getClient();
    const isAuthorized = await client.checkAuthorization();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    // Create a Telegram Channel for the folder
    const result = await client.invoke(
      new Api.channels.CreateChannel({
        title: name,
        about: "Created by TelegramStorage",
        broadcast: true,
      })
    );

    const channel = result.chats[0];
    const rawChannelId = channel.id.toString();
    const telegramChannelId = "-100" + rawChannelId;

    // Automatically archive the channel
    try {
      await client.invoke(
        new Api.folders.EditPeerFolders({
          folderPeers: [
            new Api.InputFolderPeer({
              peer: new Api.InputPeerChannel({
                channelId: channel.id,
                accessHash: channel.accessHash
              }),
              folderId: 1, // 1 is the Archive folder ID
            }),
          ],
        })
      );
      console.log(`Channel ${telegramChannelId} archived successfully.`);
    } catch (archiveError) {
      console.error("Failed to archive channel:", archiveError);
      // We don't fail the folder creation if archiving fails
    }

    const id = crypto.randomUUID();

    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await runQuery(
      'INSERT INTO folders (id, name, parentId, telegramChannelId, ownerId) VALUES (?, ?, ?, ?, ?)',
      [id, name, parentId || null, telegramChannelId, userId]
    );

    return NextResponse.json({ success: true, id, name, telegramChannelId });
  } catch (error) {
    console.error('Create folder error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create folder' }, { status: 500 });
  }
}
