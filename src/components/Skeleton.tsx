export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl overflow-hidden ${className}`}>
      <div className="p-5 space-y-4">
        <div className="h-4 bg-white/5 rounded-full w-1/3 animate-pulse" />
        <div className="h-3 bg-white/5 rounded-full w-2/3 animate-pulse" />
        <div className="h-20 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-3 bg-white/5 rounded-full w-1/2 animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonLine({ width = '100%', className = '' }: { width?: string; className?: string }) {
  return <div className={`h-3 bg-white/5 rounded-full animate-pulse ${className}`} style={{ width }} />;
}

export function SkeletonAvatar({ size = 'w-10 h-10', className = '' }: { size?: string; className?: string }) {
  return <div className={`${size} bg-white/5 rounded-full animate-pulse ${className}`} />;
}

export function SkeletonHero({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-2xl overflow-hidden ${className}`}>
      <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] p-8 md:p-12 space-y-6">
        <div className="flex items-center justify-center gap-8 md:gap-16">
          <div className="space-y-3 text-center">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-full mx-auto animate-pulse" />
            <div className="h-4 bg-white/5 rounded-full w-24 mx-auto animate-pulse" />
            <div className="h-3 bg-white/5 rounded-full w-16 mx-auto animate-pulse" />
          </div>
          <div className="h-12 w-12 bg-white/5 rounded-full animate-pulse" />
          <div className="space-y-3 text-center">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-full mx-auto animate-pulse" />
            <div className="h-4 bg-white/5 rounded-full w-24 mx-auto animate-pulse" />
            <div className="h-3 bg-white/5 rounded-full w-16 mx-auto animate-pulse" />
          </div>
        </div>
        <div className="h-4 bg-white/5 rounded-full w-48 mx-auto animate-pulse" />
      </div>
    </div>
  );
}
