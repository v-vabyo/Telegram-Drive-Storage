import { NextResponse } from 'next/server';
import { getClient, saveSession, createTempClient } from '@/lib/telegram';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const { phoneNumber } = await req.json();
    if (!phoneNumber) return NextResponse.json({ error: 'Phone number required' }, { status: 400 });

    const client = await createTempClient();
    
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
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365 * 10 // 10 years
    });
    
    return response;
  } catch (error) {
    console.error('Send code error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
