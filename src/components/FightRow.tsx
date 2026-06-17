'use client';

import { useState } from 'react';
import Link from 'next/link';
import DateCard from './DateCard';

export default function FightRow({ fight, index }: { fight: any; index: number }) {
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [img1Error, setImg1Error] = useState(false);
  const [img2Error, setImg2Error] = useState(false);

  const title = fight.title || `${fight.fighter1} vs ${fight.fighter2}`;
  const slug = fight.slug || fight.id;

  const handleShare = async () => {
    const url = `${window.location.origin}/replays/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const isEven = index % 2 === 0;

  return (
    <div className={`flex items-center gap-2 md:gap-3 px-2 md:px-4 py-2.5 ${isEven ? 'bg-black/40' : 'bg-white/[0.02]'} hover:bg-white/[0.04] transition-colors border-b border-white/[0.03] group`}>
      <Link href={`/replays/${slug}`} className="flex flex-1 items-center gap-2 md:gap-3 min-w-0">
        <div className="w-5 flex-shrink-0 text-center">
          <span className="text-[10px] text-gray-600 font-mono">{index + 1}</span>
        </div>

        <div className="flex items-center gap-2 flex-[2] min-w-0">
          <div className="flex flex-col items-end text-right flex-1 min-w-0">
            <span className="text-[13px] text-[#e67e22] font-semibold leading-tight truncate max-w-full">{fight.fighter1}</span>
          </div>
          <div className="flex-shrink-0 w-7 h-7 rounded-full overflow-hidden border border-gray-700 bg-gray-900">
            {fight.fighter1_img && !img1Error ? (
              <img src={fight.fighter1_img} alt="" className="w-full h-full object-cover" onError={() => setImg1Error(true)} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-600 font-bold">{fight.fighter1?.charAt(0)}</div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center w-[46px] flex-shrink-0">
          <div className="bg-[#d20a0a] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm leading-none">VS</div>
          {fight.weight_class && (
            <span className="text-[8px] text-gray-500 mt-0.5 leading-tight text-center truncate max-w-full">{fight.weight_class}</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-[2] min-w-0">
          <div className="flex-shrink-0 w-7 h-7 rounded-full overflow-hidden border border-gray-700 bg-gray-900">
            {fight.fighter2_img && !img2Error ? (
              <img src={fight.fighter2_img} alt="" className="w-full h-full object-cover" onError={() => setImg2Error(true)} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-600 font-bold">{fight.fighter2?.charAt(0)}</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[13px] text-[#e67e22] font-semibold leading-tight truncate max-w-full block">{fight.fighter2}</span>
          </div>
        </div>

        <div className="hidden md:block w-28 flex-shrink-0 text-center">
          {!spoilerRevealed ? (
            <button
              onClick={(e) => { e.preventDefault(); setSpoilerRevealed(true); }}
              className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors cursor-pointer bg-transparent border-none"
            >
              Spoiler hidden <span className="text-gray-600">👁</span>
            </button>
          ) : (
            <span className="text-[10px] text-gray-300">{fight.result || '—'}</span>
          )}
        </div>

        <div className="hidden sm:block w-8 flex-shrink-0 text-center">
          <span className="text-[11px] text-gray-400">{fight.round || '—'}</span>
        </div>

        <div className="hidden sm:block w-14 flex-shrink-0 text-center">
          <span className="text-[11px] text-gray-400">{fight.fight_time || '—'}</span>
        </div>

        <div className="hidden md:block w-32 flex-shrink-0 text-center">
          <span className="text-[10px] text-gray-500 truncate block">{fight.event_name || ''}</span>
        </div>
      </Link>

      <div className="flex-shrink-0 flex items-center gap-1">
        <DateCard dateStr={fight.event_date} />

        <button
          onClick={handleShare}
          className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 text-gray-500 hover:text-white"
          title="Copy link"
        >
          {copied ? (
            <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          )}
        </button>
      </div>
    </div>
  );
}
