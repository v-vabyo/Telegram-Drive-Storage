import { NextResponse } from 'next/server';
import { getQuery } from '@/lib/db';
import { getClient, getUserId } from '@/lib/telegram';

export async function GET() {
  try {
    const client = await getClient();
    const isAuthorized = await client.checkAuthorization();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const row = await getQuery('SELECT SUM(size) as totalSize, COUNT(id) as totalFiles FROM files WHERE ownerId = ?', [userId]);
    
    return NextResponse.json({ 
      success: true, 
      totalSize: row?.totalSize || 0,
      totalFiles: row?.totalFiles || 0
    });
  } catch (error) {
    console.error('Fetch stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
