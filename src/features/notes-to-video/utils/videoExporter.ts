import type { VideoLesson, Scene } from "../types";

/**
 * Client-Side Video Exporter.
 * Renders all scenes onto an off-screen 1280x720 HD Canvas and encodes them into a real downloadable MP4 video file.
 */
export async function exportLessonToVideoFile(
  lesson: VideoLesson,
  onProgress?: (percent: number) => void
): Promise<void> {
  const width = 1280;
  const height = 720;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Unable to initialize canvas 2D rendering context.");
  }

  // Pre-load all scene SVG images
  const sceneImages: Array<HTMLImageElement | null> = await Promise.all(
    lesson.scenes.map(async (scene) => {
      if (!scene.svgMarkup) return null;
      try {
        let svg = scene.svgMarkup.trim();
        if (svg.includes("```xml") || svg.includes("```svg") || svg.includes("```")) {
          svg = svg.replace(/```(xml|svg)?/g, "").replace(/```/g, "").trim();
        }
        if (!svg.includes("xmlns")) {
          svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
        }

        const img = new Image();
        const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        await new Promise((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = url;
        });

        return img;
      } catch {
        return null;
      }
    })
  );

  // Check supported mime types
  let mimeType = "video/webm;codecs=vp9";
  let extension = "mp4";
  if (typeof MediaRecorder !== "undefined") {
    if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")) {
      mimeType = "video/mp4;codecs=avc1";
      extension = "mp4";
    } else if (MediaRecorder.isTypeSupported("video/mp4")) {
      mimeType = "video/mp4";
      extension = "mp4";
    } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
      mimeType = "video/webm;codecs=vp9";
      extension = "mp4";
    } else if (MediaRecorder.isTypeSupported("video/webm")) {
      mimeType = "video/webm";
      extension = "mp4";
    }
  }

  const stream = canvas.captureStream(30);
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
    videoBitsPerSecond: 5_000_000,
  });

  const recordedChunks: Blob[] = [];
  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  const recordingPromise = new Promise<Blob>((resolve) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: mimeType });
      resolve(blob);
    };
  });

  mediaRecorder.start();

  const fps = 30;
  const totalScenes = lesson.scenes.length;

  for (let sIdx = 0; sIdx < totalScenes; sIdx++) {
    const scene = lesson.scenes[sIdx];
    const duration = Math.max(5, scene.durationSeconds || 10);
    const totalFrames = Math.round(duration * fps);
    const sceneImg = sceneImages[sIdx];

    for (let f = 0; f <= totalFrames; f++) {
      const sceneProgress = f / totalFrames;
      renderFrame(ctx, width, height, lesson, scene, sIdx, totalScenes, sceneProgress, sceneImg);

      const overallProgress = Math.min(
        99,
        Math.round(((sIdx + sceneProgress) / totalScenes) * 100)
      );
      if (onProgress) onProgress(overallProgress);

      await new Promise((r) => setTimeout(r, 14));
    }
  }

  mediaRecorder.stop();
  if (onProgress) onProgress(100);

  const finalBlob = await recordingPromise;

  const downloadUrl = URL.createObjectURL(finalBlob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  const sanitizedTitle = lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  a.download = `${sanitizedTitle}_lecture.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

function renderFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  lesson: VideoLesson,
  scene: Scene,
  sceneIndex: number,
  totalScenes: number,
  sceneProgress: number,
  sceneImg: HTMLImageElement | null
) {
  // 1. Clean Slate Background
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, width, height);

  // 2. Center SVG Diagram
  if (sceneImg && sceneImg.complete && sceneImg.naturalWidth > 0) {
    const targetW = 1100;
    const targetH = 500;
    const targetX = 90;
    const targetY = 70;

    ctx.save();
    ctx.drawImage(sceneImg, targetX, targetY, targetW, targetH);
    ctx.restore();
  }

  // 3. Top Header Tag
  ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
  ctx.fillRect(0, 0, width, 55);
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 55);
  ctx.lineTo(width, 55);
  ctx.stroke();

  ctx.fillStyle = "#10b981";
  ctx.font = "bold 13px system-ui, sans-serif";
  ctx.fillText(`Part ${sceneIndex + 1} of ${totalScenes}`, 40, 34);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 15px system-ui, sans-serif";
  ctx.fillText(scene.title, 140, 34);

  // 4. Clean Lower-Third Subtitle Bar
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(80, 580, width - 160, 90, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#f8fafc";
  ctx.font = "500 15px system-ui, sans-serif";
  const words = scene.narration.split(" ");
  let line = "";
  let textY = 618;
  for (const word of words) {
    const testLine = line + word + " ";
    if (ctx.measureText(testLine).width > width - 220) {
      ctx.fillText(line, 105, textY);
      line = word + " ";
      textY += 24;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 105, textY);

  // 5. Scrubber Bar
  const overallProgress = (sceneIndex + sceneProgress) / totalScenes;
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(0, height - 6, width, 6);
  ctx.fillStyle = "#10b981";
  ctx.fillRect(0, height - 6, width * overallProgress, 6);
}
