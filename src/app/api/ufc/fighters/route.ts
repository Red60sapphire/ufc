import { NextRequest, NextResponse } from 'next/server';
import { getAthlete } from '@/lib/ufc-data-fetcher';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const athlete = await getAthlete(id);
    if (!athlete) {
      return NextResponse.json({ success: false, error: 'Fighter not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: athlete });
  }

  return NextResponse.json({ success: false, error: 'Fighter ID required' }, { status: 400 });
}
