import { NextResponse } from 'next/server';
import { getClientByUserId } from '@/lib/telegram';
import { getQuery } from '@/lib/db';
import bigInt from 'big-integer';
import crypto from 'crypto';

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const hashId = resolvedParams.hash;
    if (!hashId) return NextResponse.json({ error: 'Missing hash' }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const queryFileId = searchParams.get('fileId');
    const password = searchParams.get('password');

    const share = await getQuery('SELECT fileId, folderId, ownerId, expiresAt, passwordHash FROM shared_links WHERE id = ?', [hashId]);
    
    if (!share) {
      return NextResponse.json({ error: 'Link not found or expired' }, { status: 404 });
    }

    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Link expired' }, { status: 410 });
    }
    
    if (share.passwordHash) {
      if (!password) {
        return NextResponse.json({ error: 'Password required' }, { status: 401 });
      }
      const inputHash = crypto.createHash('sha256').update(password).digest('hex');
      if (inputHash !== share.passwordHash) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }
    }

    let targetDbFileId = share.fileId;

    if (share.folderId && share.folderId !== 'NONE') {
      if (!queryFileId) {
        return NextResponse.json({ error: 'Missing fileId for folder download' }, { status: 400 });
      }
      targetDbFileId = queryFileId;
      
      // Verify that this file belongs to the shared folder
      const verifyFile = await getQuery('SELECT id FROM files WHERE id = ? AND folderId = ? AND ownerId = ? AND isDeleted = 0', [targetDbFileId, share.folderId, share.ownerId]);
      if (!verifyFile) {
        return NextResponse.json({ error: 'File not found in this folder' }, { status: 404 });
      }
    }

    const fileMeta = await getQuery('SELECT filename, size, mimeType, telegramFileId, folderId FROM files WHERE id = ? AND ownerId = ? AND isDeleted = 0', [targetDbFileId, share.ownerId]);
    
    if (!fileMeta) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const client = await getClientByUserId(share.ownerId);

    let targetPeer = "me";
    if (fileMeta.folderId) {
      const folderMeta = await getQuery('SELECT telegramChannelId FROM folders WHERE id = ?', [fileMeta.folderId]);
      if (folderMeta && folderMeta.telegramChannelId) {
        targetPeer = folderMeta.telegramChannelId;
      }
    } else {
      const setting = await getQuery('SELECT value FROM settings WHERE key = ?', [`rootChannelId_${share.ownerId}`]);
      if (setting && setting.value) {
        targetPeer = setting.value;
      }
    }

    const messages = await client.getMessages(targetPeer, { ids: [parseInt(fileMeta.telegramFileId)] });
    if (!messages || messages.length === 0 || !messages[0].media) {
       return NextResponse.json({ error: 'Media not found on Telegram' }, { status: 404 });
    }
    const message = messages[0];

    const range = req.headers.get('range');
    let start = 0;
    let end = fileMeta.size ? fileMeta.size - 1 : 0;
    let isPartial = false;

    if (range && fileMeta.size) {
      const parts = range.replace(/bytes=/, "").split("-");
      start = parseInt(parts[0], 10);
      end = parts[1] ? parseInt(parts[1], 10) : fileMeta.size - 1;
      isPartial = true;
    }

    const headers = new Headers();
    const disposition = fileMeta.mimeType && (fileMeta.mimeType.startsWith('video/') || fileMeta.mimeType.startsWith('audio/')) ? 'inline' : 'attachment';
    headers.set('Content-Disposition', `${disposition}; filename="${fileMeta.filename}"`);
    headers.set('Content-Type', fileMeta.mimeType || 'application/octet-stream');
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    let status = 200;
    if (isPartial) {
      status = 206;
      headers.set('Content-Range', `bytes ${start}-${end}/${fileMeta.size}`);
      headers.set('Content-Length', (end - start + 1).toString());
    } else if (fileMeta.size) {
      headers.set('Content-Length', fileMeta.size.toString());
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const iterOptions = {
            file: message.media,
            requestSize: 1024 * 1024,
          };

          if (isPartial) {
            iterOptions.offset = bigInt(start);
            iterOptions.limit = end - start + 1;
            iterOptions.requestSize = 256 * 1024;
          }

          const iterator = client.iterDownload(iterOptions);
          
          for await (const chunk of iterator) {
            controller.enqueue(new Uint8Array(chunk));
          }
          controller.close();
        } catch (e) {
          console.error("Stream error from Telegram:", e);
          controller.error(e);
        }
      }
    });

    return new NextResponse(stream, {
      status,
      headers
    });
  } catch (error) {
    console.error('Public download error:', error);
    return NextResponse.json({ error: error.message || 'Failed to download file' }, { status: 500 });
  }
}
