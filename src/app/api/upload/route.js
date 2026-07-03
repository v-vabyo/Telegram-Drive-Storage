import { NextResponse } from 'next/server';
import { getClient, getUserId } from '@/lib/telegram';
import { runQuery } from '@/lib/db';
import crypto from 'crypto';
import { uploadStore } from '@/lib/uploadStore';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const folderId = formData.get('folderId');
    const uploadId = formData.get('uploadId');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (uploadId) {
      uploadStore.set(uploadId, { progress: 0, status: 'uploading' });
    }

    const client = await getClient();
    const isAuthorized = await client.checkAuthorization();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    // Determine target peer
    let targetPeer = "me";
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (folderId) {
      const { getQuery } = require('@/lib/db');
      const folderMeta = await getQuery('SELECT telegramChannelId FROM folders WHERE id = ? AND ownerId = ?', [folderId, userId]);
      if (folderMeta && folderMeta.telegramChannelId) {
        targetPeer = folderMeta.telegramChannelId;
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Import necessary modules
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    const { CustomFile } = require('telegram/client/uploads');

    // Create a temporary file to bypass GramJS 20MB buffer limit
    const tempFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const tempFilePath = path.join(os.tmpdir(), tempFileName);
    
    fs.writeFileSync(tempFilePath, buffer);

      let telegramFileId;
      try {
        const customFile = new CustomFile(file.name, file.size, tempFilePath);

        // Upload to target
        const message = await client.sendFile(targetPeer, {
          file: customFile,
          forceDocument: true,
          progressCallback: (progress) => {
            if (uploadId) {
              const currentData = uploadStore.get(uploadId);
              if (currentData && currentData.status === 'cancelled') {
                throw new Error('UPLOAD_CANCELLED');
              }
              // GramJS progress is a float between 0 and 1
              uploadStore.set(uploadId, { progress: Math.round(progress * 100) });
            }
          }
        });

        telegramFileId = message.id.toString();
        
        if (uploadId) {
          uploadStore.set(uploadId, { status: 'completed', progress: 100 });
        }
      } catch (uploadError) {
        if (uploadError.message === 'UPLOAD_CANCELLED') {
          return NextResponse.json({ error: 'Upload cancelled by user' }, { status: 400 });
        }
        throw uploadError;
      } finally {
        // Ensure temp file is deleted even if upload fails
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
      
      const id = crypto.randomUUID();

    // Save metadata to SQLite
    await runQuery(
      'INSERT INTO files (id, filename, size, mimeType, telegramFileId, folderId, ownerId) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, file.name, file.size, file.type, telegramFileId, folderId || null, userId]
    );

    return NextResponse.json({ success: true, id, filename: file.name });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload file' }, { status: 500 });
  }
}
