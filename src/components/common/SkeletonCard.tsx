export function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      {/* top bar */}
      <div className="h-1 w-full shimmer" />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <div className="h-5 w-20 rounded-full shimmer" />
            <div className="h-5 w-16 rounded-full shimmer" />
          </div>
          <div className="h-8 w-24 rounded-2xl shimmer" />
        </div>
        <div className="h-5 w-4/5 rounded-xl shimmer" />
        <div className="space-y-2">
          <div className="h-3.5 w-full rounded-lg shimmer" />
          <div className="h-3.5 w-3/4 rounded-lg shimmer" />
        </div>
        <div className="flex justify-between pt-1">
          <div className="h-3 w-28 rounded shimmer" />
          <div className="h-3 w-14 rounded shimmer" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}
