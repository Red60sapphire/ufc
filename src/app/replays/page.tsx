'use client';

import { useState, useEffect } from 'react';
import FightRow from '@/components/FightRow';

export default function ReplaysPage() {
  const [replays, setReplays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState('newest');
  const [activeNav, setActiveNav] = useState('fights');
  const [spoilerHidden, setSpoilerHidden] = useState(true);

  const fetchReplays = async (s: string, sortBy: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort: sortBy, limit: '200', promotion: 'UFC' });
      if (s) params.set('search', s);
      const res = await fetch(`/api/replays?${params}`);
      const data = await res.json();
      setReplays(data.replays || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchReplays(search, sort); }, [search, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-14">
      <div className="bg-diamond border-b border-white/[0.05]">
        <div className="max-w-[1400px] mx-auto px-3 md:px-6">
          <div className="flex items-center gap-3 h-14">
            <div className="bg-[#d20a0a] text-white text-[11px] font-bold uppercase px-2.5 py-1 rounded flex-shrink-0 tracking-wider">
              MMA REPLAYS
            </div>
            <form onSubmit={handleSearch} className="flex-1 max-w-lg">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search for anything..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-8 pr-3 py-1.5 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-[#d20a0a]/50 transition-all"
                />
              </div>
            </form>
            <nav className="hidden md:flex items-center gap-2">
              {['events', 'fights', 'fighters'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveNav(tab)}
                  className={`text-[10px] uppercase font-semibold tracking-wider px-3 py-1.5 rounded-md transition-all ${
                    activeNav === tab
                      ? 'text-white border border-[#d20a0a] bg-[#d20a0a]/10'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {tab === 'fights' && <span className="inline-flex items-center gap-1"><span className="w-4 h-4 rounded-full border border-[#d20a0a] text-[8px] text-[#d20a0a] flex items-center justify-center font-bold">VS</span> {tab}</span>}
                  {tab !== 'fights' && <span>{tab}</span>}
                </button>
              ))}
            </nav>
            <button className="text-gray-500 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-5 flex gap-6">
        <aside className="hidden lg:block w-[240px] flex-shrink-0">
          <div className="bg-diamond-light border border-white/[0.06] rounded-xl p-4 sticky top-20 space-y-4">
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z" clipRule="evenodd" /></svg>
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Filters</span>
            </div>

            <div>
              <label className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold block mb-1">Search</label>
              <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); }}>
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Fighter, event, method"
                  className="w-full bg-black border border-gray-800 rounded-md px-2.5 py-1.5 text-white text-[11px] placeholder-gray-700 focus:outline-none focus:border-[#d20a0a]/50"
                />
              </form>
            </div>

            <div>
              <label className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold block mb-1">Sort</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full bg-black border border-gray-800 rounded-md px-2.5 py-1.5 text-white text-[11px] focus:outline-none focus:border-[#d20a0a]/50 appearance-none">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="views">Most viewed</option>
                <option value="event_date">Event date</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button onClick={handleSearch} className="flex-1 flex items-center justify-center gap-1.5 bg-white text-black text-[10px] font-semibold py-1.5 rounded-md hover:bg-gray-200 transition">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Apply
              </button>
              <button onClick={() => { setSearch(''); setSearchInput(''); setSort('newest'); }} className="flex-1 flex items-center justify-center gap-1.5 bg-gray-900 text-white text-[10px] font-semibold py-1.5 rounded-md border border-gray-800 hover:bg-gray-800 transition">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Reset
              </button>
            </div>

            <button className="w-full flex items-center justify-center gap-1.5 border border-gray-800 text-gray-400 text-[10px] font-semibold py-1.5 rounded-md hover:text-white hover:border-gray-600 transition">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z" clipRule="evenodd" /></svg>
              MORE FILTERS
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-3">
              <h1 className="text-white text-lg md:text-xl font-bold uppercase tracking-tight">Fights</h1>
              <span className="text-[10px] text-gray-600">{replays.length} fights</span>
            </div>
            <button onClick={() => setSpoilerHidden(!spoilerHidden)} className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors">
              {spoilerHidden ? 'Show results' : 'Hide results'}
            </button>
          </div>

          <div className="bg-diamond-light border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 border-b border-white/[0.06] text-[9px] text-gray-500 uppercase tracking-widest font-semibold">
              <div className="w-5 flex-shrink-0" />
              <div className="flex-[2]" />
              <div className="flex items-center gap-2 flex-[2]">
                <div className="w-7" />
                <div className="flex-1" />
              </div>
              <div className="w-[46px] flex-shrink-0 text-center">VS</div>
              <div className="flex items-center gap-2 flex-[2]">
                <div className="flex-1" />
                <div className="w-7" />
              </div>
              <div className="w-28 flex-shrink-0 text-center">Method / Referee</div>
              <div className="w-8 flex-shrink-0 text-center">R</div>
              <div className="w-14 flex-shrink-0 text-center">Time</div>
              <div className="w-32 flex-shrink-0 text-center">Event</div>
              <div className="w-[68px] flex-shrink-0" />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-[#d20a0a] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : replays.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-600 text-xs">No fights found.</p>
              </div>
            ) : (
              <div>
                {replays.map((fight, i) => (
                  <FightRow key={fight.id} fight={fight} index={i} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
