"use client";

import React from "react";
import type { Scene } from "../types";
import { CheckCircle2, Play, Radio } from "lucide-react";

interface SceneTimelineProps {
  scenes: Scene[];
  currentSceneIndex: number;
  onSelectScene: (index: number) => void;
  isPlaying: boolean;
}

export default function SceneTimeline({
  scenes,
  currentSceneIndex,
  onSelectScene,
  isPlaying,
}: SceneTimelineProps) {
  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span className="font-bold uppercase tracking-wider text-[10.5px] text-slate-600 flex items-center gap-1.5">
          <span>Lecture Chapters</span>
          <span className="rounded-full bg-slate-200 px-2 py-0.2 text-[10px] font-bold text-slate-700">
            {scenes.length} Scenes
          </span>
        </span>
        <span className="font-mono text-xs font-bold text-emerald-600">
          Scene {currentSceneIndex + 1} of {scenes.length}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {scenes.map((scene, idx) => {
          const isActive = idx === currentSceneIndex;
          const isPassed = idx < currentSceneIndex;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectScene(idx)}
              className={`group relative flex flex-col justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer select-none shadow-2xs ${
                isActive
                  ? "border-emerald-500 bg-white ring-2 ring-emerald-500/20 shadow-md"
                  : isPassed
                  ? "border-slate-200 bg-slate-50/80 hover:bg-white hover:border-slate-300 text-slate-700"
                  : "border-slate-200/80 bg-white/70 hover:bg-white hover:border-slate-300 opacity-80 hover:opacity-100"
              }`}
            >
              {/* Top row: badge & icon */}
              <div className="flex items-center justify-between w-full mb-1.5">
                <span
                  className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 font-black"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Part {idx + 1}
                </span>

                {isActive && isPlaying ? (
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                ) : isPassed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Play className="h-3 w-3 text-slate-400 group-hover:text-slate-700" />
                )}
              </div>

              {/* Title */}
              <div className="min-w-0">
                <h5
                  className={`text-xs font-bold truncate leading-tight ${
                    isActive ? "text-slate-950" : "text-slate-700"
                  }`}
                >
                  {scene.title}
                </h5>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                  {scene.durationSeconds ? `${scene.durationSeconds}s` : "8s"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
