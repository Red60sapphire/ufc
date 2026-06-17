'use client';

import { useState, useEffect } from 'react';

export default function EventCountdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const target = new Date(targetDate).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!mounted) return null;

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center gap-3 md:gap-4">
      {units.map((u) => (
        <div key={u.label} className="text-center">
          <div className="bg-white/[0.05] border border-gray-800/50 rounded-xl px-3 py-2 md:px-4 md:py-3 min-w-[48px] md:min-w-[60px]">
            <span className="text-lg md:text-2xl font-bold text-white tabular-nums">
              {String(u.value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-gray-500 text-[8px] md:text-[10px] uppercase tracking-wider mt-1 block">{u.label}</span>
        </div>
      ))}
    </div>
  );
}
