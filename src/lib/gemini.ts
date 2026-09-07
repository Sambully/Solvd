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

const INLINE_MAX_BYTES = 8 * 1024 * 1024; // 8 MB

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

You will be given source study materials (PDF documents, scanned test series pages, handwritten notes, coaching question papers like Aakash/Allen, figures, or diagrams). Produce a full computer-based-test (CBT) style mock exam derived STRICTLY from the concepts covered in the source.

MULTIMODAL / IMAGE READING INSTRUCTIONS:
- The input materials may contain scanned test papers, coaching mock sheets, multi-column layouts, photos, handwritten notes, chemical structures, circuit diagrams, or charts.
- Thoroughly perform visual OCR across all pages and columns (both left & right columns) to read questions, options (1)/(2)/(3)/(4) or (A)/(B)/(C)/(D), equations, formulas, diagrams (e.g. cubical electric flux, capacitors, circuits), and labels.
- If the source is a scanned test paper, extract and calibrate high-yield NEET questions directly based on the questions, numerical problems, and concepts on those pages.

EXAM RULES:
- Generate EXACTLY ${count} high-quality MCQs.
- ${subject}
- ${difficultyInstruction}
- Every question must be a single-correct-answer MCQ with EXACTLY 4 options (A, B, C, D), matching authentic NEET exam standards.
- Base every question strictly on the subject matter present in the source. Do NOT invent unrelated topics.
- If the source has questions/answers or notes, create original NEET-calibrated questions that test understanding of those key concepts, reactions, definitions, formulae, and mechanisms.
- Format equations and formulas cleanly (e.g. "Delta H = q_p", "H2SO4", "E = mc^2", "PV = nRT").
- correctOptionIndex is the 0-based index (0, 1, 2, or 3) corresponding to the correct answer in the options array.
- Ensure all 4 options are plausible, non-trivial, and clear.
- Keep explanations CONCISE (1-2 sentences: core concept + formula/calculation + answer) to ensure fast and reliable generation.
- DIAGRAM / SVG (diagramSvg):
  * Only when a question strictly requires a visual figure (e.g. circuit or capacitor slabs), provide a minimal, compact SVG (< 250 chars, viewBox="0 0 300 150").
  * For all standard numerical or conceptual MCQs, set "diagramSvg": null.
- Provide a descriptive and specific title based on the chapter or topic (e.g. "Electrostatics & Capacitance — NEET Mock").

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
 * including handling unescaped LaTeX backslashes, trailing commas, and token-limit truncations.
 */
function sanitizeAndRepairJson(rawText: string): unknown {
  let text = rawText.trim();

  // Strip markdown code fences (```json ... ``` or ``` ...)
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }

  // Extract outermost JSON block
  const firstBrace = text.indexOf("{");
  const firstBracket = text.indexOf("[");
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    text = text.substring(firstBrace);
  } else if (firstBracket !== -1) {
    text = text.substring(firstBracket);
  }

  // 1. Direct standard parse
  try {
    return JSON.parse(text);
  } catch {}

  // 2. Escape invalid LaTeX backslashes (e.g. \Delta, \mu, \alpha, \text, \frac)
  let repaired = text.replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, "\\\\");

  // 3. Remove trailing commas before closing braces/brackets
  repaired = repaired.replace(/,\s*([\]}])/g, "$1");

  try {
    return JSON.parse(repaired);
  } catch {}

  // 4. Truncation Recovery Strategy A:
  // If model was truncated mid-question near token limit, find last completed question block '}'
  const lastCloseBraceIdx = repaired.lastIndexOf("}");
  if (lastCloseBraceIdx > 0) {
    const candidateWithClosers = repaired.substring(0, lastCloseBraceIdx + 1) + "\n  ]\n}";
    try {
      return JSON.parse(candidateWithClosers);
    } catch {}

    const candidatePlain = repaired.substring(0, lastCloseBraceIdx + 1);
    try {
      return JSON.parse(candidatePlain);
    } catch {}
  }

  // 5. Truncation Recovery Strategy B: Auto-balancer with quote completion
  let candidate = repaired.trim();
  const quoteCount = (candidate.match(/(?<!\\)"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    candidate += '"';
  }

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
  } catch {}

  // 6. Last-ditch: regex-extract question blocks
  const questionBlocks: any[] = [];
  const qMatches = text.matchAll(/\{[^{}]*"question(?:Text)?"[^{}]*\}/g);
  for (const m of qMatches) {
    try {
      const qObj = JSON.parse(m[0]);
      if (qObj.questionText || qObj.question) {
        questionBlocks.push(qObj);
      }
    } catch {}
  }

  if (questionBlocks.length > 0) {
    return {
      title: "NEET Mock Exam",
      subject: "Mixed",
      questions: questionBlocks,
    };
  }

  console.error("JSON parsing failed after all repair attempts. Raw text snippet:", rawText.slice(0, 300));
  throw new Error("Invalid JSON structure returned by model.");
}

/**
 * Normalizes any model JSON output variant (arrays, alternative key names, nested schemas)
 * into the canonical GeneratedExam structure.
 */
function normalizeExamData(raw: unknown): GeneratedExam {
  let data: any = raw;
  if (Array.isArray(data)) {
    data = {
      title: "NEET Mock Exam",
      subject: "Mixed",
      questions: data,
    };
  }

  if (data && typeof data === "object") {
    const rawQuestions = Array.isArray(data.questions)
      ? data.questions
      : Array.isArray(data.exam?.questions)
      ? data.exam.questions
      : Array.isArray(data.mcqs)
      ? data.mcqs
      : [];

    data.questions = rawQuestions.map((q: any) => {
      let options = q.options || q.choices;
      if (!Array.isArray(options) && (q.optionA || q.option1 || q.A)) {
        options = [
          q.optionA || q.option1 || q.A,
          q.optionB || q.option2 || q.B,
          q.optionC || q.option3 || q.C,
          q.optionD || q.option4 || q.D,
        ].filter(Boolean);
      }

      let correctIdx =
        q.correctOptionIndex ??
        q.correct_option_index ??
        q.answerIndex ??
        q.correctAnswerIndex;

      if (typeof q.answer === "string") {
        const trimmed = q.answer.trim().toUpperCase();
        if (trimmed === "A" || trimmed === "(1)" || trimmed === "1") correctIdx = 0;
        else if (trimmed === "B" || trimmed === "(2)" || trimmed === "2") correctIdx = 1;
        else if (trimmed === "C" || trimmed === "(3)" || trimmed === "3") correctIdx = 2;
        else if (trimmed === "D" || trimmed === "(4)" || trimmed === "4") correctIdx = 3;
      }

      return {
        questionText: q.questionText || q.question || q.question_text || q.text || "Question",
        options: Array.isArray(options) ? options : ["A", "B", "C", "D"],
        correctOptionIndex: correctIdx ?? 0,
        explanation: q.explanation || q.solution || "",
        diagramSvg: q.diagramSvg || q.diagram_svg || null,
        difficulty: q.difficulty || "MEDIUM",
      };
    });
  }

  return generatedExamSchema.parse(data);
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

    // Candidate models in priority order to guarantee reliability
    const configuredModel = process.env.GEMINI_MODEL;
    const modelCandidates = Array.from(
      new Set(
        [
          configuredModel,
          "gemini-2.5-flash",
          "gemini-flash-latest",
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
        return normalizeExamData(parsed);
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
