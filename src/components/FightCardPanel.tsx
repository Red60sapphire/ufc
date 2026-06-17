'use client';

import { useState } from 'react';

interface Fight {
  fighter1: string;
  fighter2: string;
  weight_class?: string;
  fighter1_record?: string;
  fighter2_record?: string;
}

interface FightCardPanelProps {
  fights: Fight[];
}

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

  return (
    <div className="bg-[#111] border border-gray-800 rounded-lg overflow-hidden">
      <div className="bg-[#1a1a1a] px-4 py-3 border-b border-gray-800">
        <h2 className="text-white text-sm uppercase tracking-wider font-bold">Fight Card</h2>
      </div>

      <div className="flex border-b border-gray-800">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 px-3 py-3 text-xs uppercase tracking-wider font-semibold transition ${
              tab === t.key ? 'bg-ufc-red text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {t.label} <span className="opacity-60">({t.count})</span>
          </button>
        ))}
      </div>

      <div className="divide-y divide-gray-800">
        {visible.map((fight, i) => (
          <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-[#1a1a1a] transition">
            <div className="flex flex-col items-center flex-1">
              <span className="text-white text-sm font-semibold text-center">{fight.fighter1}</span>
              <span className="text-gray-500 text-xs">{fight.fighter1_record}</span>
            </div>
            <div className="mx-3 px-3">
              <span className="text-ufc-red text-xs font-bold">VS</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-white text-sm font-semibold text-center">{fight.fighter2}</span>
              <span className="text-gray-500 text-xs">{fight.fighter2_record}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
