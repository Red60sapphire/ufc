import { getNewsWithFallback } from "@/lib/ufc-data-fetcher";

export default async function NewsPage() {
  const news = await getNewsWithFallback(20);

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-16">
      <div className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(210,10,10,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,168,67,0.03),transparent_50%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ufc-red/50 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <span className="inline-block bg-ufc-red/10 text-ufc-red text-[10px] uppercase tracking-[0.2em] font-semibold px-4 py-1.5 rounded-full border border-ufc-red/20 mb-3">Coverage</span>
          <h1 className="text-white text-3xl md:text-4xl font-bold uppercase tracking-tight">UFC News</h1>
          <p className="text-gray-500 text-sm mt-2">Latest stories and updates from the octagon</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {news.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No news articles available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {news[0] && (
              <div className="lg:col-span-2 bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl overflow-hidden card-hover group">
                <div className="h-64 bg-gray-800 relative overflow-hidden">
                  {news[0].image ? (
                    <img src={news[0].image} alt={news[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-gray-700 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700 text-sm uppercase tracking-wider">UFC News</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] bg-ufc-red/10 text-ufc-red px-2 py-0.5 rounded-full uppercase font-semibold">Featured</span>
                    <span className="text-gray-600 text-[10px]">{news[0].date}</span>
                  </div>
                  <h2 className="text-white text-lg font-bold group-hover:text-ufc-red transition-colors leading-relaxed">{news[0].title}</h2>
                  {news[0].description && (
                    <p className="text-gray-400 text-sm mt-2 leading-relaxed">{news[0].description}</p>
                  )}
                  <p className="text-gray-600 text-xs mt-3">{news[0].source}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {news.slice(1).map((item) => (
                <div key={item.id} className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-xl p-4 card-hover group">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-800 rounded-xl flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-sm font-semibold group-hover:text-ufc-red transition-colors line-clamp-2 leading-relaxed">{item.title}</h3>
                      {item.description && (
                        <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                      )}
                      <p className="text-gray-600 text-[10px] mt-1.5">{item.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
