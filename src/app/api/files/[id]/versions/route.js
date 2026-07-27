import { NextResponse } from 'next/server';
import { allQuery, getQuery } from '@/lib/db';
import { getUserId } from '@/lib/telegram';

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const fileId = resolvedParams.id;
    if (!fileId) return NextResponse.json({ error: 'Missing fileId' }, { status: 400 });

    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify ownership
    const file = await getQuery('SELECT id FROM files WHERE id = ? AND ownerId = ?', [fileId, userId]);
    if (!file) return NextResponse.json({ error: 'File not found or unauthorized' }, { status: 404 });

    const versions = await allQuery('SELECT id, size, createdAt FROM file_versions WHERE fileId = ? ORDER BY createdAt DESC', [fileId]);

    return NextResponse.json({ success: true, versions });
  } catch (error) {
    console.error('Fetch versions error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
