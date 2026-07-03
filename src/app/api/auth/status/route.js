import { NextResponse } from 'next/server';
import { getClient } from '@/lib/telegram';

export async function GET() {
  try {
    const client = await getClient();
    const isAuthorized = await client.checkAuthorization();
    let user = null;
    if (isAuthorized) {
      const me = await client.getMe();
      if (me) {
        user = {
          firstName: me.firstName,
          lastName: me.lastName,
          username: me.username,
          phone: me.phone
        };
      }
    }
    return NextResponse.json({ isAuthorized, user });
  } catch (error) {
    return NextResponse.json({ isAuthorized: false, user: null });
  }
}
