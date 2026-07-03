import { NextResponse } from 'next/server';
import { runQuery } from '@/lib/db';
import { getClient } from '@/lib/telegram';
import { Api } from 'telegram';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const client = await getClient();
    try {
      await client.invoke(new Api.auth.LogOut());
    } catch (e) {
      console.log('Already logged out from telegram or error', e);
    }
    
    // Clear session from DB
    await runQuery("DELETE FROM sessions WHERE id = ?", [client.currentSessionId]);
    
    // Delete cookie on response
    const response = NextResponse.json({ success: true });
    response.cookies.delete('teledrive_session');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: error.message || 'Failed to logout' }, { status: 500 });
  }
}
