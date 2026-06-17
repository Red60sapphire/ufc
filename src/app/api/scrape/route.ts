import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { scrapeAll } from '@/lib/replay-scraper';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie?.value) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  let user: { id: number; username: string; is_admin: number };
  try {
    user = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
  }
  if (!user.is_admin) {
    return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 });
  }

  try {
    const result = await scrapeAll();
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
