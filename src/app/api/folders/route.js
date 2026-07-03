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

    let sql = 'SELECT * FROM folders WHERE parentId IS NULL AND ownerId = ? ORDER BY createdAt DESC';
    const params = [userId];

    if (parentId) {
      sql = 'SELECT * FROM folders WHERE parentId = ? AND ownerId = ? ORDER BY createdAt DESC';
      params.unshift(parentId);
    }

    const folders = await allQuery(sql, params);
    return NextResponse.json({ success: true, folders });
  } catch (error) {
    console.error('Fetch folders error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch folders' }, { status: 500 });
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
