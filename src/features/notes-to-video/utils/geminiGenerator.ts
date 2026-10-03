import { GoogleGenAI } from "@google/genai";
import { SYSTEM_NOTES_TO_VIDEO_PROMPT } from "../prompts";
import type { VideoLesson, Scene } from "../types";
import { synthesizeSceneNarration } from "./ttsService";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured in environment");
  return new GoogleGenAI({ apiKey });
}

export interface GenerateLessonParams {
  notesText?: string;
  imageBase64?: string;
  imageMimeType?: string;
  voiceName?: string;
  targetDurationMinutes?: number;
}

export async function generateVideoLessonFromNotes({
  notesText,
  imageBase64,
  imageMimeType = "image/jpeg",
  voiceName = "en-IN-NeerjaNeural",
}: GenerateLessonParams): Promise<VideoLesson> {
  const ai = getClient();
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const contents: Array<string | { inlineData: { mimeType: string; data: string } }> = [];

  if (imageBase64) {
    // Strip data URL header if present (e.g. data:image/png;base64,...)
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");
    contents.push({
      inlineData: {
        mimeType: imageMimeType,
        data: cleanBase64,
      },
    });
  }

  const promptText = notesText?.trim()
    ? `Study Notes / Topic Provided by Student:\n\n${notesText.trim()}\n\nGenerate the complete 5-to-7 scene Animated Micro-Lecture JSON with SVG graphics and spoken narration.`
    : `Please analyze the uploaded study notes / diagram image thoroughly. Extract the core concept and generate the complete 5-to-7 scene Animated Micro-Lecture JSON with SVG graphics and spoken narration.`;

  contents.push(promptText);

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: SYSTEM_NOTES_TO_VIDEO_PROMPT,
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });

  const responseText = response.text?.trim();
  if (!responseText) {
    throw new Error("Empty response received from Gemini AI model");
  }

  let parsed: {
    title: string;
    subject: "Physics" | "Chemistry" | "Biology" | "General";
    summary: string;
    scenes: Array<Omit<Scene, "audioUrl" | "durationSeconds">>;
  };

  try {
    parsed = JSON.parse(responseText);
  } catch (err) {
    console.error("Failed to parse Gemini JSON:", responseText);
    throw new Error("Malformed JSON response from AI model. Please try again.");
  }

  if (!parsed.scenes || !Array.isArray(parsed.scenes) || parsed.scenes.length === 0) {
    throw new Error("No scenes generated for this topic. Please provide more detailed notes.");
  }

  // Synthesize voice audio for each scene in parallel with concurrency limit
  const scenesWithAudio: Scene[] = await Promise.all(
    parsed.scenes.map(async (scene, index) => {
      const audioRes = await synthesizeSceneNarration(scene.narration, voiceName);
      return {
        ...scene,
        sceneNumber: index + 1,
        audioUrl: audioRes.audioBase64,
        durationSeconds: audioRes.durationSeconds,
      };
    })
  );

  const totalDurationSeconds = scenesWithAudio.reduce(
    (acc, sc) => acc + (sc.durationSeconds || 5),
    0
  );

  return {
    id: `lesson_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: parsed.title || "NEET Concept Micro-Lecture",
    subject: parsed.subject || "Biology",
    summary: parsed.summary || "High-yield visual revision lesson",
    scenes: scenesWithAudio,
    totalDurationSeconds: Math.round(totalDurationSeconds * 10) / 10,
    createdAt: new Date().toISOString(),
  };
}
