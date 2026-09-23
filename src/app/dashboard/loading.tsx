export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-7 max-w-6xl mx-auto w-full font-sans animate-in fade-in duration-200">
      {/* Top Streak Bar Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-48 rounded-full bg-slate-200/80 animate-pulse" />
          <div className="h-7 w-36 rounded-full bg-slate-100 animate-pulse" />
        </div>
        <div className="h-8 w-44 rounded-xl bg-slate-200 animate-pulse" />
      </div>

      {/* Header Welcome Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-72 rounded-xl bg-slate-200 animate-pulse" />
          <div className="h-4 w-96 max-w-full rounded-md bg-slate-100 animate-pulse" />
        </div>
        <div className="h-10 w-48 rounded-xl bg-slate-100 animate-pulse self-start sm:self-auto" />
      </div>

      {/* 4 Metric Bento Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 rounded bg-slate-200 animate-pulse" />
              <div className="h-6 w-6 rounded-lg bg-slate-100 animate-pulse" />
            </div>
            <div className="h-7 w-32 rounded-lg bg-slate-200 animate-pulse" />
            <div className="h-3 w-28 rounded bg-slate-100 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Instant Mock Generator Skeleton */}
      <div className="h-48 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-6 w-64 rounded-lg bg-slate-200 animate-pulse" />
          <div className="h-4 w-96 max-w-full rounded bg-slate-100 animate-pulse" />
        </div>
        <div className="h-12 w-full rounded-2xl bg-slate-100 animate-pulse" />
      </div>

      {/* Table Skeleton */}
      <div className="h-64 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="h-5 w-48 rounded bg-slate-200 animate-pulse" />
        <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
        <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
        <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}
