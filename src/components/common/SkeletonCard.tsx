export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-full shimmer" />
          <div className="h-5 w-14 rounded-full shimmer" />
        </div>
        <div className="h-7 w-20 rounded-xl shimmer" />
      </div>
      <div className="h-4 w-3/4 rounded-lg shimmer" />
      <div className="space-y-1.5">
        <div className="h-3.5 w-full rounded-lg shimmer" />
        <div className="h-3.5 w-5/6 rounded-lg shimmer" />
      </div>
      <div className="flex justify-between pt-1 border-t border-gray-50">
        <div className="h-3 w-24 rounded shimmer" />
        <div className="h-3 w-16 rounded shimmer" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
