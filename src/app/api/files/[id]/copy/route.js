import { NextResponse } from 'next/server';
import { getClient, getUserId } from '@/lib/telegram';
import { getQuery, runQuery } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { targetFolderId } = body; // targetFolderId can be null for root

    const fileMeta = await getQuery('SELECT * FROM files WHERE id = ? AND ownerId = ?', [id, userId]);
    if (!fileMeta) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const client = await getClient();
    
    // Determine old target peer
    let oldTargetPeer = "me";
    if (fileMeta.folderId) {
      const oldFolderMeta = await getQuery('SELECT telegramChannelId FROM folders WHERE id = ? AND ownerId = ?', [fileMeta.folderId, userId]);
      if (oldFolderMeta && oldFolderMeta.telegramChannelId) {
        oldTargetPeer = oldFolderMeta.telegramChannelId;
      }
    } else {
      const settingsRow = await getQuery("SELECT value FROM settings WHERE key = ?", [`rootChannelId_${userId}`]);
      if (settingsRow && settingsRow.value) {
        oldTargetPeer = settingsRow.value;
      }
    }

    // Determine new target peer
    let newTargetPeer = "me";
    if (targetFolderId) {
      const newFolderMeta = await getQuery('SELECT telegramChannelId FROM folders WHERE id = ? AND ownerId = ?', [targetFolderId, userId]);
      if (newFolderMeta && newFolderMeta.telegramChannelId) {
        newTargetPeer = newFolderMeta.telegramChannelId;
      } else {
        return NextResponse.json({ error: 'Target folder not found' }, { status: 404 });
      }
    } else {
      const settingsRow = await getQuery("SELECT value FROM settings WHERE key = ?", [`rootChannelId_${userId}`]);
      if (settingsRow && settingsRow.value) {
        newTargetPeer = settingsRow.value;
      } else {
        // Fallback to me
      }
    }

    // Forward the message to duplicate it physically in Telegram
    const forwardedMessages = await client.forwardMessages(newTargetPeer, {
      messages: [parseInt(fileMeta.telegramFileId)],
      fromPeer: oldTargetPeer,
    });

    if (!forwardedMessages) {
      return NextResponse.json({ error: 'Failed to forward message on Telegram' }, { status: 500 });
    }

    let newTelegramFileId = null;
    try {
      if (Array.isArray(forwardedMessages)) {
        const flatMessages = forwardedMessages.flat(Infinity);
        newTelegramFileId = flatMessages[0]?.id?.toString() || flatMessages[0]?.message?.id?.toString();
      } else if (forwardedMessages.updates) {
        const msgUpdate = forwardedMessages.updates.find(u => u.id || (u.message && u.message.id));
        if (msgUpdate) {
          newTelegramFileId = (msgUpdate.id || msgUpdate.message.id).toString();
        }
      }
      
      if (!newTelegramFileId) {
        throw new Error('Could not find new message ID in forward response (flat length: ' + (Array.isArray(forwardedMessages) ? forwardedMessages.flat(Infinity).length : 0) + ')');
      }
    } catch (err) {
      console.error('Error parsing forward response in copy:', err, forwardedMessages);
      return NextResponse.json({ error: 'Berhasil disalin di Telegram, tapi gagal memproses database: ' + err.message }, { status: 500 });
    }
    const newId = crypto.randomUUID();
    
    let newFilename = fileMeta.filename;
    // Append ' - Copy' before extension
    const lastDot = newFilename.lastIndexOf('.');
    if (lastDot !== -1) {
      newFilename = newFilename.substring(0, lastDot) + ' - Copy' + newFilename.substring(lastDot);
    } else {
      newFilename += ' - Copy';
    }

    await runQuery(
      'INSERT INTO files (id, filename, size, mimeType, telegramFileId, folderId, ownerId, isStarred, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newId, newFilename, fileMeta.size, fileMeta.mimeType, newTelegramFileId, targetFolderId || null, userId, fileMeta.isStarred, 0]
    );

    return NextResponse.json({ success: true, newFileId: newId });
  } catch (error) {
    console.error('Copy file error:', error);
    return NextResponse.json({ error: error.message || 'Failed to copy file' }, { status: 500 });
  }
}
