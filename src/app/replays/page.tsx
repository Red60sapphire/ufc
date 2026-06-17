import { query } from "@/lib/db";
import Link from "next/link";

export default async function ReplaysPage() {
  const replays = await query`SELECT * FROM ufc_replays ORDER BY created_at DESC`;

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-16">
      <div className="border-b border-gray-800/50 bg-gradient-to-r from-ufc-red/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-ufc-red/20 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/20">
              <svg className="w-6 h-6 text-ufc-red" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-white text-xl md:text-2xl font-bold uppercase tracking-wider">UFC Replays</h1>
              <p className="text-gray-500 text-sm mt-0.5">Watch past fights on demand</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {replays.length === 0 ? (
          <div className="text-center py-24">
            <svg className="w-20 h-20 text-gray-800 mx-auto mb-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <p className="text-gray-500 text-sm">No replays available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {replays.map((replay: any) => (
              <Link
                key={replay.id}
                href={`/replays/${replay.id}`}
                className="group bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl overflow-hidden card-hover"
              >
                <div className="relative bg-gradient-to-r from-ufc-red/5 to-transparent p-6 pb-4">
                  <div className="flex items-center justify-center gap-4 md:gap-6">
                    <div className="text-center">
                      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-800 mx-auto overflow-hidden border-2 border-gray-700 ring-1 ring-white/10 group-hover:border-ufc-red/40 transition-all duration-300 shadow-lg">
                        {replay.fighter1_img ? (
                          <img src={replay.fighter1_img} alt={replay.fighter1} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-ufc-red/20 to-gray-800 flex items-center justify-center text-white text-sm font-bold">
                            {replay.fighter1?.split(' ').map((n: string) => n[0]).join('') || '?'}
                          </div>
                        )}
                      </div>
                      <p className="text-white text-xs font-semibold mt-2 max-w-[90px] truncate mx-auto">{replay.fighter1}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-ufc-red/10 border-2 border-ufc-red/20 flex items-center justify-center group-hover:bg-ufc-red/20 group-hover:border-ufc-red/40 transition-all">
                        <span className="text-ufc-red text-sm font-black">VS</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-gray-700/50 flex items-center justify-center group-hover:bg-ufc-red/20 group-hover:border-ufc-red/30 transition-all">
                        <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-ufc-red transition-colors" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-800 mx-auto overflow-hidden border-2 border-gray-700 ring-1 ring-white/10 group-hover:border-ufc-red/40 transition-all duration-300 shadow-lg">
                        {replay.fighter2_img ? (
                          <img src={replay.fighter2_img} alt={replay.fighter2} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-ufc-red/20 to-gray-800 flex items-center justify-center text-white text-sm font-bold">
                            {replay.fighter2?.split(' ').map((n: string) => n[0]).join('') || '?'}
                          </div>
                        )}
                      </div>
                      <p className="text-white text-xs font-semibold mt-2 max-w-[90px] truncate mx-auto">{replay.fighter2}</p>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-5">
                  {replay.event && (
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider text-center mb-3">{replay.event}</p>
                  )}
                  <div className="flex items-center justify-center gap-2 bg-ufc-red/5 border border-ufc-red/10 rounded-xl px-4 py-2.5 group-hover:bg-ufc-red/10 group-hover:border-ufc-red/20 transition-all">
                    <svg className="w-3.5 h-3.5 text-ufc-red" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    <span className="text-ufc-red text-xs font-semibold uppercase tracking-wider">Watch Replay</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
