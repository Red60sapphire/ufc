import { query } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function ReplayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const replays = await query`SELECT * FROM ufc_replays WHERE id = ${parseInt(id)}`;

  if (replays.length === 0) notFound();

  const replay = replays[0] as any;

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-16">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <a href="/replays" className="inline-flex items-center gap-1 text-gray-500 text-xs hover:text-white transition group">
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Replays
          </a>
        </div>

        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl overflow-hidden p-8">
          <div className="flex items-center justify-center gap-6 md:gap-10 mb-6">
            <div className="text-center">
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-800 mx-auto overflow-hidden border-2 border-gray-700 ring-2 ring-white/10">
                {replay.fighter1_img ? (
                  <img src={replay.fighter1_img} alt={replay.fighter1} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-ufc-red/20 to-gray-800 flex items-center justify-center text-white font-bold text-2xl">
                    {replay.fighter1?.charAt(0)}
                  </div>
                )}
              </div>
              <h1 className="text-white text-sm font-bold mt-3">{replay.fighter1}</h1>
            </div>
            <div className="flex-shrink-0">
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-ufc-red/10 border-2 border-ufc-red/20 flex items-center justify-center">
                <span className="text-ufc-red text-2xl md:text-4xl font-black">VS</span>
              </div>
            </div>
            <div className="text-center">
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-800 mx-auto overflow-hidden border-2 border-gray-700 ring-2 ring-white/10">
                {replay.fighter2_img ? (
                  <img src={replay.fighter2_img} alt={replay.fighter2} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-ufc-red/20 to-gray-800 flex items-center justify-center text-white font-bold text-2xl">
                    {replay.fighter2?.charAt(0)}
                  </div>
                )}
              </div>
              <h1 className="text-white text-sm font-bold mt-3">{replay.fighter2}</h1>
            </div>
          </div>
          <p className="text-gray-400 text-sm text-center mb-8">{replay.event}</p>

          <div className="aspect-video bg-black rounded-2xl overflow-hidden">
            {replay.video_url ? (
              <video src={replay.video_url} className="w-full h-full" controls autoPlay />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-3">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">No video available</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
