import { query } from "@/lib/db";

export default async function ReplaysPage() {
  const replays = await query`SELECT * FROM ufc_replays ORDER BY created_at DESC`;

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-white text-2xl font-bold uppercase tracking-wider mb-6">UFC Replays</h1>

        {replays.length === 0 ? (
          <p className="text-gray-400 text-sm">No replays available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {replays.map((replay: any) => (
              <div key={replay.id} className="bg-[#111] border border-gray-800 rounded-lg overflow-hidden group">
                <div className="p-4">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gray-800 mx-auto overflow-hidden border-2 border-gray-700">
                        <div className="w-full h-full bg-gradient-to-br from-ufc-red/20 to-gray-800 flex items-center justify-center text-white text-xs font-bold">
                          {replay.fighter1?.split(' ').map((n: string) => n[0]).join('') || '?'}
                        </div>
                      </div>
                      <p className="text-white text-xs font-semibold mt-2 max-w-[100px] truncate">{replay.fighter1}</p>
                    </div>
                    <span className="text-ufc-red text-lg font-black">VS</span>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gray-800 mx-auto overflow-hidden border-2 border-gray-700">
                        <div className="w-full h-full bg-gradient-to-br from-ufc-red/20 to-gray-800 flex items-center justify-center text-white text-xs font-bold">
                          {replay.fighter2?.split(' ').map((n: string) => n[0]).join('') || '?'}
                        </div>
                      </div>
                      <p className="text-white text-xs font-semibold mt-2 max-w-[100px] truncate">{replay.fighter2}</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs text-center mb-4">{replay.event}</p>
                  <a
                    href={`/replays/${replay.id}`}
                    className="block w-full text-center bg-ufc-red text-white py-2 text-xs uppercase tracking-wider font-semibold rounded hover:bg-red-700 transition"
                  >
                    Watch
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
