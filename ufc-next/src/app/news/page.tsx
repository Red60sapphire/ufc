import { getNewsWithFallback } from "@/lib/ufc-data-fetcher";

export default async function NewsPage() {
  const news = await getNewsWithFallback(20);

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-white text-2xl font-bold uppercase tracking-wider mb-6">UFC News</h1>

        {news.length === 0 ? (
          <p className="text-gray-400 text-sm">No news articles available.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {news[0] && (
              <div className="lg:col-span-2 bg-[#111] border border-gray-800 rounded-lg overflow-hidden group">
                <div className="h-64 bg-gray-800">
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-600">
                    {news[0].image ? (
                      <img src={news[0].image} alt={news[0].title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-bold">UFC</span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-white text-xl font-bold group-hover:text-ufc-red transition">{news[0].title}</h2>
                  <p className="text-gray-400 text-sm mt-2">{news[0].description}</p>
                  <p className="text-gray-600 text-xs mt-3">{news[0].date} • {news[0].source}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {news.slice(1).map((item) => (
                <div key={item.id} className="bg-[#111] border border-gray-800 rounded-lg p-4 group hover:border-gray-600 transition">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-800 rounded flex-shrink-0 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-600 text-xs">UFC</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-sm font-semibold group-hover:text-ufc-red transition line-clamp-2">{item.title}</h3>
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.description}</p>
                      <p className="text-gray-600 text-[10px] mt-1">{item.date}</p>
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
