import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

function parseSession(str: string): { id: number; username: string; is_admin: number } | null {
  try {
    return JSON.parse(Buffer.from(str, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  const user = sessionCookie?.value ? parseSession(sessionCookie.value) : null;
  return NextResponse.json({ user });
}
