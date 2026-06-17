import { NextRequest, NextResponse } from 'next/server';
import { signupUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    const result = await signupUser(username, password);

    if (!result.success || !result.user) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    const { user } = result;
    const sessionData = { id: user.id, username: user.username, is_admin: user.is_admin };
    const sessionStr = Buffer.from(JSON.stringify(sessionData)).toString('base64');

    const cookieStore = await cookies();
    cookieStore.set('session', sessionStr, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ success: true, user: sessionData });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
