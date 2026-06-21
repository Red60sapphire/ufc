'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import VideoPlayer from '@/components/VideoPlayer';
import ReplayRow from '@/components/ReplayRow';

export default function ReplayDetailClient({ replay, related }: { replay: any; related: any[] }) {
  const [img1Failed, setImg1Failed] = useState(false);
  const [img2Failed, setImg2Failed] = useState(false);

  useEffect(() => {
    fetch('/api/replays/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: replay.id }),
    }).catch(() => {});
  }, [replay.id]);

  const title = replay.title || `${replay.fighter1} vs ${replay.fighter2}`;

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link href="/replays" className="inline-flex items-center gap-1.5 text-gray-500 text-xs hover:text-white transition group mb-4">
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Replays
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <VideoPlayer src={replay.video_url} poster={replay.thumbnail} />

            <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h1 className="text-white text-lg md:text-xl font-bold uppercase">{title}</h1>
                  {replay.event_name && (
                    <p className="text-gray-400 text-sm mt-0.5">
                      {replay.event_name}
                      {replay.event_date ? <> · <span className="text-gray-500">{new Date(replay.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></> : ''}
                    </p>
                  )}
                </div>
                {replay.promotion && (
                  <span className="flex-shrink-0 bg-ufc-red/10 text-ufc-red text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-ufc-red/20">
                    {replay.promotion}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 md:gap-6 p-4 bg-white/[0.03] border border-gray-800/50 rounded-xl">
                <div className="text-center flex-1">
                  <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-gray-800 mx-auto overflow-hidden border-2 border-gray-700 shadow-lg">
                    {replay.fighter1_img && !img1Failed ? (
                      <img src={replay.fighter1_img} alt={replay.fighter1} className="w-full h-full object-cover" onError={() => setImg1Failed(true)} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-ufc-red/20 to-gray-800 flex items-center justify-center text-white font-bold text-lg">
                        {replay.fighter1?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <p className="text-white text-xs font-semibold mt-1.5">{replay.fighter1}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-ufc-red/10 border-2 border-ufc-red/20 flex items-center justify-center">
                    <span className="text-ufc-red text-sm md:text-lg font-black">VS</span>
                  </div>
                </div>
                <div className="text-center flex-1">
                  <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-gray-800 mx-auto overflow-hidden border-2 border-gray-700 shadow-lg">
                    {replay.fighter2_img && !img2Failed ? (
                      <img src={replay.fighter2_img} alt={replay.fighter2} className="w-full h-full object-cover" onError={() => setImg2Failed(true)} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-ufc-red/20 to-gray-800 flex items-center justify-center text-white font-bold text-lg">
                        {replay.fighter2?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <p className="text-white text-xs font-semibold mt-1.5">{replay.fighter2}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {[
                  { label: 'Weight Class', value: replay.weight_class },
                  { label: 'Result', value: replay.result },
                  { label: 'Duration', value: replay.duration },
                  { label: 'Views', value: `${replay.views || 0}` },
                ].filter(s => s.value).map(s => (
                  <div key={s.label} className="bg-white/[0.03] border border-gray-800/50 rounded-xl px-3 py-2.5 text-center">
                    <p className="text-gray-500 text-[9px] uppercase tracking-wider">{s.label}</p>
                    <p className="text-white text-xs font-semibold mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>

              {replay.description && (
                <p className="text-gray-400 text-sm mt-4 leading-relaxed border-t border-gray-800/50 pt-4">{replay.description}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {replay.result && (
              <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-5 text-center">
                <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">Fight Result</p>
                <p className="text-white text-sm font-bold">{replay.result}</p>
              </div>
            )}

            <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-5">
              <h3 className="text-white text-xs uppercase tracking-wider font-semibold mb-3">Fight Details</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Event', value: replay.event_name || replay.event },
                  { label: 'Date', value: replay.event_date ? new Date(replay.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null },
                  { label: 'Promotion', value: replay.promotion },
                  { label: 'Weight Class', value: replay.weight_class },
                  { label: 'Duration', value: replay.duration },
                ].filter(s => s.value).map(s => (
                  <div key={s.label} className="flex justify-between items-center">
                    <span className="text-gray-500 text-[10px] uppercase tracking-wider">{s.label}</span>
                    <span className="text-white text-xs font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {replay.fighter1 && replay.fighter2 && (
              <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-5">
                <h3 className="text-white text-xs uppercase tracking-wider font-semibold mb-3">Fighters</h3>
                <div className="space-y-2">
                  {[replay.fighter1, replay.fighter2].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-3 py-2.5">
                      <div className="w-8 h-8 rounded-full bg-ufc-red/20 flex items-center justify-center text-ufc-red text-xs font-bold">{f.charAt(0)}</div>
                      <span className="text-white text-xs font-medium">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-10">
            <ReplayRow title="More Replays" replays={related} />
          </div>
        )}
      </div>
    </div>
  );
}
