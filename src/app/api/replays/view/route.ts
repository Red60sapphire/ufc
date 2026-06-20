import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ success: false, error: 'Valid replay ID required' }, { status: 400 });
    }
    await query`UPDATE ufc_replays SET views = COALESCE(views, 0) + 1 WHERE id = ${parseInt(id)}`;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[view-count] Error:', err?.message || err);
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
