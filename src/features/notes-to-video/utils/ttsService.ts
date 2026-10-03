import { Communicate } from "edge-tts-universal";

export interface AudioSynthesisResult {
  audioBase64: string;
  durationSeconds: number;
}

/**
 * Synthesize narration text into MP3 audio with millisecond duration estimation.
 */
export async function synthesizeSceneNarration(
  narrationText: string,
  voiceName: string = "en-IN-NeerjaNeural"
): Promise<AudioSynthesisResult> {
  try {
    const cleanText = narrationText.trim();
    if (!cleanText) {
      return { audioBase64: "", durationSeconds: 5 };
    }

    const communicate = new Communicate(cleanText, {
      voice: voiceName,
      rate: "+0%",
      volume: "+0%",
    });

    const chunks: Buffer[] = [];
    let estimatedDurationMs = 0;

    for await (const chunk of communicate.stream()) {
      if (chunk.type === "audio" && chunk.data) {
        chunks.push(chunk.data);
      }
      if (chunk.type === "WordBoundary" && chunk.offset !== undefined && chunk.duration !== undefined) {
        // 100-nanosecond units to milliseconds
        const endMs = (chunk.offset + chunk.duration) / 10000;
        if (endMs > estimatedDurationMs) {
          estimatedDurationMs = endMs;
        }
      }
    }

    if (chunks.length === 0) {
      throw new Error("No audio chunks received from TTS service");
    }

    const audioBuffer = Buffer.concat(chunks);
    const audioBase64 = `data:audio/mp3;base64,${audioBuffer.toString("base64")}`;

    // Calculate duration in seconds (fallback to word count estimation if timestamps missing)
    let durationSeconds = estimatedDurationMs > 0 ? estimatedDurationMs / 1000 : 0;
    if (durationSeconds <= 0) {
      const wordCount = cleanText.split(/\s+/).length;
      durationSeconds = Math.max(4, Math.round((wordCount / 140) * 60)); // ~140 wpm
    }

    return {
      audioBase64,
      durationSeconds: Math.round(durationSeconds * 10) / 10,
    };
  } catch (err) {
    console.warn("TTS synthesis warning, falling back to duration estimate:", err);
    const wordCount = narrationText.split(/\s+/).length;
    const durationSeconds = Math.max(5, Math.round((wordCount / 140) * 60));
    return {
      audioBase64: "",
      durationSeconds,
    };
  }
}
