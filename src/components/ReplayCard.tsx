import Link from 'next/link';

interface ReplayCardProps {
  replay: any;
}

export default function ReplayCard({ replay }: ReplayCardProps) {
  const slug = replay.slug || replay.id;
  const thumbnail = replay.thumbnail || replay.fighter1_img || '';
  const title = replay.title || `${replay.fighter1} vs ${replay.fighter2}`;

  return (
    <Link href={`/replays/${slug}`} className="group flex-shrink-0 w-[220px] md:w-[260px]">
      <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-800 group-hover:border-ufc-red/40 transition-all duration-300">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-ufc-red flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-white text-[10px] font-semibold uppercase tracking-wider">Watch</span>
            </div>
          </div>
        </div>
        {replay.featured ? (
          <div className="absolute top-2 left-2 bg-ufc-red text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Featured</div>
        ) : null}
        {replay.promotion && replay.promotion !== 'UFC' ? (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded font-semibold uppercase backdrop-blur-sm border border-white/10">{replay.promotion}</div>
        ) : null}
        {replay.duration ? (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">{replay.duration}</div>
        ) : null}
      </div>
      <div className="mt-2 px-0.5">
        <h3 className="text-white text-xs font-semibold truncate group-hover:text-ufc-red transition-colors">{title}</h3>
        <p className="text-gray-500 text-[10px] truncate mt-0.5">
          {replay.event_name || replay.event || ''}
          {replay.event_date ? <span className="text-gray-600"> · {new Date(replay.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> : ''}
        </p>
      </div>
    </Link>
  );
}
