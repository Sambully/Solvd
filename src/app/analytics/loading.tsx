export default function AnalyticsLoading() {
  return (
    <main className="p-6 sm:p-8 max-w-6xl mx-auto w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="space-y-2">
          <div className="h-8 w-64 rounded-xl bg-slate-200 animate-pulse" />
          <div className="h-4 w-96 max-w-full rounded bg-slate-100 animate-pulse" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-slate-200 animate-pulse" />
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between"
          >
            <div className="h-3 w-24 rounded bg-slate-200 animate-pulse" />
            <div className="h-7 w-28 rounded-lg bg-slate-200 animate-pulse" />
            <div className="h-3 w-32 rounded bg-slate-100 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Radar & Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 h-80 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs animate-pulse" />
        <div className="lg:col-span-5 h-80 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs animate-pulse" />
      </div>
    </main>
  );
}
