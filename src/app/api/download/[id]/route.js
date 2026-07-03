import { NextResponse } from 'next/server';
import { getClient, getUserId } from '@/lib/telegram';
import { getQuery } from '@/lib/db';

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
    }

    const messages = await client.getMessages(targetPeer, { ids: [parseInt(fileMeta.telegramFileId)] });
    if (!messages || messages.length === 0 || !messages[0].media) {
       return NextResponse.json({ error: 'Media not found on Telegram' }, { status: 404 });
    }

    const message = messages[0];

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${fileMeta.filename}"`);
    headers.set('Content-Type', fileMeta.mimeType || 'application/octet-stream');
    if (fileMeta.size) {
      headers.set('Content-Length', fileMeta.size.toString());
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const iterator = client.iterDownload({
            file: message.media,
            requestSize: 1024 * 512, // 512 KB chunks
          });
          
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
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: error.message || 'Failed to download file' }, { status: 500 });
  }
}
