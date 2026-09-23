export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between">
      {/* Skeleton Header */}
      <header className="sticky top-0 z-50 border-b border-black/[.05] bg-white/70 backdrop-blur-xl px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-slate-200 animate-pulse" />
            <div className="h-6 w-24 rounded-md bg-slate-200 animate-pulse" />
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <div className="h-4 w-16 rounded bg-slate-200 animate-pulse" />
            <div className="h-4 w-20 rounded bg-slate-200 animate-pulse" />
            <div className="h-4 w-14 rounded bg-slate-200 animate-pulse" />
          </div>
          <div className="h-8 w-28 rounded-full bg-slate-200 animate-pulse" />
        </div>
      </header>

      {/* Skeleton Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 rounded-xl bg-slate-200 animate-pulse" />
          <div className="h-4 w-96 max-w-full rounded-md bg-slate-100 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between"
            >
              <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
              <div className="h-7 w-28 rounded-lg bg-slate-200 animate-pulse" />
              <div className="h-3 w-32 rounded bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>

        <div className="h-64 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs animate-pulse" />
      </main>
    </div>
  );
}
