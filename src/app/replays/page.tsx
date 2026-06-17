'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReplayRow from '@/components/ReplayRow';

const promotions = ['UFC', 'PFL', 'ONE', 'Bellator', 'Boxing', 'Kickboxing'];
const promoIcons: Record<string, string> = {
  UFC: '🥊', PFL: '⚡', ONE: '🏆', Bellator: '🔔', Boxing: '👊', Kickboxing: '🦵',
};

export default function ReplaysPage() {
  const [replays, setReplays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activePromotion, setActivePromotion] = useState('');
  const [sort, setSort] = useState('newest');

  const fetchReplays = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort, limit: '100' });
      if (search) params.set('search', search);
      if (activePromotion) params.set('promotion', activePromotion);
      const res = await fetch(`/api/replays?${params}`);
      const data = await res.json();
      setReplays(data.replays || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchReplays(); }, [activePromotion, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReplays();
  };

  const featured = replays.find((r) => r.featured) || replays[0];
  const otherReplays = replays.filter((r) => r.id !== featured?.id);

  const grouped = promotions.map((p) => ({
    promotion: p,
    replays: otherReplays.filter((r) => r.promotion === p),
  })).filter((g) => g.replays.length > 0);

  const recentlyAdded = otherReplays.filter((r) => !grouped.some((g) => g.replays.includes(r)));

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-16">
      {featured && !search && !activePromotion && (
        <section className="relative">
          <div className="relative h-[50vh] md:h-[60vh] min-h-[320px] md:min-h-[420px] overflow-hidden">
            {featured.thumbnail || featured.fighter1_img ? (
              <img
                src={featured.thumbnail || featured.fighter1_img}
                alt={featured.title || ''}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-900 via-ufc-red/5 to-gray-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-7xl mx-auto">
              <div className="max-w-2xl">
                {featured.promotion && (
                  <span className="inline-block bg-ufc-red text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider mb-3">
                    {featured.promotion} {featured.featured ? 'Featured' : ''}
                  </span>
                )}
                <h1 className="text-white text-2xl md:text-4xl font-bold uppercase tracking-tight text-shadow">
                  {featured.title || `${featured.fighter1} vs ${featured.fighter2}`}
                </h1>
                <p className="text-gray-300 text-sm mt-2 max-w-xl">
                  {featured.event_name || featured.event}
                  {featured.event_date ? ` · ${new Date(featured.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}
                  {featured.weight_class ? ` · ${featured.weight_class}` : ''}
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <Link
                    href={`/replays/${featured.slug || featured.id}`}
                    className="inline-flex items-center gap-2 bg-ufc-red text-white px-6 py-2.5 text-sm uppercase font-bold rounded-full hover:bg-red-700 transition shadow-lg shadow-red-900/30"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    Watch Replay
                  </Link>
                  {featured.duration && (
                    <span className="text-gray-500 text-xs">{featured.duration}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <form onSubmit={handleSearch} className="flex-1 max-w-md flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search fighters, events, promotions..."
                className="w-full bg-white/5 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 transition-all"
              />
            </div>
            <button type="submit" className="bg-ufc-red text-white px-4 py-2.5 text-xs uppercase font-semibold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-900/20">Search</button>
          </form>

          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-[10px] uppercase tracking-wider">Sort:</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-white/5 border border-gray-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-ufc-red/50">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="views">Most Viewed</option>
              <option value="event_date">Event Date</option>
            </select>
          </div>
        </div>

        {!search && !activePromotion && (
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            <button onClick={() => { setActivePromotion(''); setSearch(''); }} className={`flex-shrink-0 px-4 py-1.5 text-[10px] uppercase font-semibold rounded-full transition-all ${!activePromotion ? 'bg-ufc-red text-white shadow-lg shadow-red-900/20' : 'bg-white/5 text-gray-400 hover:text-white border border-gray-800'}`}>All</button>
            {promotions.map(p => (
              <button key={p} onClick={() => { setActivePromotion(p); setSearch(''); }} className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 text-[10px] uppercase font-semibold rounded-full transition-all ${activePromotion === p ? 'bg-ufc-red text-white shadow-lg shadow-red-900/20' : 'bg-white/5 text-gray-400 hover:text-white border border-gray-800'}`}>
                {promoIcons[p]} {p}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-ufc-red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : replays.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-gray-800 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
            <p className="text-gray-500 text-sm">No replays found.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {featured && !search && !activePromotion && (
              <ReplayRow title="Latest Replays" replays={otherReplays.slice(0, 10)} icon="🔥" />
            )}
            {grouped.map((g) => (
              <ReplayRow key={g.promotion} title={g.promotion} replays={g.replays} icon={promoIcons[g.promotion]} />
            ))}
            {recentlyAdded.length > 0 && (
              <ReplayRow title="Recently Added" replays={recentlyAdded} />
            )}
            {activePromotion && (
              <ReplayRow title={activePromotion} replays={replays} icon={promoIcons[activePromotion]} />
            )}
            {search && (
              <ReplayRow title={`Search Results (${replays.length})`} replays={replays} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
