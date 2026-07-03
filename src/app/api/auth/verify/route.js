import { NextResponse } from 'next/server';
import { getClient, saveSession } from '@/lib/telegram';
import { Api } from 'telegram';
import { computeCheck } from 'telegram/Password';

export async function POST(req) {
  try {
    const { phoneNumber, phoneCodeHash, phoneCode, password } = await req.json();
    
    if (!phoneNumber) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const client = await getClient();
    
    if (password) {
       // Complete the 2FA login
       try {
         const passwordReq = await client.invoke(new Api.account.GetPassword());
         const inputCheck = await computeCheck(passwordReq, password);
         await client.invoke(new Api.auth.CheckPassword({ password: inputCheck }));
       } catch (err) {
         console.error("Password check error:", err);
         return NextResponse.json({ error: 'Kata sandi salah: ' + err.message }, { status: 400 });
       }
    } else {
       // Verify the OTP
       try {
           await client.invoke(
              new Api.auth.SignIn({
                phoneNumber,
                phoneCodeHash,
                phoneCode,
              })
           );
       } catch (err) {
           if (err.message && err.message.includes('SESSION_PASSWORD_NEEDED')) {
               // Save the intermediate session so it remembers OTP
               const sessionString = client.session.save();
               await saveSession(client.currentSessionId, "temp", sessionString);
               return NextResponse.json({ success: false, requiresPassword: true });
           } else if (err.message && err.message.includes('PHONE_CODE_INVALID')) {
               return NextResponse.json({ error: 'Kode verifikasi salah.' }, { status: 400 });
           }
           throw err;
       }
    }
    
    // Save the fully authorized session string
    const me = await client.getMe();
    const userId = me.id.toString();
    const sessionString = client.session.save();
    await saveSession(client.currentSessionId, userId, sessionString);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
