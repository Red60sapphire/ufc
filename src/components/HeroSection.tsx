interface HeroProps {
  mainEvent: {
    fighter1: string;
    fighter2: string;
    fighter1Img: string;
    fighter2Img: string;
    fighter1Record: string;
    fighter2Record: string;
    weightClass: string;
    date: string;
    venue: string;
  };
}

export default function HeroSection({ mainEvent }: HeroProps) {
  const f1Short = mainEvent.fighter1.split(' ').pop() || mainEvent.fighter1;
  const f2Short = mainEvent.fighter2.split(' ').pop() || mainEvent.fighter2;

  return (
    <div className="relative hero-gradient border border-gray-800/50 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(210,10,10,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,168,67,0.05),transparent_50%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ufc-red/50 to-transparent" />

      <div className="relative px-6 py-10 md:py-16">
        <div className="text-center mb-6">
          <span className="inline-block bg-ufc-red/10 text-ufc-red text-[10px] uppercase tracking-[0.2em] font-semibold px-4 py-1.5 rounded-full border border-ufc-red/20 mb-3">
            Main Event
          </span>
          <h1 className="text-ufc-gold text-xs md:text-sm uppercase tracking-[0.3em] font-medium">{mainEvent.weightClass}</h1>
        </div>

        <div className="flex items-center justify-center gap-4 md:gap-12">
          <div className="text-center flex-1 max-w-[200px] group">
            <div className="relative w-28 h-28 md:w-44 md:h-44 mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-ufc-red/30 to-transparent blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative w-full h-full rounded-full bg-gray-900 overflow-hidden border-2 border-gray-700 group-hover:border-ufc-red/50 transition-all duration-300 ring-1 ring-white/10">
                {mainEvent.fighter1Img ? (
                  <img src={mainEvent.fighter1Img} alt={mainEvent.fighter1} className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-ufc-red/30 to-gray-800 flex items-center justify-center text-white font-bold text-3xl">
                    {f1Short.charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-full border border-gray-700 whitespace-nowrap">
                {mainEvent.fighter1Record}
              </div>
            </div>
            <p className="text-white font-bold text-sm md:text-xl mt-4 group-hover:text-ufc-red transition-colors">
              {mainEvent.fighter1.includes(' ') ? (
                <>{mainEvent.fighter1.split(' ')[0]} <span className="text-ufc-red">{mainEvent.fighter1.split(' ').slice(1).join(' ')}</span></>
              ) : mainEvent.fighter1}
            </p>
          </div>

          <div className="flex-shrink-0 text-center">
            <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-full bg-[#1a0000] border-2 border-ufc-red/30 flex items-center justify-center animate-[ringPulse_3s_ease-in-out_infinite]">
              <div className="absolute inset-0 rounded-full bg-ufc-red/10 animate-ping" style={{ animationDuration: '3s' }} />
              <span className="relative text-ufc-red text-2xl md:text-4xl font-black tracking-tighter">VS</span>
            </div>
            <p className="text-ufc-gold text-[8px] md:text-xs uppercase tracking-[0.2em] mt-2 font-semibold opacity-70">Fight Night</p>
          </div>

          <div className="text-center flex-1 max-w-[200px] group">
            <div className="relative w-28 h-28 md:w-44 md:h-44 mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-ufc-red/30 to-transparent blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative w-full h-full rounded-full bg-gray-900 overflow-hidden border-2 border-gray-700 group-hover:border-ufc-red/50 transition-all duration-300 ring-1 ring-white/10">
                {mainEvent.fighter2Img ? (
                  <img src={mainEvent.fighter2Img} alt={mainEvent.fighter2} className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-ufc-red/30 to-gray-800 flex items-center justify-center text-white font-bold text-3xl">
                    {f2Short.charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-full border border-gray-700 whitespace-nowrap">
                {mainEvent.fighter2Record}
              </div>
            </div>
            <p className="text-white font-bold text-sm md:text-xl mt-4 group-hover:text-ufc-red transition-colors">
              {mainEvent.fighter2.includes(' ') ? (
                <>{mainEvent.fighter2.split(' ')[0]} <span className="text-ufc-red">{mainEvent.fighter2.split(' ').slice(1).join(' ')}</span></>
              ) : mainEvent.fighter2}
            </p>
          </div>
        </div>

        <div className="text-center mt-8 md:mt-10 space-y-3">
          <div className="flex items-center justify-center gap-4 text-gray-400 text-xs md:text-sm">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-ufc-red" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {new Date(mainEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-gray-600">|</span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-ufc-red" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {mainEvent.venue || 'TBA'}
            </span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <button className="group relative bg-ufc-red text-white px-8 py-3 text-sm uppercase tracking-[0.15em] font-bold rounded-full hover:bg-red-700 transition-all duration-300 shadow-lg shadow-red-900/30 hover:shadow-red-900/50 overflow-hidden">
              <span className="relative z-10">Watch Live</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
            <button className="relative border border-gray-600 text-gray-300 px-8 py-3 text-sm uppercase tracking-[0.15em] rounded-full hover:bg-white/5 hover:border-gray-500 transition-all duration-300 overflow-hidden group">
              <span className="relative z-10">Full Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
