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
  return (
    <div className="relative bg-gradient-to-b from-[#1a0000] to-[#0a0a0a] border border-gray-800 rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(210,10,10,0.15),transparent_70%)]" />
      <div className="relative px-6 py-8 md:py-12">
        <div className="flex items-center justify-center gap-4 md:gap-8">
          <div className="text-center flex-1">
            <div className="w-24 h-24 md:w-36 md:h-36 rounded-full bg-gray-800 mx-auto overflow-hidden border-2 border-gray-700">
              <div className="w-full h-full bg-gradient-to-br from-ufc-red/20 to-gray-800 flex items-center justify-center text-white font-bold text-lg md:text-2xl">
                {mainEvent.fighter1.split(' ').map((n: string) => n[0]).join('')}
              </div>
            </div>
            <p className="text-white font-bold text-sm md:text-lg mt-3">{mainEvent.fighter1}</p>
            <p className="text-gray-400 text-xs">{mainEvent.fighter1Record}</p>
          </div>

          <div className="text-center">
            <div className="text-ufc-red text-4xl md:text-6xl font-black tracking-tighter">VS</div>
            <p className="text-ufc-gold text-xs md:text-sm uppercase mt-2 font-semibold">{mainEvent.weightClass}</p>
          </div>

          <div className="text-center flex-1">
            <div className="w-24 h-24 md:w-36 md:h-36 rounded-full bg-gray-800 mx-auto overflow-hidden border-2 border-gray-700">
              <div className="w-full h-full bg-gradient-to-br from-ufc-red/20 to-gray-800 flex items-center justify-center text-white font-bold text-lg md:text-2xl">
                {mainEvent.fighter2.split(' ').map((n: string) => n[0]).join('')}
              </div>
            </div>
            <p className="text-white font-bold text-sm md:text-lg mt-3">{mainEvent.fighter2}</p>
            <p className="text-gray-400 text-xs">{mainEvent.fighter2Record}</p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-400 text-xs md:text-sm">{new Date(mainEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <p className="text-gray-500 text-xs">{mainEvent.venue}</p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <button className="bg-ufc-red text-white px-6 py-2 text-sm uppercase tracking-wider font-semibold rounded hover:bg-red-700 transition">
              Watch Live
            </button>
            <button className="border border-gray-600 text-gray-300 px-6 py-2 text-sm uppercase tracking-wider rounded hover:bg-gray-800 transition">
              View Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
