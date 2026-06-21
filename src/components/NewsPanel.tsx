import Link from 'next/link';

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
    <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-xl overflow-hidden card-hover">
      <div className="bg-gradient-to-r from-ufc-red/10 to-transparent px-4 py-3 border-b border-gray-800">
        <h3 className="text-ufc-red text-xs uppercase tracking-wider font-semibold">Latest News</h3>
      </div>
      <div className="p-4">
        {lead && (
          <Link href="/news" className="block mb-4 group">
            <div className="w-full h-36 bg-gray-800 rounded-xl overflow-hidden mb-3 relative">
              {lead.image ? (
                <img src={lead.image} alt={lead.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-8 h-8 text-gray-700 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                      <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
                    </svg>
                    <span className="text-gray-700 text-[10px] uppercase tracking-wider">UFC News</span>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <h4 className="text-white text-sm font-semibold group-hover:text-ufc-red transition-colors line-clamp-2 leading-relaxed">{lead.title}</h4>
            <p className="text-gray-500 text-[10px] mt-1.5 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {lead.date}
            </p>
          </Link>
        )}

        <div className="space-y-2.5">
          {rest.map((item) => (
            <Link key={item.id} href="/news" className="flex gap-3 group p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-white text-xs font-semibold group-hover:text-ufc-red transition-colors line-clamp-2">{item.title}</h5>
                <p className="text-gray-600 text-[10px] mt-0.5">{item.date}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
