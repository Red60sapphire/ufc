import Link from 'next/link';

interface Event {
  id: string;
  name: string;
  date: string;
  venue?: string;
  location?: string;
}

export default function UpcomingEventsCarousel({ events }: { events: Event[] }) {
  if (events.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="h-4 w-1 bg-ufc-red rounded-full" />
        <h2 className="text-white text-sm uppercase tracking-wider font-bold">Upcoming Events</h2>
      </div>
      <div className={`flex gap-4 pb-3 ${events.length === 1 ? 'justify-center' : 'overflow-x-auto scrollbar-hide'}`}>
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/events?id=${event.id}`}
            className="flex-shrink-0 w-64 bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-xl p-5 hover:border-ufc-red/30 transition-all duration-300 group card-hover"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] bg-ufc-red/10 text-ufc-red px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">Upcoming</span>
            </div>
            <h3 className="text-white text-sm font-bold group-hover:text-ufc-red transition-colors line-clamp-2 leading-relaxed">
              {event.name}
            </h3>
            <div className="mt-4 pt-3 border-t border-gray-800/50">
              <p className="text-gray-400 text-xs flex items-center gap-1.5">
                <svg className="w-3 h-3 text-ufc-red" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-gray-500 text-xs mt-1 flex items-center gap-1.5">
                <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {event.venue || event.location || 'TBA'}
              </p>
            </div>
            <div className="mt-3">
              <span className="inline-flex items-center gap-1 text-ufc-red text-[10px] uppercase tracking-wider font-semibold group-hover:gap-2 transition-all">
                View Card
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
