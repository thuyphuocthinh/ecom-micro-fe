export function ProductDetailSkeleton() {
  return (
    <div
      data-testid="product-detail-skeleton"
      className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-10 py-6 animate-pulse"
    >
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-64 bg-line/60 rounded mb-6" />

      {/* Main Two-Column Layout */}
      <div className="flex gap-10 lg:gap-14 flex-wrap items-start">
        {/* Gallery Column */}
        <div className="flex-1 min-w-[280px] sm:min-w-[400px] lg:max-w-[560px] flex flex-col gap-4">
          <div className="aspect-square w-full rounded-[24px] bg-line/50 border border-line" />
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="size-[76px] sm:size-[84px] rounded-[16px] bg-line/40 border border-line/50"
              />
            ))}
          </div>
        </div>

        {/* Buy Box Column */}
        <div className="flex-1 min-w-[280px] sm:min-w-[360px] lg:max-w-[500px] flex flex-col gap-5">
          <div className="h-6 w-24 bg-brand-tint/60 rounded-full" />
          <div className="h-9 w-3/4 bg-line/70 rounded-lg" />
          <div className="h-5 w-40 bg-line/50 rounded" />
          <div className="h-10 w-48 bg-line/70 rounded-lg" />
          <div className="h-14 w-full bg-line/30 rounded" />

          {/* Swatches Skeleton */}
          <div className="space-y-2 pt-2">
            <div className="h-4 w-32 bg-line/50 rounded" />
            <div className="flex gap-2.5">
              <div className="h-11 w-28 bg-line/50 rounded-[12px]" />
              <div className="h-11 w-28 bg-line/50 rounded-[12px]" />
            </div>
          </div>

          {/* Buttons Skeleton */}
          <div className="flex gap-3 pt-2">
            <div className="h-12 flex-1 bg-line/70 rounded-[10px]" />
            <div className="h-12 w-32 bg-line/40 rounded-[10px]" />
          </div>

          {/* Guarantees Skeleton */}
          <div className="h-40 w-full bg-line/30 rounded-[14px] mt-4" />
        </div>
      </div>
    </div>
  );
}
