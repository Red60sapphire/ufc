import { query } from "@/lib/db";

export default async function ReplaysPage() {
  const replays = await query`SELECT * FROM ufc_replays ORDER BY created_at DESC`;

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-16">
      <div className="border-b border-gray-800/50 bg-gradient-to-r from-ufc-red/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-white text-xl md:text-2xl font-bold uppercase tracking-wider">UFC Replays</h1>
          <p className="text-gray-500 text-sm mt-1">Watch past fights on demand</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {replays.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-gray-800 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <p className="text-gray-500 text-sm">No replays available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {replays.map((replay: any) => (
              <div key={replay.id} className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl overflow-hidden card-hover group">
                <div className="p-5">
                  <div className="flex items-center justify-center gap-5 mb-5">
                    <div className="text-center">
                      <div className="relative w-20 h-20 rounded-full bg-gray-800 mx-auto overflow-hidden border-2 border-gray-700 ring-1 ring-white/10 group-hover:border-ufc-red/30 transition-all duration-300">
                        {replay.fighter1_img ? (
                          <img src={replay.fighter1_img} alt={replay.fighter1} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-ufc-red/20 to-gray-800 flex items-center justify-center text-white text-sm font-bold">
                            {replay.fighter1?.split(' ').map((n: string) => n[0]).join('') || '?'}
                          </div>
                        )}
                      </div>
                      <p className="text-white text-xs font-semibold mt-2 max-w-[100px] truncate">{replay.fighter1}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-ufc-red/10 border border-ufc-red/20 flex items-center justify-center">
                        <span className="text-ufc-red text-lg font-black">VS</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="relative w-20 h-20 rounded-full bg-gray-800 mx-auto overflow-hidden border-2 border-gray-700 ring-1 ring-white/10 group-hover:border-ufc-red/30 transition-all duration-300">
                        {replay.fighter2_img ? (
                          <img src={replay.fighter2_img} alt={replay.fighter2} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-ufc-red/20 to-gray-800 flex items-center justify-center text-white text-sm font-bold">
                            {replay.fighter2?.split(' ').map((n: string) => n[0]).join('') || '?'}
                          </div>
                        )}
                      </div>
                      <p className="text-white text-xs font-semibold mt-2 max-w-[100px] truncate">{replay.fighter2}</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs text-center mb-4">{replay.event}</p>
                  <a
                    href={`/replays/${replay.id}`}
                    className="block w-full text-center bg-ufc-red text-white py-3 text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-900/30"
                  >
                    Watch Replay
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
