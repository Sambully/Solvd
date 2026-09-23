export default function TestsLoading() {
  return (
    <main className="p-6 sm:p-8 max-w-6xl mx-auto w-full space-y-6 animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="space-y-2">
          <div className="h-8 w-60 rounded-xl bg-slate-200 animate-pulse" />
          <div className="h-4 w-80 max-w-full rounded bg-slate-100 animate-pulse" />
        </div>
        <div className="h-10 w-44 rounded-xl bg-slate-200 animate-pulse" />
      </div>

      {/* Filter and Search Bar Skeleton */}
      <div className="flex items-center justify-between gap-4">
        <div className="h-10 w-72 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-10 w-36 rounded-xl bg-slate-100 animate-pulse" />
      </div>

      {/* Tests Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-44 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 rounded bg-slate-200 animate-pulse" />
                <div className="h-4 w-12 rounded bg-slate-100 animate-pulse" />
              </div>
              <div className="h-5 w-44 rounded bg-slate-200 animate-pulse" />
              <div className="h-3 w-32 rounded bg-slate-100 animate-pulse" />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
              <div className="h-8 w-24 rounded-xl bg-slate-200 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
