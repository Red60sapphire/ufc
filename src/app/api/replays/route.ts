import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const replays = await query`SELECT * FROM ufc_replays WHERE id = ${parseInt(id)}`;
    if (replays.length === 0) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ replay: replays[0] });
  }

  const replays = await query`SELECT * FROM ufc_replays ORDER BY created_at DESC`;
  return NextResponse.json({ replays });
}
