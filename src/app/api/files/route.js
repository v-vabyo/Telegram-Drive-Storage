import { NextResponse } from 'next/server';
import { allQuery } from '@/lib/db';
import { getUserId } from '@/lib/telegram';

export async function GET(req) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('folderId');

    let sql = 'SELECT id, filename, size, mimeType, createdAt FROM files WHERE folderId IS NULL AND ownerId = ? ORDER BY createdAt DESC';
    const params = [userId];

    if (folderId) {
      sql = 'SELECT id, filename, size, mimeType, createdAt FROM files WHERE folderId = ? AND ownerId = ? ORDER BY createdAt DESC';
      params.unshift(folderId); // folderId is first, ownerId is second
    }

    const files = await allQuery(sql, params);
    return NextResponse.json({ success: true, files });
  } catch (error) {
    console.error('Fetch files error:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}
