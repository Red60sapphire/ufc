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
    <div className="bg-[#111] border border-gray-800 rounded-lg p-4">
      <h3 className="text-ufc-red text-sm uppercase tracking-wider font-semibold mb-3">Tale of the Tape</h3>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
        <div className="flex flex-col items-center flex-1">
          <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden border border-gray-700 mb-1">
            {fighter1Img ? (
              <img src={fighter1Img} alt={fighter1} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-sm">
                {fighter1.charAt(0)}
              </div>
            )}
          </div>
          <span className="text-white text-xs font-bold text-center">{fighter1}</span>
        </div>
        <span className="text-ufc-gold text-xs font-bold mx-2">VS</span>
        <div className="flex flex-col items-center flex-1">
          <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden border border-gray-700 mb-1">
            {fighter2Img ? (
              <img src={fighter2Img} alt={fighter2} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-sm">
                {fighter2.charAt(0)}
              </div>
            )}
          </div>
          <span className="text-white text-xs font-bold text-center">{fighter2}</span>
        </div>
      </div>
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center py-2 border-b border-gray-800/50 last:border-0">
          <span className="text-gray-400 text-xs text-center w-[30%]">{stat.f1}</span>
          <span className="text-gray-500 text-[10px] uppercase text-center w-[40%]">{stat.label}</span>
          <span className="text-gray-400 text-xs text-center w-[30%]">{stat.f2}</span>
        </div>
      ))}
    </div>
  );
}
