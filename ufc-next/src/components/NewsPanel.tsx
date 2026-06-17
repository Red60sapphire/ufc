import Link from 'next/link';
import Image from 'next/image';

interface NewsItem {
  id: string;
  title: string;
  description?: string;
  image?: string;
  date: string;
}

export default function NewsPanel({ news }: { news: NewsItem[] }) {
  if (news.length === 0) return null;

  const lead = news[0];
  const rest = news.slice(1);

  return (
    <div className="bg-[#111] border border-gray-800 rounded-lg p-4">
      <h3 className="text-ufc-red text-sm uppercase tracking-wider font-semibold mb-3">Latest News</h3>

      {lead && (
        <Link href="/news" className="block mb-4 group">
          <div className="w-full h-32 bg-gray-800 rounded overflow-hidden mb-2">
            {lead.image ? (
              <Image src={lead.image} alt={lead.title} width={400} height={160} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-600 text-xs">UFC</div>
            )}
          </div>
          <h4 className="text-white text-sm font-semibold group-hover:text-ufc-red transition line-clamp-2">{lead.title}</h4>
          <p className="text-gray-500 text-xs mt-1">{lead.date}</p>
        </Link>
      )}

      <div className="space-y-3">
        {rest.map((item) => (
          <Link key={item.id} href="/news" className="flex gap-3 group">
            <div className="w-12 h-12 bg-gray-800 rounded flex-shrink-0 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-600 text-xs">
                UFC
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-white text-xs font-semibold group-hover:text-ufc-red transition line-clamp-2">{item.title}</h5>
              <p className="text-gray-500 text-[10px] mt-0.5">{item.date}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
