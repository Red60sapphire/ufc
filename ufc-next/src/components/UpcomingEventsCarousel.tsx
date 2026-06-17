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
      <h2 className="text-white text-sm uppercase tracking-wider font-bold mb-4">Upcoming Events</h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {events.map((event) => (
          <div key={event.id} className="flex-shrink-0 w-64 bg-[#111] border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition">
            <p className="text-ufc-red text-xs uppercase tracking-wider font-semibold">UFC EVENT</p>
            <h3 className="text-white text-sm font-bold mt-2 line-clamp-2">{event.name}</h3>
            <p className="text-gray-400 text-xs mt-2">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            <p className="text-gray-500 text-xs">{event.venue || event.location || 'TBA'}</p>
            <Link href={`/events?id=${event.id}`} className="inline-block mt-3 text-ufc-red text-xs uppercase tracking-wider font-semibold hover:text-red-400">
              View Card →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
