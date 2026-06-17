import { query } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function ReplayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const replays = await query`SELECT * FROM ufc_replays WHERE id = ${parseInt(id)}`;

  if (replays.length === 0) notFound();

  const replay = replays[0] as any;

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <a href="/replays" className="text-gray-400 text-xs hover:text-white">&larr; Back to Replays</a>
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          <h1 className="text-white text-lg font-bold">{replay.fighter1}</h1>
          <span className="text-ufc-red text-xl font-black">VS</span>
          <h1 className="text-white text-lg font-bold">{replay.fighter2}</h1>
        </div>
        <p className="text-gray-400 text-sm text-center mb-6">{replay.event}</p>

        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          {replay.video_url ? (
            <video src={replay.video_url} className="w-full h-full" controls autoPlay />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
              No video available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
