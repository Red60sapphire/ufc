'use client';

import { useRef } from 'react';
import ReplayCard from './ReplayCard';

interface ReplayRowProps {
  title: string;
  replays: any[];
  icon?: string;
}

export default function ReplayRow({ title, replays, icon }: ReplayRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!rowRef.current) return;
    const dist = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({ left: dir === 'left' ? -dist : dist, behavior: 'smooth' });
  };

  if (replays.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        {icon && <span className="text-base">{icon}</span>}
        <h2 className="text-white text-sm md:text-base font-bold uppercase tracking-wider">{title}</h2>
        <span className="text-gray-600 text-xs">({replays.length})</span>
      </div>
      <div className="relative group/row">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 w-10 md:w-12 bg-gradient-to-r from-[#0a0a0a] to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-start pl-1 cursor-pointer"
          aria-label="Scroll left"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div
          ref={rowRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-1"
        >
          {replays.map((r: any) => (
            <ReplayCard key={r.id} replay={r} />
          ))}
        </div>
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 w-10 md:w-12 bg-gradient-to-l from-[#0a0a0a] to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-end pr-1 cursor-pointer"
          aria-label="Scroll right"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </section>
  );
}
