import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReplayDetailClient from "./ReplayDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const replays = await query`SELECT * FROM ufc_replays WHERE slug = ${id}`;
  if (replays.length === 0) return { title: "Replay Not Found" };
  const r = replays[0] as any;
  const title = r.title || `${r.fighter1} vs ${r.fighter2}`;
  return {
    title: `${title} - UFC.SOLUTIONS Replays`,
    description: r.description || `Watch ${r.fighter1} vs ${r.fighter2}${r.event_name ? ` at ${r.event_name}` : ''}${r.result ? ` - ${r.result}` : ''}.`,
    openGraph: {
      title: `${title} | UFC.SOLUTIONS`,
      description: r.description || `${r.fighter1} vs ${r.fighter2} full fight replay.`,
      images: r.thumbnail ? [{ url: r.thumbnail }] : [],
      type: 'video.other',
    },
  };
}

export default async function ReplayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const replays = await query`SELECT * FROM ufc_replays WHERE slug = ${id}`;
  if (replays.length === 0) notFound();

  const replay = replays[0] as any;

  const related = await query`
    SELECT * FROM ufc_replays WHERE id != ${replay.id} AND published = 1 ORDER BY created_at DESC LIMIT 10
  `;

  return <ReplayDetailClient replay={replay} related={related as any[]} />;
}
