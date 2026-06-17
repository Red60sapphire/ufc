import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] px-4">
      <div className="text-center">
        <h1 className="text-8xl md:text-9xl font-black text-ufc-red" style={{ textShadow: '0 0 40px rgba(210,10,10,0.3)' }}>
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-white mt-4 uppercase tracking-wider">FIGHT NOT FOUND</h2>
        <p className="text-gray-400 text-sm mt-2">This page got knocked out in Round 1.</p>
        <Link
          href="/"
          className="inline-block mt-6 bg-ufc-red text-white px-6 py-3 text-sm uppercase tracking-wider font-semibold rounded hover:bg-red-700 transition"
        >
          Return to the Octagon
        </Link>
      </div>
    </div>
  );
}
