export function CartSkeleton() {
  return (
    <div
      data-testid="cart-skeleton"
      className="max-w-[1280px] mx-auto px-4 sm:px-10 py-8 pb-18 animate-pulse"
    >
      {/* Title skeleton */}
      <div className="h-10 w-48 bg-slate-200 rounded-md mb-2" />
      <div className="h-5 w-36 bg-slate-200 rounded-md mb-7" />

      <div className="flex gap-10 flex-wrap lg:flex-nowrap items-start">
        {/* Item List Skeleton */}
        <div className="flex-1 min-w-0 bg-white border border-line rounded-[14px] overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="grid grid-cols-[96px_minmax(0,1fr)_auto] gap-5 p-5 border-b border-line last:border-b-0 items-start"
            >
              <div className="w-24 h-24 rounded-[14px] bg-slate-200" />
              <div className="flex flex-col gap-2.5">
                <div className="h-5 w-3/4 bg-slate-200 rounded" />
                <div className="h-4 w-1/3 bg-slate-200 rounded" />
                <div className="h-10 w-28 bg-slate-200 rounded-[10px] mt-2" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="h-5 w-24 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Aside Skeleton */}
        <div className="w-full lg:w-[380px] flex-shrink-0 bg-white border border-line rounded-[14px] p-6 flex flex-col gap-5">
          <div className="h-6 w-40 bg-slate-200 rounded" />
          <div className="flex gap-2">
            <div className="h-11 flex-1 bg-slate-200 rounded-[10px]" />
            <div className="h-11 w-20 bg-slate-200 rounded-[10px]" />
          </div>
          <div className="flex flex-col gap-3 py-2">
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-slate-200 rounded" />
              <div className="h-4 w-24 bg-slate-200 rounded" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-slate-200 rounded" />
              <div className="h-4 w-20 bg-slate-200 rounded" />
            </div>
            <div className="flex justify-between border-t border-line pt-3 mt-1">
              <div className="h-6 w-24 bg-slate-200 rounded" />
              <div className="h-7 w-32 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="h-13 w-full bg-slate-200 rounded-[10px]" />
        </div>
      </div>
    </div>
  );
}
