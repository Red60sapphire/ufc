import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    const result = await loginUser(username, password);

    if (!result.success || !result.user) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 });
    }

    const { user } = result;
    const sessionData = { id: user.id, username: user.username, is_admin: user.is_admin };
    const sessionStr = Buffer.from(JSON.stringify(sessionData)).toString('base64');

    const response = NextResponse.json({ success: true, user: sessionData });
    response.cookies.set('session', sessionStr, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
