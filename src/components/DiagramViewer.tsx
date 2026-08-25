"use client";

import { useState, useMemo } from "react";
import { Maximize2, X, ZoomIn, ZoomOut, RotateCcw, Compass } from "lucide-react";
import { sanitizeAndCleanSvg } from "@/lib/svgSanitizer";

interface DiagramViewerProps {
  svgString: string | null | undefined;
  title?: string;
  className?: string;
}

export default function DiagramViewer({
  svgString,
  title = "Concept / Mechanism Diagram",
  className = "",
}: DiagramViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  const cleanSvg = useMemo(() => {
    return sanitizeAndCleanSvg(svgString);
  }, [svgString]);

  if (!cleanSvg) {
    return null;
  }

  return (
    <>
      {/* Inline Diagram Card */}
      <div
        className={`my-3 overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-b from-blue-50/40 via-white to-zinc-50/50 p-4 shadow-xs dark:border-blue-500/20 dark:from-blue-950/20 dark:via-zinc-900/60 dark:to-zinc-950/40 ${className}`}
      >
        <div className="flex items-center justify-between border-b border-black/[.06] pb-2.5 dark:border-white/[.08]">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
              <Compass className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200">
              {title}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setZoomScale(1);
              setIsOpen(true);
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-black/[.08] bg-white px-2 py-1 text-[11px] font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-50 dark:border-white/[.1] dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            title="Expand Diagram"
          >
            <Maximize2 className="h-3 w-3" />
            Expand
          </button>
        </div>

        {/* Rendered SVG Canvas */}
        <div
          onClick={() => {
            setZoomScale(1);
            setIsOpen(true);
          }}
          className="group relative mt-3 flex cursor-pointer items-center justify-center rounded-lg bg-white/80 p-3 shadow-inner transition-all hover:bg-white dark:bg-zinc-950/80 dark:hover:bg-zinc-950"
        >
          <div
            className="flex w-full items-center justify-center max-h-[260px] overflow-hidden [&>svg]:h-auto [&>svg]:max-h-[240px] [&>svg]:w-full [&>svg]:max-w-xl [&>svg]:drop-shadow-xs"
            dangerouslySetInnerHTML={{ __html: cleanSvg }}
          />

          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 opacity-0 backdrop-blur-[1px] transition-all group-hover:bg-black/5 group-hover:opacity-100 dark:group-hover:bg-white/5">
            <span className="rounded-full bg-black/75 px-3 py-1 text-xs font-medium text-white shadow-lg dark:bg-white/90 dark:text-black">
              Click to view high-res diagram
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-black/[.1] bg-white shadow-2xl dark:border-white/[.15] dark:bg-zinc-950 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-black/[.08] px-6 py-4 dark:border-white/[.1]">
              <div className="flex items-center gap-2.5">
                <Compass className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-black dark:text-zinc-50">
                  {title}
                </h3>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-lg border border-black/[.08] bg-zinc-50 p-1 dark:border-white/[.1] dark:bg-zinc-900">
                  <button
                    type="button"
                    onClick={() => setZoomScale((z) => Math.max(0.5, z - 0.25))}
                    className="rounded p-1 text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-1.5 text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                    {Math.round(zoomScale * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomScale((z) => Math.min(2.5, z + 0.25))}
                    className="rounded p-1 text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    title="Zoom In"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale(1)}
                    className="rounded p-1 text-zinc-500 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body with Zoom Support */}
            <div className="flex flex-1 items-center justify-center overflow-auto p-8 bg-zinc-50/50 dark:bg-zinc-900/30 min-h-[350px]">
              <div
                style={{ transform: `scale(${zoomScale})`, transformOrigin: "center center" }}
                className="transition-transform duration-150 flex items-center justify-center w-full [&>svg]:h-auto [&>svg]:max-h-[500px] [&>svg]:w-full [&>svg]:max-w-2xl"
                dangerouslySetInnerHTML={{ __html: cleanSvg }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
