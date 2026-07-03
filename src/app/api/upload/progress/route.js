import { NextResponse } from 'next/server';
import { uploadStore } from '@/lib/uploadStore';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const uploadId = searchParams.get('id');

  if (!uploadId) {
    return NextResponse.json({ error: 'Missing upload ID' }, { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(() => {
        const data = uploadStore.get(uploadId);
        
        if (!data) {
          // Upload not started or already finished
          return;
        }

        const payload = JSON.stringify(data);
        controller.enqueue(`data: ${payload}\n\n`);

        if (data.status === 'completed' || data.status === 'error' || data.status === 'cancelled') {
          clearInterval(interval);
          controller.close();
        }
      }, 500); // Polling every 500ms is sufficient for smooth progress

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

// DELETE to cancel upload
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const uploadId = searchParams.get('id');
  if (uploadId) {
    uploadStore.cancel(uploadId);
  }
  return NextResponse.json({ success: true });
}
