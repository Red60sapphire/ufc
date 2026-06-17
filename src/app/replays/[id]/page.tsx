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

        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gray-800 mx-auto overflow-hidden border-2 border-gray-700">
              {replay.fighter1_img ? (
                <img src={replay.fighter1_img} alt={replay.fighter1} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-ufc-red/20 to-gray-800 flex items-center justify-center text-white font-bold text-lg">
                  {replay.fighter1?.charAt(0)}
                </div>
              )}
            </div>
            <h1 className="text-white text-sm font-bold mt-2">{replay.fighter1}</h1>
          </div>
          <span className="text-ufc-red text-3xl font-black">VS</span>
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gray-800 mx-auto overflow-hidden border-2 border-gray-700">
              {replay.fighter2_img ? (
                <img src={replay.fighter2_img} alt={replay.fighter2} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-ufc-red/20 to-gray-800 flex items-center justify-center text-white font-bold text-lg">
                  {replay.fighter2?.charAt(0)}
                </div>
              )}
            </div>
            <h1 className="text-white text-sm font-bold mt-2">{replay.fighter2}</h1>
          </div>
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
