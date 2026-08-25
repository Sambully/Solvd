import {
  GoogleGenAI,
  createPartFromUri,
  FileState,
} from "@google/genai";
import {
  generatedExamSchema,
  type GeneratedExam,
  type ExamCustomizationOptions,
} from "@/lib/examTypes";

export interface InputFile {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
}

const INLINE_MAX_BYTES = 512 * 1024; // 512 KB

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenAI({ apiKey });
}

function buildSystemPrompt(options?: ExamCustomizationOptions): string {
  const count = options?.questionCount ?? 15;
  const subject =
    options?.subject && options.subject !== "Mixed" && options.subject !== "Auto"
      ? `Focus specifically on the subject: ${options.subject}.`
      : `Determine the subject (Physics, Chemistry, Biology, or Mixed) accurately from the material.`;

  let difficultyInstruction =
    "Target Standard NEET Difficulty: mostly MEDIUM difficulty questions with a balanced mix of 25% EASY, 50% MEDIUM, and 25% HARD questions.";
  if (options?.difficulty === "EASY") {
    difficultyInstruction =
      "Target Foundation/Easy difficulty level suitable for fundamental NEET concept revision.";
  } else if (options?.difficulty === "HARD") {
    difficultyInstruction =
      "Target High Difficulty / Rank-Booster level testing deep analytical understanding, multi-step problem solving, and tricky NEET edge-cases.";
  }

  return `You are an expert NEET (National Eligibility cum Entrance Test) question-paper setter for Physics, Chemistry, and Biology.

You will be given source study materials (PDF documents, textbook chapters, handwritten/printed notes, or problem sets). Produce a full computer-based-test (CBT) style mock exam derived STRICTLY from the concepts covered in the source.

Rules:
- Generate EXACTLY ${count} high-quality MCQs.
- ${subject}
- ${difficultyInstruction}
- Every question must be a single-correct-answer MCQ with EXACTLY 4 options (A, B, C, D), matching authentic NEET exam standards.
- Base every question strictly on the subject matter present in the source. Do NOT invent unrelated topics.
- If the source has questions/answers or notes, create original NEET-calibrated questions that test understanding of those key concepts, reactions, definitions, formulae, and mechanisms.
- Format mathematical equations and chemical formulas cleanly (e.g. standard chemical notation or clean LaTeX like $E=mc^2$, $\\Delta H$, $\\text{H}_2\\text{SO}_4$).
- correctOptionIndex is the 0-based index (0, 1, 2, or 3) corresponding to the correct answer in the options array.
- Ensure all 4 options are plausible, non-trivial, and clear (no ambiguous or obviously bogus distractors).
- Provide a clear, concise, and educational explanation for each question explaining why the correct option is right.
- DIAGRAM / SVG GENERATION (diagramSvg):
  * For questions that inherently benefit from visual explanation (e.g., Physics circuit diagrams, ray optics, free-body force vectors, logic gates; Chemistry reaction mechanisms, organic skeletal structures, electrochemical cells, energy profiles; Biology cell organelles, nephron/cardiac pathways, genetics Punnett squares, cycle flowcharts), generate a clean, responsive, valid standalone SVG string in "diagramSvg".
  * SVG Requirements:
    - Must start with <svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg" ...> and end with </svg>.
    - Use clear, modern vector aesthetics with distinct stroke colors (e.g., #2563eb blue, #16a34a green, #dc2626 red, #0f172a dark slate), stroke-width="2", clean fills, and legible <text> labels with font-size="11" or "12" font-family="sans-serif".
    - Must be self-contained (no external scripts or font files).
  * If a question is purely theoretical, definition-based, or standard text numerical without visual necessity, set "diagramSvg": null.
- Provide a descriptive and specific title based on the chapter or topic (e.g. "Thermodynamics & Equilibrium — NEET Mock").

Return ONLY a valid JSON object matching this exact structure:
{
  "title": string,
  "subject": "Physics" | "Chemistry" | "Biology" | "Mixed",
  "questions": [
    {
      "questionText": string,
      "options": [string, string, string, string],
      "correctOptionIndex": 0 | 1 | 2 | 3,
      "explanation": string,
      "diagramSvg": string | null,
      "difficulty": "EASY" | "MEDIUM" | "HARD"
    }
  ]
}`;
}

