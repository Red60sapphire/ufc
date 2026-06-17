import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie?.value) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  let user: { id: number; username: string; is_admin: number };
  try { user = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8')); }
  catch { return NextResponse.json({ error: 'Invalid session' }, { status: 401 }); }
  if (!user.is_admin) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
    const allowed = ['mp4', 'webm', 'mkv', 'avi', 'mov', 'm4v'];
    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: `Unsupported format: .${ext}. Allowed: ${allowed.join(', ')}` }, { status: 400 });
    }

    const maxSize = 1024 * 1024 * 500;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 500MB)' }, { status: 400 });
    }

    const blob = await put(`videos/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({ url: blob.url, name: file.name, size: file.size });
  } catch (err: any) {
    if (err.message?.includes('BLOB_READ_WRITE_TOKEN')) {
      return NextResponse.json({ error: 'Vercel Blob not configured. Add BLOB_READ_WRITE_TOKEN to Vercel env vars.' }, { status: 500 });
    }
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}


