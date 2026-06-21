import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#0a0a0a] to-black border-t border-gray-800/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-ufc-red rounded-full flex items-center justify-center font-black text-white text-sm shadow-lg shadow-red-900/30">U</div>
              <span className="text-white text-base font-bold tracking-tight">UFC.<span className="text-ufc-red">SOLUTIONS</span></span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed max-w-xs">Your destination for free UFC live streams, fight coverage, and news. Not affiliated with the UFC.</p>
            <div className="flex items-center gap-3 mt-4">
              <a href="https://discord.gg/Dh2gUUgYTg" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/5 border border-gray-800 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-600 hover:bg-white/10 transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white text-xs uppercase tracking-wider font-semibold mb-4">Browse</h4>
            <div className="space-y-2.5">
              <FooterLink href="/events">Events</FooterLink>
              <FooterLink href="/news">News</FooterLink>
              <FooterLink href="/replays">Replays</FooterLink>
              <FooterLink href="/rankings">Rankings</FooterLink>
            </div>
          </div>

          <div>
            <h4 className="text-white text-xs uppercase tracking-wider font-semibold mb-4">Support</h4>
            <div className="space-y-2.5">
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
            </div>
          </div>

          <div>
            <h4 className="text-white text-xs uppercase tracking-wider font-semibold mb-4">Community</h4>
            <div className="space-y-2.5">
              <a href="https://discord.gg/Dh2gUUgYTg" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-500 text-xs hover:text-gray-300 transition group">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-ufc-red transition-colors" />
                Discord
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-[10px]">
            &copy; {new Date().getFullYear()} UFC.SOLUTIONS. Not affiliated with the UFC. All trademarks belong to their respective owners.
          </p>
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-ufc-red rounded-full animate-ring-pulse" />
            <span className="text-gray-600 text-[10px]">Free UFC streams &amp; coverage</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-2 text-gray-500 text-xs hover:text-gray-300 transition group">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-ufc-red transition-colors" />
      {children}
    </Link>
  );
}
