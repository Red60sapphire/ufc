import { discoverSources } from '@/lib/stream-scraper';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET() {
  try {
    const sources = await discoverSources();
    return Response.json({ sources, fetchedAt: new Date().toISOString() });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