/** Poll the Files API until the uploaded file is ACTIVE or FAILED. */
async function waitUntilActive(
  ai: GoogleGenAI,
  fileName: string,
  timeoutMs = 120_000
) {
  const start = Date.now();
  let file = await ai.files.get({ name: fileName });
  while (file.state === FileState.PROCESSING) {
    if (Date.now() - start > timeoutMs) {
      throw new Error("Gemini file processing timed out");
    }
    await new Promise((r) => setTimeout(r, 1_500));
    file = await ai.files.get({ name: fileName });
  }
  if (file.state !== FileState.ACTIVE) {
    throw new Error(`Gemini could not process the file (state: ${file.state})`);
  }
  return file;
}

/** Clean any code blocks or accidental markdown wrapper around JSON */
function extractAndParseJson(text: string): unknown {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    // If there's surrounding text, find the outermost JSON object
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Invalid JSON returned from model");
  }
}

/**
 * Generates a NEET mock exam from one or more uploaded files (PDFs/images/notes).
 * Includes automatic model fallback and retry logic to avoid quota/rate-limit interruptions.
 */
export async function generateExamFromFiles(
  files: InputFile[],
  options?: ExamCustomizationOptions
): Promise<GeneratedExam> {
  if (!files.length) {
    throw new Error("No files provided for exam generation.");
  }

  const ai = getClient();
  const systemPrompt = buildSystemPrompt(options);

  const contentParts: Array<
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
    | ReturnType<typeof createPartFromUri>
  > = [{ text: systemPrompt }];

  const uploadedFileNames: string[] = [];

  try {
    // Process all files into multimodal content parts
    for (const file of files) {
      const useFileApi = file.buffer.length > INLINE_MAX_BYTES;
      if (useFileApi) {
        const blob = new Blob([new Uint8Array(file.buffer)], {
          type: file.mimeType,
        });
        const uploaded = await ai.files.upload({
          file: blob,
          config: { mimeType: file.mimeType },
        });
        if (!uploaded.name) {
          throw new Error(`Failed to upload ${file.fileName} to Gemini Files API`);
        }
        uploadedFileNames.push(uploaded.name);

        const ready = await waitUntilActive(ai, uploaded.name);
        if (!ready.uri || !ready.mimeType) {
          throw new Error("Uploaded file is missing URI or MIME type");
        }
        contentParts.push(createPartFromUri(ready.uri, ready.mimeType));
      } else {
        contentParts.push({
          inlineData: {
            mimeType: file.mimeType,
            data: file.buffer.toString("base64"),
          },
        });
      }
    }

    // Fallback models in priority order to guarantee reliability
    const configuredModel = process.env.GEMINI_MODEL;
    const modelCandidates = Array.from(
      new Set(
        [
          configuredModel,
          "gemini-2.5-flash",
          "gemini-2.0-flash",
          "gemini-1.5-flash",
        ].filter((m): m is string => Boolean(m))
      )
    );

    let lastError: unknown = null;

    for (const model of modelCandidates) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [{ role: "user", parts: contentParts }],
          config: {
            responseMimeType: "application/json",
            temperature: 0.5,
          },
        });

        const text = response.text;
        if (!text) throw new Error(`Empty response received from ${model}`);

        const parsed = extractAndParseJson(text);
        return generatedExamSchema.parse(parsed);
      } catch (err) {
        lastError = err;
        console.warn(`Model generation failed on ${model}, attempting fallback:`, err);
        // Brief backoff before next fallback candidate
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    throw lastError ?? new Error("All Gemini generation model candidates failed.");
  } finally {
    // Guaranteed cleanup of all files uploaded during generation
    for (const fileName of uploadedFileNames) {
      ai.files.delete({ name: fileName }).catch(() => {});
    }
  }
}

/** Backward compatibility wrapper */
export async function generateExamFromPdf(
  pdf: Buffer,
  mimeType: string
): Promise<GeneratedExam> {
  return generateExamFromFiles([
    { buffer: pdf, mimeType, fileName: "uploaded-document.pdf" },
  ]);
}

