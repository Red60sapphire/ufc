'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FightPollProps {
  fighter1: string;
  fighter2: string;
  fighter1Img: string;
  fighter2Img: string;
  fighter1Record: string;
  fighter2Record: string;
  f1Id?: string;
  f2Id?: string;
  weightClass?: string;
}

const STORAGE_KEY = 'ufc_poll_vote';

export default function FightPoll({
  fighter1, fighter2, fighter1Img, fighter2Img,
  fighter1Record, fighter2Record, f1Id, f2Id, weightClass,
}: FightPollProps) {
  const [voted, setVoted] = useState<string | null>(null);
  const [results, setResults] = useState({ f1: 0, f2: 0, total: 0 });
  const [anim, setAnim] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.fighter1 === fighter1 && parsed.fighter2 === fighter2) {
          setVoted(parsed.vote);
          setResults(parsed.results || { f1: 0, f2: 0, total: 0 });
        }
      } catch {}
    }
    setTimeout(() => setAnim(true), 300);
  }, [fighter1, fighter2]);

  function handleVote(fighter: 'f1' | 'f2') {
    if (voted) return;
    setVoted(fighter);
    const newResults = { ...results };
    if (fighter === 'f1') newResults.f1 += 1;
    else newResults.f2 += 1;
    newResults.total += 1;
    setResults(newResults);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      vote: fighter, fighter1, fighter2, results: newResults,
    }));
  }

  function getPct(val: number) {
    if (results.total === 0) return 50;
    return Math.round((val / results.total) * 100);
  }

  if (!mounted) return null;

  const f1Pct = getPct(results.f1);
  const f2Pct = getPct(results.f2);

  return (
    <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800/60 rounded-2xl overflow-hidden card-hover">
      <div className="bg-gradient-to-r from-ufc-red/10 to-transparent px-5 py-4 border-b border-gray-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-ufc-red rounded-full" />
          <h3 className="text-ufc-red text-xs uppercase tracking-wider font-semibold">Who will win?</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-[10px] font-medium">Total Votes : {results.total}</span>
          <span className="text-gray-600 text-[9px]">{weightClass?.split(' ')[0] || ''}</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleVote('f1')}
            disabled={!!voted}
            className={`flex-1 group relative rounded-xl p-4 transition-all duration-300 ${
              voted === 'f1'
                ? 'bg-ufc-red/10 border-2 border-ufc-red'
                : voted
                  ? 'bg-white/[0.02] border border-gray-800/60 opacity-50 cursor-default'
                  : 'bg-white/[0.02] border border-gray-800/60 hover:border-ufc-red/50 hover:bg-ufc-red/5 cursor-pointer'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-2 ring-gray-700">
                {fighter1Img ? (
                  <img src={fighter1Img} alt={fighter1} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-ufc-red/30 to-gray-800 flex items-center justify-center text-white font-bold text-xl">{fighter1.charAt(0)}</div>
                )}
                {voted === 'f1' && (
                  <div className="absolute inset-0 bg-ufc-red/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                )}
              </div>
              <p className="text-white text-xs font-bold truncate max-w-full">{fighter1}</p>
              <p className="text-gray-500 text-[9px]">{fighter1Record}</p>
            </div>
            {voted && (
              <div className="mt-3 text-center">
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-ufc-red to-red-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${anim ? f1Pct : 0}%` }} />
                </div>
                <p className="text-white text-lg font-black mt-1">{results.f1}</p>
              </div>
            )}
          </button>

          <div className="flex-shrink-0 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-b from-[#1a0000] to-[#0d0000] border border-ufc-red/20 flex items-center justify-center">
              <span className="text-ufc-red text-sm md:text-base font-black">VS</span>
            </div>
          </div>

          <button
            onClick={() => handleVote('f2')}
            disabled={!!voted}
            className={`flex-1 group relative rounded-xl p-4 transition-all duration-300 ${
              voted === 'f2'
                ? 'bg-ufc-red/10 border-2 border-ufc-red'
                : voted
                  ? 'bg-white/[0.02] border border-gray-800/60 opacity-50 cursor-default'
                  : 'bg-white/[0.02] border border-gray-800/60 hover:border-ufc-red/50 hover:bg-ufc-red/5 cursor-pointer'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-2 ring-gray-700">
                {fighter2Img ? (
                  <img src={fighter2Img} alt={fighter2} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-ufc-red/30 to-gray-800 flex items-center justify-center text-white font-bold text-xl">{fighter2.charAt(0)}</div>
                )}
                {voted === 'f2' && (
                  <div className="absolute inset-0 bg-ufc-red/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                )}
              </div>
              <p className="text-white text-xs font-bold truncate max-w-full">{fighter2}</p>
              <p className="text-gray-500 text-[9px]">{fighter2Record}</p>
            </div>
            {voted && (
              <div className="mt-3 text-center">
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-ufc-red to-red-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${anim ? f2Pct : 0}%` }} />
                </div>
                <p className="text-white text-lg font-black mt-1">{results.f2}</p>
              </div>
            )}
          </button>
        </div>

        {!voted && (
          <div className="text-center mt-5">
            <p className="text-gray-500 text-[10px] uppercase tracking-wider">Tap a fighter to cast your vote</p>
          </div>
        )}

        {voted && (
          <div className="text-center mt-4 pt-3 border-t border-gray-800/40">
            <p className="text-gray-500 text-[10px]">You voted for {voted === 'f1' ? fighter1 : fighter2}</p>
          </div>
        )}

        {f1Id && f2Id && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <Link href={`/fighter/${f1Id}`} className="text-gray-600 hover:text-gray-400 text-[9px] uppercase tracking-wider transition-colors">
              {fighter1.split(' ').pop()}
            </Link>
            <span className="text-gray-800">|</span>
            <Link href={`/fighter/${f2Id}`} className="text-gray-600 hover:text-gray-400 text-[9px] uppercase tracking-wider transition-colors">
              {fighter2.split(' ').pop()}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
