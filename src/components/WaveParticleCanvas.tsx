"use client";

import React, { useEffect, useRef } from "react";

interface WaveParticleCanvasProps {
  className?: string;
  strandCount?: number;
  speedMultiplier?: number;
  waveHeight?: number;
  interactive?: boolean;
  centerYRatio?: number; // 0 to 1 position along canvas height
}

export default function WaveParticleCanvas({
  className = "",
  strandCount = 10,
  speedMultiplier = 1,
  waveHeight = 48,
  interactive = false,
  centerYRatio = 0.5,
}: WaveParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);
    let isVisible = true;
    let time = 0;

    // Handle high DPI crisp rendering
    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Track mouse movement only if explicitly interactive
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const parentElement = canvas.parentElement;
    if (interactive && parentElement) {
      parentElement.addEventListener("mousemove", handleMouseMove);
      parentElement.addEventListener("mouseleave", handleMouseLeave);
    }

    // Visibility observer to halt animation when offscreen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    // Color palette matching the flowing purple/violet particles in reference
    const purplePalette = [
      { r: 168, g: 85, b: 247 }, // Purple 500
      { r: 147, g: 51, b: 234 }, // Purple 600
      { r: 192, g: 132, b: 252 }, // Purple 400
      { r: 129, g: 140, b: 248 }, // Indigo 400
      { r: 216, g: 180, b: 254 }, // Purple 300
    ];

    let lastTimestamp = performance.now();

    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible) return;

      const dt = Math.min((now - lastTimestamp) / 1000, 0.1);
      lastTimestamp = now;
      time += dt * 0.75 * speedMultiplier;

      // Clear with transparency
      ctx.clearRect(0, 0, width, height);

      const centerY = height * centerYRatio;
      const stepX = width > 768 ? 6 : 9; // Adaptive density for mobile/desktop
      const totalStrands = strandCount;

      for (let s = 0; s < totalStrands; s++) {
        const strandNorm = totalStrands > 1 ? s / (totalStrands - 1) : 0.5; // 0 to 1
        const strandOffset = (strandNorm - 0.5) * 36; // vertical spread
        const color = purplePalette[s % purplePalette.length];

        // 3D Depth variation
        const depth = Math.sin(strandNorm * Math.PI); // closer in the center
        const baseAlpha = 0.24 + depth * 0.44;

        const phaseOffset = s * 0.28;
        const freq1 = 0.0032;
        const freq2 = 0.0068;
        const freq3 = 0.011;

        for (let x = 0; x <= width; x += stepX) {
          // Horizontal edge fade factor (sine envelope 0 -> 1 -> 0)
          const edgeFade = Math.sin((x / width) * Math.PI);
          if (edgeFade < 0.01) continue;

          // Main multi-frequency sine wave
          let wave =
            Math.sin(x * freq1 + time * 1.05 + phaseOffset) * waveHeight * 0.65 +
            Math.cos(x * freq2 - time * 0.75 + phaseOffset * 1.4) * (waveHeight * 0.35) +
            Math.sin(x * freq3 + time * 1.5 + s * 0.1) * (waveHeight * 0.15);

          // Interactive gentle mouse push if enabled
          if (interactive && mouseRef.current.active) {
            const dx = x - mouseRef.current.x;
            const dist = Math.abs(dx);
            if (dist < 220) {
              const mouseFactor = Math.cos((dist / 220) * (Math.PI / 2));
              const targetY = mouseRef.current.y - centerY;
              wave += (targetY - wave) * mouseFactor * 0.25;
            }
          }

          const y = centerY + strandOffset + wave * (0.4 + 0.6 * depth);

          // Subtle twinkle/shimmer modulation
          const shimmer = 0.85 + 0.15 * Math.sin(x * 0.05 + time * 2.2 + s);
          const finalAlpha = Math.max(
            0,
            Math.min(1, baseAlpha * edgeFade * shimmer)
          );

          if (finalAlpha < 0.01) continue;

          const radius = (0.75 + depth * 0.85) * (0.9 + 0.2 * edgeFade);

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${finalAlpha.toFixed(3)})`;
          ctx.fill();
        }
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      if (interactive && parentElement) {
        parentElement.removeEventListener("mousemove", handleMouseMove);
        parentElement.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [strandCount, speedMultiplier, waveHeight, interactive, centerYRatio]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full select-none ${className}`}
      style={{ willChange: "transform" }}
      aria-hidden="true"
    />
  );
}
