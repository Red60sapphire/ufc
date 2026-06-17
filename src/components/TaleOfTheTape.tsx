interface TaleProps {
  fighter1: string;
  fighter2: string;
}

export default function TaleOfTheTape({ fighter1, fighter2 }: TaleProps) {
  const stats = [
    { label: 'Record', f1: '25-3-0', f2: '17-6-0' },
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
        <span className="text-white text-sm font-bold text-center flex-1">{fighter1}</span>
        <span className="text-ufc-gold text-xs font-bold mx-2">VS</span>
        <span className="text-white text-sm font-bold text-center flex-1">{fighter2}</span>
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
