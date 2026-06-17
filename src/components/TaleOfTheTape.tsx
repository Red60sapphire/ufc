interface TaleProps {
  fighter1: string;
  fighter2: string;
  fighter1Img?: string;
  fighter2Img?: string;
  fighter1Record?: string;
  fighter2Record?: string;
}

export default function TaleOfTheTape({ fighter1, fighter2, fighter1Img, fighter2Img, fighter1Record, fighter2Record }: TaleProps) {
  const stats = [
    { label: 'Record', f1: fighter1Record || 'N/A', f2: fighter2Record || 'N/A' },
    { label: 'Height', f1: "6'4\"", f2: "5'11\"" },
    { label: 'Reach', f1: '80"', f2: '73"' },
    { label: 'Weight', f1: '185 lbs', f2: '185 lbs' },
    { label: 'Age', f1: '35', f2: '40' },
    { label: 'Stance', f1: 'Switch', f2: 'Orthodox' },
  ];

  return (
    <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-xl overflow-hidden card-hover">
      <div className="bg-gradient-to-r from-ufc-red/10 to-transparent px-4 py-3 border-b border-gray-800">
        <h3 className="text-ufc-red text-xs uppercase tracking-wider font-semibold">Tale of the Tape</h3>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-800/50">
          <div className="flex flex-col items-center flex-1">
            <div className="relative w-14 h-14 rounded-full bg-gray-800 overflow-hidden border-2 border-gray-700 mb-2 ring-1 ring-white/10">
              {fighter1Img ? (
                <img src={fighter1Img} alt={fighter1} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                  {fighter1.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-white text-xs font-bold text-center leading-tight">{fighter1.split(' ').pop()}</span>
          </div>
          <div className="flex-shrink-0 mx-3 text-center">
            <div className="w-10 h-10 rounded-full bg-ufc-red/10 border border-ufc-red/20 flex items-center justify-center">
              <span className="text-ufc-red text-sm font-black">VS</span>
            </div>
          </div>
          <div className="flex flex-col items-center flex-1">
            <div className="relative w-14 h-14 rounded-full bg-gray-800 overflow-hidden border-2 border-gray-700 mb-2 ring-1 ring-white/10">
              {fighter2Img ? (
                <img src={fighter2Img} alt={fighter2} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                  {fighter2.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-white text-xs font-bold text-center leading-tight">{fighter2.split(' ').pop()}</span>
          </div>
        </div>
        <div className="space-y-1.5">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center py-2 px-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <span className="text-gray-300 text-xs font-medium text-center w-[30%]">{stat.f1}</span>
              <span className="text-gray-500 text-[9px] uppercase tracking-wider text-center w-[40%]">{stat.label}</span>
              <span className="text-gray-300 text-xs font-medium text-center w-[30%]">{stat.f2}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
