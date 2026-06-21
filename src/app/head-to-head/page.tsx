'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function HeadToHeadContent() {
  const searchParams = useSearchParams();
  const [f1Id, setF1Id] = useState('');
  const [f2Id, setF2Id] = useState('');
  const [f1Data, setF1Data] = useState<any>(null);
  const [f2Data, setF2Data] = useState<any>(null);
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [results1, setResults1] = useState<any[]>([]);
  const [results2, setResults2] = useState<any[]>([]);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [showSearch1, setShowSearch1] = useState(false);
  const [showSearch2, setShowSearch2] = useState(false);

  useEffect(() => {
    const fighterName = decodeURIComponent(searchParams.get('fighter') || searchParams.get('f1') || '');
    if (fighterName) {
      setSearch1(fighterName);
      fetch(`/api/fighters?search=${encodeURIComponent(fighterName)}`)
        .then(r => r.json())
        .then(d => {
          const f = d.data?.[0];
          if (f) {
            setF1Id(f.id);
            setF1Data(f);
            setSearch1(f.name);
          }
        })
        .catch(() => {});
    }
  }, [searchParams]);

  useEffect(() => {
    if (search1.length < 2) { setResults1([]); return; }
    setLoading1(true);
    fetch(`/api/fighters?search=${encodeURIComponent(search1)}`)
      .then(r => r.json())
      .then(d => { setResults1(d.data || []); setLoading1(false); })
      .catch(() => setLoading1(false));
  }, [search1]);

  useEffect(() => {
    if (search2.length < 2) { setResults2([]); return; }
    setLoading2(true);
    fetch(`/api/fighters?search=${encodeURIComponent(search2)}`)
      .then(r => r.json())
      .then(d => { setResults2(d.data || []); setLoading2(false); })
      .catch(() => setLoading2(false));
  }, [search2]);

  const selectFighter = (side: 1 | 2, athlete: any) => {
    if (side === 1) {
      setF1Id(athlete.id);
      setF1Data(athlete);
      setSearch1(athlete.name);
      setShowSearch1(false);
    } else {
      setF2Id(athlete.id);
      setF2Data(athlete);
      setSearch2(athlete.name);
      setShowSearch2(false);
    }
  };

  const stats = (athlete: any) => [
    { label: 'Record', value: athlete.record || 'N/A' },
    { label: 'Height', value: athlete.height || 'N/A' },
    { label: 'Weight', value: athlete.weight || 'N/A' },
    { label: 'Reach', value: athlete.reach || 'N/A' },
    { label: 'Stance', value: athlete.stance || 'N/A' },
    { label: 'Age', value: athlete.age ? `${athlete.age}` : 'N/A' },
    { label: 'Weight Class', value: athlete.weightClass || 'N/A' },
    { label: 'Country', value: athlete.country || 'N/A' },
  ];

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-16">
      <div className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(210,10,10,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,168,67,0.03),transparent_50%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ufc-red/50 to-transparent" />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <span className="inline-block bg-ufc-red/10 text-ufc-red text-[10px] uppercase tracking-[0.2em] font-semibold px-4 py-1.5 rounded-full border border-ufc-red/20 mb-3">Analysis</span>
          <h1 className="text-white text-3xl md:text-4xl font-bold uppercase tracking-tight">Head to Head</h1>
          <p className="text-gray-500 text-sm mt-2">Compare two fighters side by side</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <FighterSelector
            side={1}
            search={search1}
            setSearch={setSearch1}
            results={results1}
            loading={loading1}
            selected={f1Data}
            showSearch={showSearch1}
            setShowSearch={setShowSearch1}
            onSelect={(a) => selectFighter(1, a)}
            placeholder="Search fighter 1..."
          />
          <div className="hidden md:flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-ufc-red/10 border-2 border-ufc-red/20 flex items-center justify-center animate-ring-pulse">
              <span className="text-ufc-red text-2xl font-black">VS</span>
            </div>
          </div>
          <FighterSelector
            side={2}
            search={search2}
            setSearch={setSearch2}
            results={results2}
            loading={loading2}
            selected={f2Data}
            showSearch={showSearch2}
            setShowSearch={setShowSearch2}
            onSelect={(a) => selectFighter(2, a)}
            placeholder="Search fighter 2..."
          />
        </div>

        {f1Data && f2Data && (
          <div className="space-y-8 animate-in stagger-1">
            <div className="flex items-center justify-center gap-6 mb-8">
              <FighterAvatar athlete={f1Data} />
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-ufc-red/10 border-2 border-ufc-red/20 flex items-center justify-center animate-ring-pulse">
                  <span className="text-ufc-red text-lg font-black">VS</span>
                </div>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider mt-1">Comparison</p>
              </div>
              <FighterAvatar athlete={f2Data} />
            </div>

            <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl overflow-hidden card-hover">
              <div className="bg-gradient-to-r from-ufc-red/10 to-transparent px-6 py-4 border-b border-gray-800">
                <h3 className="text-white text-xs uppercase tracking-wider font-bold text-center">Stat Comparison</h3>
              </div>
              <div className="divide-y divide-gray-800/50">
                {stats(f1Data).map((s, i) => {
                  const f1Val = s.value;
                  const f2Val = stats(f2Data)[i]?.value || 'N/A';
                  const f1Num = parseFloat(f1Val);
                  const f2Num = parseFloat(f2Val);
                  const isNum = !isNaN(f1Num) && !isNaN(f2Num) && !['Record', 'Stance', 'Country', 'Weight Class'].includes(s.label);
                  return (
                    <div key={s.label} className="grid grid-cols-3 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors group">
                      <div className="text-right">
                        <span className={`text-sm font-bold ${isNum && f1Num > f2Num ? 'text-ufc-red' : 'text-white'}`}>{f1Val}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">{s.label}</span>
                        {isNum && f1Num !== f2Num && (
                          <div className="mt-1.5 flex items-center gap-1 justify-center">
                            <div className={`h-1 rounded-full transition-all duration-500 ${f1Num > f2Num ? 'bg-ufc-red' : 'bg-gray-700'}`} style={{ width: `${Math.min(100, (f1Num / Math.max(f1Num, f2Num)) * 40)}px` }} />
                            <div className={`h-1 rounded-full transition-all duration-500 ${f2Num > f1Num ? 'bg-ufc-red' : 'bg-gray-700'}`} style={{ width: `${Math.min(100, (f2Num / Math.max(f1Num, f2Num)) * 40)}px` }} />
                          </div>
                        )}
                      </div>
                      <div className="text-left">
                        <span className={`text-sm font-bold ${isNum && f2Num > f1Num ? 'text-ufc-red' : 'text-white'}`}>{f2Val}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Link
                href={`/fighter/${f1Id}`}
                className="inline-flex items-center gap-1 text-ufc-red text-xs hover:text-red-300 transition border border-ufc-red/30 rounded-full px-4 py-2 hover:bg-ufc-red/10"
              >
                {f1Data.name} profile →
              </Link>
              <span className="text-gray-700 text-[10px]">|</span>
              <Link
                href={`/fighter/${f2Id}`}
                className="inline-flex items-center gap-1 text-ufc-red text-xs hover:text-red-300 transition border border-ufc-red/30 rounded-full px-4 py-2 hover:bg-ufc-red/10"
              >
                {f2Data.name} profile →
              </Link>
            </div>
          </div>
        )}

        {!f1Data || !f2Data ? (
          <div className="text-center py-16 bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl card-hover">
            <svg className="w-16 h-16 text-gray-800 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            <p className="text-gray-500 text-sm">Search and select two fighters above to compare their stats.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function HeadToHeadPage() {
  return (
    <Suspense fallback={
      <div className="bg-[#0a0a0a] min-h-screen pt-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-ufc-red border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 text-xs uppercase tracking-wider">Loading...</span>
        </div>
      </div>
    }>
      <HeadToHeadContent />
    </Suspense>
  );
}

function FighterSelector({ side, search, setSearch, results, loading, selected, showSearch, setShowSearch, onSelect, placeholder }: {
  side: 1 | 2;
  search: string;
  setSearch: (v: string) => void;
  results: any[];
  loading: boolean;
  selected: any;
  showSearch: boolean;
  setShowSearch: (v: boolean) => void;
  onSelect: (a: any) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-5 card-hover">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-2 h-2 rounded-full ${side === 1 ? 'bg-ufc-red' : 'bg-ufc-gold'}`} />
          <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">
            {side === 1 ? 'Fighter 1' : 'Fighter 2'}
          </p>
        </div>

        {selected && !showSearch ? (
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full bg-gray-800 overflow-hidden ring-2 ring-gray-700 flex-shrink-0 group">
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-ufc-red/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {selected.image ? (
                <img src={selected.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-lg font-bold">
                  {selected.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">{selected.name}</p>
              <p className="text-gray-500 text-[10px]">{selected.record || 'N/A'} · {selected.weightClass || 'N/A'}</p>
            </div>
            <button onClick={() => { setShowSearch(true); setSearch(''); }} className="text-gray-500 hover:text-white text-xs p-1 transition hover:bg-white/10 rounded-full w-6 h-6 flex items-center justify-center">
              ✕
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              autoFocus
              className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 transition-all"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-ufc-red border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {(results.length > 0 || search.length >= 2) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden shadow-2xl z-10 max-h-60 overflow-y-auto">
                {results.length === 0 && search.length >= 2 && !loading ? (
                  <p className="text-gray-500 text-xs text-center py-4">No fighters found</p>
                ) : (
                  results.slice(0, 10).map((a: any) => (
                    <button
                      key={a.id}
                      onClick={() => onSelect(a)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
                        {a.image ? (
                          <img src={a.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-bold">{a.name.charAt(0)}</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-semibold truncate">{a.name}</p>
                        <p className="text-gray-500 text-[10px]">{a.record || ''} · {a.weightClass || ''}</p>
                      </div>
                      {a.flag && <img src={a.flag} alt="" className="w-4 h-3 flex-shrink-0" />}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FighterAvatar({ athlete }: { athlete: any }) {
  return (
    <div className="text-center group">
      <div className="relative w-20 h-20 md:w-28 md:h-28 mx-auto">
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-ufc-red/20 to-transparent blur-xl group-hover:blur-2xl transition-all" />
        <div className="relative w-full h-full rounded-full bg-gray-900 overflow-hidden border-2 border-gray-700 group-hover:border-ufc-red/30 transition-all">
          {athlete.image ? (
            <img src={athlete.image} alt={athlete.name} className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-ufc-red/30 to-gray-800 flex items-center justify-center text-white font-bold text-2xl">
              {athlete.name.charAt(0)}
            </div>
          )}
        </div>
      </div>
      <p className="text-white text-sm font-bold mt-2 group-hover:text-ufc-red transition-colors">{athlete.name}</p>
    </div>
  );
}
