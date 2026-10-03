"use client";

import React, { useMemo } from "react";
import type { Scene } from "../types";

interface SVGSceneRendererProps {
  scene: Scene;
  isPlaying: boolean;
}

export default function SVGSceneRenderer({
  scene,
  isPlaying,
}: SVGSceneRendererProps) {
  const sanitizedSVG = useMemo(() => {
    if (!scene.svgMarkup) return null;
    let svg = scene.svgMarkup.trim();

    if (svg.includes("```xml") || svg.includes("```svg") || svg.includes("```")) {
      svg = svg.replace(/```(xml|svg)?/g, "").replace(/```/g, "").trim();
    }

    if (!svg.includes("viewBox") && svg.includes("<svg")) {
      svg = svg.replace("<svg", '<svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid meet"');
    } else if (svg.includes("<svg") && !svg.includes("preserveAspectRatio")) {
      svg = svg.replace("<svg", '<svg preserveAspectRatio="xMidYMid meet"');
    }

    return svg;
  }, [scene.svgMarkup]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#0f172a] select-none overflow-hidden">
      {sanitizedSVG ? (
        <div
          className={`w-full h-full flex items-center justify-center transition-transform duration-500 [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain ${
            isPlaying ? "scale-100" : "scale-[0.99] opacity-95"
          }`}
          dangerouslySetInnerHTML={{ __html: sanitizedSVG }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center text-slate-300">
          <h4 className="text-base font-bold text-white">{scene.title}</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-md">{scene.narration}</p>
        </div>
      )}
    </div>
  );
}
