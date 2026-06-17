export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#0a0a0a] to-[#050505] border-t border-gray-800/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-ufc-red rounded-full flex items-center justify-center font-black text-white text-xs">U</div>
              <span className="text-white text-sm font-bold">UFC.SOLUTIONS</span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">Your destination for free UFC live streams, fight coverage, and news.</p>
          </div>
          <div>
            <h4 className="text-white text-xs uppercase tracking-wider font-semibold mb-3">Browse</h4>
            <div className="space-y-2">
              <a href="/events" className="block text-gray-500 text-xs hover:text-gray-300 transition">Events</a>
              <a href="/news" className="block text-gray-500 text-xs hover:text-gray-300 transition">News</a>
              <a href="/replays" className="block text-gray-500 text-xs hover:text-gray-300 transition">Replays</a>
            </div>
          </div>
          <div>
            <h4 className="text-white text-xs uppercase tracking-wider font-semibold mb-3">Support</h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-500 text-xs hover:text-gray-300 transition">Terms of Service</a>
              <a href="#" className="block text-gray-500 text-xs hover:text-gray-300 transition">Privacy Policy</a>
              <a href="#" className="block text-gray-500 text-xs hover:text-gray-300 transition">Contact</a>
            </div>
          </div>
          <div>
            <h4 className="text-white text-xs uppercase tracking-wider font-semibold mb-3">Community</h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-500 text-xs hover:text-gray-300 transition">Discord</a>
              <a href="#" className="block text-gray-500 text-xs hover:text-gray-300 transition">Telegram</a>
              <a href="#" className="block text-gray-500 text-xs hover:text-gray-300 transition">Reddit</a>
            </div>
          </div>
        </div>
        <div className="pt-6 border-t border-gray-800/50 text-center">
          <p className="text-gray-600 text-[10px]">
            &copy; {new Date().getFullYear()} UFC.SOLUTIONS. Not affiliated with the UFC.
          </p>
        </div>
      </div>
    </footer>
  );
}
