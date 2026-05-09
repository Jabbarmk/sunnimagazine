export default function SkeletonRows({ count = 4, hasImage = true }: { count?: number; hasImage?: boolean }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            {hasImage && (
              <div className="w-14 h-10 rounded-lg flex-shrink-0 skeleton-shimmer" />
            )}
            <div className="flex-1 space-y-2">
              <div className="h-3 rounded skeleton-shimmer" style={{ width: "60%" }} />
              <div className="h-3 rounded skeleton-shimmer" style={{ width: "40%" }} />
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <div className="h-3 w-8 rounded skeleton-shimmer" />
              <div className="h-3 w-10 rounded skeleton-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
