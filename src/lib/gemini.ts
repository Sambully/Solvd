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

You will be given source study materials (PDF documents, scanned textbook pages, handwritten notes, question papers, figures, or diagrams). Produce a full computer-based-test (CBT) style mock exam derived STRICTLY from the concepts covered in the source.

MULTIMODAL / IMAGE READING INSTRUCTIONS:
- The input materials may contain scanned textbook pages, photos, handwritten notes, textbook screenshots, chemical structures, circuit diagrams, or charts.
- Thoroughly perform visual OCR across all pages to extract text, equations, reactions, diagrams, and labels.

EXAM RULES:
- Generate EXACTLY ${count} high-quality MCQs.
- ${subject}
- ${difficultyInstruction}
- Every question must be a single-correct-answer MCQ with EXACTLY 4 options (A, B, C, D), matching authentic NEET exam standards.
- Base every question strictly on the subject matter present in the source. Do NOT invent unrelated topics.
- If the source has questions/answers or notes, create original NEET-calibrated questions that test understanding of those key concepts, reactions, definitions, formulae, and mechanisms.
- Format equations and formulas cleanly and legibly (e.g. "Delta H = q_p", "H2SO4", "E = mc^2", "PV = nRT").
- correctOptionIndex is the 0-based index (0, 1, 2, or 3) corresponding to the correct answer in the options array.
- Ensure all 4 options are plausible, non-trivial, and clear (no ambiguous or obviously bogus distractors).
- Provide a clear, concise, and educational explanation for each question explaining why the correct option is right.
- DIAGRAM / SVG GENERATION (diagramSvg):
  * For questions that inherently benefit from visual explanation (e.g., Physics circuit diagrams, ray optics, free-body force vectors; Chemistry reaction mechanisms, organic skeletal structures; Biology pathways), generate a clean, responsive, valid standalone SVG string in "diagramSvg".
  * Keep SVGs compact, clean, and concise (< 400 characters, viewBox="0 0 360 180", stroke-width="2", clear text labels).
  * If a question is purely theoretical, definition-based, or standard text numerical without visual necessity, set "diagramSvg": null.
- Provide a descriptive and specific title based on the chapter or topic (e.g. "Thermodynamics & Equilibrium — NEET Mock").

CRITICAL JSON FORMATTING & ESCAPING:
- Return ONLY a valid JSON object matching the exact structure below.
- Do NOT include markdown code fences or conversational text outside the JSON.
- If using any backslashes (e.g. in formulas), they MUST be double-escaped (\\\\) to ensure the JSON parses without syntax errors.

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

/**
 * Sanitizes and repairs raw model output to guarantee bulletproof JSON parsing,
 * especially handling unescaped LaTeX backslashes, trailing commas, and unclosed brackets.
 */
function sanitizeAndRepairJson(rawText: string): unknown {
  let text = rawText.trim();

  // Strip markdown code fences (```json ... ``` or ``` ...)
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }

  // Extract outermost JSON object if surrounded by preamble/postscript
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.substring(firstBrace, lastBrace + 1);
  }

  // 1. Try standard JSON.parse first
  try {
    return JSON.parse(text);
  } catch {
    // Continue to repair pipeline
  }

  // 2. Repair invalid backslash escapes (e.g. LaTeX \Delta, \text, \frac, \alpha)
  // In JSON, valid escapes are \" \\ \/ \b \f \n \r \t \uXXXX
  let repaired = text.replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, "\\\\");

  // 3. Remove trailing commas before closing braces or brackets (e.g. [1, 2, ] -> [1, 2])
  repaired = repaired.replace(/,\s*([\]}])/g, "$1");

  try {
    return JSON.parse(repaired);
  } catch {
    // Continue to truncated JSON auto-completion
  }

  // 4. Handle truncated JSON (if model response was cut off near token limit)
  let candidate = repaired.trim();
  // Close unclosed quote if odd number of unescaped quotes
  const quoteCount = (candidate.match(/(?<!\\)"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    candidate += '"';
  }

  // Balance open braces and brackets
  let openBrackets = 0;
  let openBraces = 0;
  for (let i = 0; i < candidate.length; i++) {
    const char = candidate[i];
    if (char === "[") openBrackets++;
    else if (char === "]") openBrackets = Math.max(0, openBrackets - 1);
    else if (char === "{") openBraces++;
    else if (char === "}") openBraces = Math.max(0, openBraces - 1);
  }

  while (openBrackets > 0) {
    candidate += "]";
    openBrackets--;
  }
  while (openBraces > 0) {
    candidate += "}";
    openBraces--;
  }

  try {
    return JSON.parse(candidate);
  } catch (finalErr) {
    console.error("JSON parsing failed after all repair attempts. Raw text snippet:", rawText.slice(0, 300));
    throw new Error("Invalid JSON structure returned by model.");
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
          "gemini-2.0-flash",
          "gemini-1.5-flash",
          "gemini-1.5-pro",
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
            maxOutputTokens: 8192,
            temperature: 0.4,
          },
        });

        const text = response.text;
        if (!text) throw new Error(`Empty response received from ${model}`);

        const parsed = sanitizeAndRepairJson(text);
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
