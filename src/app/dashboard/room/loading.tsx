export default function RoomLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-7 max-w-6xl mx-auto w-full font-sans animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="space-y-2">
          <div className="h-8 w-60 rounded-xl bg-slate-200 animate-pulse" />
          <div className="h-4 w-96 max-w-full rounded bg-slate-100 animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-32 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-10 w-36 rounded-xl bg-slate-200 animate-pulse" />
        </div>
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-56 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-6 w-24 rounded-lg bg-slate-200 animate-pulse" />
                <div className="h-5 w-16 rounded bg-slate-100 animate-pulse" />
              </div>
              <div className="h-6 w-44 rounded bg-slate-200 animate-pulse" />
              <div className="h-3 w-32 rounded bg-slate-100 animate-pulse" />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="h-4 w-28 rounded bg-slate-100 animate-pulse" />
              <div className="h-9 w-28 rounded-xl bg-slate-200 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
