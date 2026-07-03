import { NextResponse } from 'next/server';
import { getClient, saveSession } from '@/lib/telegram';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const { phoneNumber } = await req.json();
    if (!phoneNumber) return NextResponse.json({ error: 'Phone number required' }, { status: 400 });

    const client = await getClient(true);
    
    const result = await client.sendCode(
      { apiId: Number(process.env.TELEGRAM_API_ID), apiHash: process.env.TELEGRAM_API_HASH },
      phoneNumber
    );
    
    await saveSession(client.currentSessionId, "temp", client.session.save());
    
    // Set the cookie on the response
    const response = NextResponse.json({ success: true, phoneCodeHash: result.phoneCodeHash });
    response.cookies.set('teledrive_session', client.currentSessionId, { 
      httpOnly: true, 
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
    
    return response;
  } catch (error) {
    console.error('Send code error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
