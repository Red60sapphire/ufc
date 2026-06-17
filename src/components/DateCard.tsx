'use client';

export default function DateCard({ dateStr }: { dateStr: string }) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = d.getDate();
  const year = d.getFullYear();
  return (
    <div className="flex flex-col items-center w-[52px] flex-shrink-0 rounded-lg overflow-hidden border border-gray-800">
      <div className="w-full bg-[#d20a0a] text-white text-[9px] font-bold text-center py-1 uppercase leading-none">
        {month}
      </div>
      <div className="w-full bg-[#1a1a1a] text-center py-1.5 leading-none">
        <div className="text-white text-sm font-bold">{day}</div>
        <div className="text-[9px] text-gray-500">{year}</div>
      </div>
    </div>
  );
}
