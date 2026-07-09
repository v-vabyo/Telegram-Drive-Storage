import { NextResponse } from 'next/server';
import { getClient, getUserId } from '@/lib/telegram';
import { getQuery } from '@/lib/db';
import bigInt from 'big-integer';

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const fileMeta = await getQuery('SELECT filename, size, mimeType, telegramFileId, folderId FROM files WHERE id = ? AND ownerId = ?', [id, userId]);
    
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
    } else {
      const setting = await getQuery('SELECT value FROM settings WHERE key = ?', [`rootChannelId_${userId}`]);
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
            requestSize: 1024 * 1024, // 1 MB chunks for faster loading
          };

          if (isPartial) {
            iterOptions.offset = bigInt(start);
            iterOptions.limit = end - start + 1;
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
    console.error('Download error:', error);
    return NextResponse.json({ error: error.message || 'Failed to download file' }, { status: 500 });
  }
}
