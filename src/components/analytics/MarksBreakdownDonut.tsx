"use client";

interface Props {
  totalMarksGained: number;
  totalMarksLost: number;
  overallAccuracy: number;
}

export default function MarksBreakdownDonut({
  totalMarksGained,
  totalMarksLost,
  overallAccuracy,
}: Props) {
  const total = totalMarksGained + totalMarksLost;
  const gainedPercent = total > 0 ? (totalMarksGained / total) * 100 : 0;
  const lostPercent = total > 0 ? (totalMarksLost / total) * 100 : 0;

  // SVG circle calculation
  const size = 160;
  const strokeWidth = 16;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  const gainedStrokeDash = (gainedPercent / 100) * circumference;
  const lostStrokeDash = (lostPercent / 100) * circumference;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.1] dark:bg-zinc-950">
      <div>
        <h3 className="text-base font-bold text-black dark:text-zinc-50">
          Marks & Penalty Diagnostic
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          NEET +4 earned vs -1 penalty marks lost
        </p>
      </div>

      <div className="my-4 flex flex-col items-center justify-center sm:flex-row gap-6">
        {/* SVG Donut */}
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeOpacity="0.08"
              strokeWidth={strokeWidth}
              className="text-black dark:text-white"
            />
            {/* Gained Arc (Emerald) */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#10b981"
              strokeWidth={strokeWidth}
              strokeDasharray={`${gainedStrokeDash} ${circumference}`}
              strokeDashoffset="0"
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
            {/* Lost Arc (Red) */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#ef4444"
              strokeWidth={strokeWidth}
              strokeDasharray={`${lostStrokeDash} ${circumference}`}
              strokeDashoffset={-gainedStrokeDash}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Center Metric */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-extrabold text-black dark:text-zinc-50">
              {overallAccuracy}%
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
              Accuracy
            </span>
          </div>
        </div>

        {/* Legend & Stats */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Marks Gained (+4)</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                +{totalMarksGained} M
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-red-500 shrink-0" />
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Lost to Negatives (-1)</p>
              <p className="text-base font-bold text-red-500">
                -{totalMarksLost} M
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400 border border-black/[.04] dark:border-white/[.04]">
        💡 Net NEET Score: <strong className="text-black dark:text-white">+{totalMarksGained - totalMarksLost} Marks</strong>
      </div>
    </div>
  );
}
