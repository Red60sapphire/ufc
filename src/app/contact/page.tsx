'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-16">
      <div className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(210,10,10,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,168,67,0.03),transparent_50%)]" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <span className="inline-block bg-ufc-red/10 text-ufc-red text-[10px] uppercase tracking-[0.2em] font-semibold px-4 py-1.5 rounded-full border border-ufc-red/20 mb-4">Support</span>
          <h1 className="text-white text-3xl md:text-4xl font-bold uppercase tracking-tight">Contact Us</h1>
          <p className="text-gray-500 text-sm mt-3">Have a question or feedback? We&apos;d love to hear from you.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-6 md:p-8">
          {sent ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-white text-lg font-bold mb-2">Message Sent!</h3>
              <p className="text-gray-400 text-sm">We&apos;ll get back to you as soon as possible.</p>
              <button onClick={() => setSent(false)} className="mt-6 text-ufc-red text-sm hover:text-red-300 transition">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2">Name</label>
                  <input required className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 transition-all" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2">Email</label>
                  <input type="email" required className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 transition-all" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2">Subject</label>
                <input required className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 transition-all" placeholder="What's this about?" />
              </div>
              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2">Message</label>
                <textarea required rows={6} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ufc-red/50 transition-all resize-none" placeholder="Tell us more..." />
              </div>
              <button type="submit" className="w-full bg-ufc-red text-white py-3 text-sm uppercase tracking-wider font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-900/30">
                Send Message
              </button>
              <div className="flex items-center justify-center gap-6 pt-2">
                <Link href="/terms" className="text-gray-600 text-xs hover:text-gray-400 transition">Terms of Service</Link>
                <span className="text-gray-800">|</span>
                <Link href="/privacy" className="text-gray-600 text-xs hover:text-gray-400 transition">Privacy Policy</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
