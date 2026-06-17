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
            <div className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
                {(fight.fighter1Img) ? (
                  <img src={fight.fighter1Img} alt={fight.fighter1} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-[10px] font-bold">
                    {fight.fighter1.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <span className="text-white text-sm font-semibold block text-left">{fight.fighter1}</span>
                <span className="text-gray-500 text-xs">{fight.fighter1Record || fight.fighter1_record}</span>
              </div>
            </div>
            <div className="mx-3 px-3">
              <span className="text-ufc-red text-xs font-bold">VS</span>
            </div>
            <div className="flex items-center gap-2 flex-1 justify-end text-right">
              <div>
                <span className="text-white text-sm font-semibold block text-right">{fight.fighter2}</span>
                <span className="text-gray-500 text-xs">{fight.fighter2Record || fight.fighter2_record}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
                {(fight.fighter2Img) ? (
                  <img src={fight.fighter2Img} alt={fight.fighter2} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-[10px] font-bold">
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
