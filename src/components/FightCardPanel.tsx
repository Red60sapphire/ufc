'use client';

import { useState } from 'react';

interface Fight {
  fighter1: string;
  fighter2: string;
  weight_class?: string;
  fighter1_record?: string;
  fighter2_record?: string;
  fighter1Record?: string;
  fighter2Record?: string;
  fighter1Img?: string;
  fighter2Img?: string;
}

interface FightCardPanelProps {
  fights: Fight[];
}

const weightClassColors: Record<string, string> = {
  'Middleweight': 'border-l-blue-500',
  'Light Heavyweight': 'border-l-purple-500',
  'Heavyweight': 'border-l-red-500',
  'Welterweight': 'border-l-green-500',
  'Lightweight': 'border-l-yellow-500',
  'Featherweight': 'border-l-orange-500',
  'Bantamweight': 'border-l-cyan-500',
  'Flyweight': 'border-l-pink-500',
  "Women's Strawweight": 'border-l-rose-500',
  "Women's Flyweight": 'border-l-fuchsia-500',
  "Women's Bantamweight": 'border-l-violet-500',
};

export default function FightCardPanel({ fights }: FightCardPanelProps) {
  const [tab, setTab] = useState<'main' | 'prelims' | 'early'>('main');

  const tabs = [
    { key: 'main' as const, label: 'Main Card', count: Math.min(fights.length, 5) },
    { key: 'prelims' as const, label: 'Prelims', count: Math.min(Math.max(fights.length - 5, 0), 4) },
    { key: 'early' as const, label: 'Early Prelims', count: Math.max(fights.length - 9, 0) },
  ];

  const sliceMap = { main: [0, 5], prelims: [5, 9], early: [9, 999] };
  const [start, end] = sliceMap[tab];
  const visible = fights.slice(start, end);

  if (fights.length === 0) return null;

  return (
    <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden card-hover">
      <div className="bg-gradient-to-r from-ufc-red/10 to-transparent px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-white text-sm uppercase tracking-wider font-bold">Fight Card</h2>
        <span className="text-gray-500 text-xs">{fights.length} fights</span>
      </div>

      <div className="flex border-b border-gray-800">
        {tabs.filter(t => t.count > 0).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 px-3 py-3 text-xs uppercase tracking-wider font-semibold transition-all duration-300 relative ${
              tab === t.key ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.label}
            <span className="ml-1 opacity-60">({t.count})</span>
            {tab === t.key && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-ufc-red rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="divide-y divide-gray-800/80">
        {visible.map((fight, i) => (
          <div key={i} className="fight-card-bg px-4 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-all duration-200 group">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-800 overflow-hidden flex-shrink-0 ring-2 ring-gray-700 group-hover:ring-ufc-red/30 transition-all duration-300">
                {fight.fighter1Img ? (
                  <img src={fight.fighter1Img} alt={fight.fighter1} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-bold">
                    {fight.fighter1.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-white text-sm font-semibold block truncate">{fight.fighter1}</span>
                <span className="text-gray-500 text-[10px]">{fight.fighter1Record || fight.fighter1_record}</span>
              </div>
            </div>

            <div className="flex-shrink-0 mx-4 flex flex-col items-center">
              <span className="text-ufc-red text-[10px] font-black tracking-wider">VS</span>
              {fight.weight_class && (
                <span className="text-[8px] text-gray-500 uppercase tracking-wider mt-0.5 hidden md:block">{fight.weight_class}</span>
              )}
            </div>

            <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
              <div className="min-w-0 text-right">
                <span className="text-white text-sm font-semibold block truncate">{fight.fighter2}</span>
                <span className="text-gray-500 text-[10px]">{fight.fighter2Record || fight.fighter2_record}</span>
              </div>
              <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-800 overflow-hidden flex-shrink-0 ring-2 ring-gray-700 group-hover:ring-ufc-red/30 transition-all duration-300">
                {fight.fighter2Img ? (
                  <img src={fight.fighter2Img} alt={fight.fighter2} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-bold">
                    {fight.fighter2.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
