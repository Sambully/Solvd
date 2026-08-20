import {
  GoogleGenAI,
  createPartFromUri,
  FileState,
} from "@google/genai";
import { generatedExamSchema, type GeneratedExam } from "@/lib/examTypes";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenAI({ apiKey });
}

const SYSTEM_PROMPT = `You are an expert NEET (National Eligibility cum Entrance Test) question-paper setter for Physics, Chemistry, and Biology.

You will be given a source document (a syllabus PDF, chapter, handwritten/printed notes, or a question-and-answer sheet). Produce a full computer-based-test (CBT) style mock exam derived STRICTLY from the concepts covered in that source.

Rules:
- Every question must be a single-correct-answer MCQ with EXACTLY 4 options, in the style and difficulty of the real NEET exam.
- Base every question only on the subject matter present in the source. Do NOT invent topics that are not related to the source.
- If the source is already a set of questions and answers, generate NEW questions that test the SAME concepts the way NEET would ask them (rephrase, apply, or extend — do not copy verbatim).
- If the source is notes or a chapter, create questions that check understanding of the key concepts, definitions, reactions, formulae, and applications in it.
- Mix difficulty realistically: mostly MEDIUM, some EASY and some HARD.
- correctOptionIndex is the 0-based index of the correct option in the options array.
- Keep options plausible and non-trivial (avoid obviously wrong throwaway options).
- Provide a concise explanation for the correct answer for each question.
- Choose a sensible number of questions based on how much material the source contains (between 10 and 30). Prefer 15-25 for a normal chapter.
- Give the exam a short, specific title based on the actual content (e.g. "Thermodynamics — NEET Mock" or "Human Physiology: Digestion").

Return ONLY JSON matching this exact shape:
{
  "title": string,
  "subject": "Physics" | "Chemistry" | "Biology" | "Mixed",
  "questions": [
    {
      "questionText": string,
      "options": [string, string, string, string],
      "correctOptionIndex": 0 | 1 | 2 | 3,
      "explanation": string,
      "difficulty": "EASY" | "MEDIUM" | "HARD"
    }
  ]
}`;

// Small threshold: inline for tiny PDFs, File API for anything real.
// The inline path forces the whole PDF through the same request that runs the
// generation, so on a large file the connection hits undici's headers timeout
// before Gemini responds. Uploading via the File API decouples upload from
// generation and reliably handles multi-MB PDFs.
const INLINE_MAX_BYTES = 512 * 1024;

/** Poll the Files API until the uploaded file is ACTIVE or FAILED. */
async function waitUntilActive(
  ai: GoogleGenAI,
  fileName: string,
  timeoutMs = 120_000
) {
  const start = Date.now();
  // First fetch happens immediately in case the upload finished processing during transit.
  let file = await ai.files.get({ name: fileName });
  while (file.state === FileState.PROCESSING) {
    if (Date.now() - start > timeoutMs) {
      throw new Error("Gemini file processing timed out");
    }
    await new Promise((r) => setTimeout(r, 2_000));
    file = await ai.files.get({ name: fileName });
  }
  if (file.state !== FileState.ACTIVE) {
    throw new Error(`Gemini could not process the file (state: ${file.state})`);
  }
  return file;
}

/**
 * Sends a PDF to Gemini and returns a validated, structured exam.
 * For any non-trivial PDF this uploads via the File API first, then references
 * the uploaded file in the generation call — avoiding the undici headers
 * timeout you hit when a large inline payload has to travel with the request.
 */
export async function generateExamFromPdf(
  pdf: Buffer,
  mimeType: string
): Promise<GeneratedExam> {
  const ai = getClient();

  const useFileApi = pdf.length > INLINE_MAX_BYTES;

  const contentParts: Array<
    { text: string } | { inlineData: { mimeType: string; data: string } } | ReturnType<typeof createPartFromUri>
  > = [{ text: SYSTEM_PROMPT }];

  let uploadedFileName: string | null = null;

  if (useFileApi) {
    const blob = new Blob([new Uint8Array(pdf)], { type: mimeType });
    const uploaded = await ai.files.upload({
      file: blob,
      config: { mimeType },
    });
    if (!uploaded.name) throw new Error("Gemini upload returned no file name");
    uploadedFileName = uploaded.name;

    const ready = await waitUntilActive(ai, uploaded.name);
    if (!ready.uri || !ready.mimeType) {
      throw new Error("Uploaded file is missing URI/mimeType");
    }
    contentParts.push(createPartFromUri(ready.uri, ready.mimeType));
  } else {
    contentParts.push({
      inlineData: { mimeType, data: pdf.toString("base64") },
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: contentParts }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Gemini returned an empty response");

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("Gemini returned invalid JSON");
    }

    return generatedExamSchema.parse(parsed);
  } finally {
    // Clean up: Gemini keeps uploaded files for 48h, but we don't need them
    // after generation. Failure here is non-fatal.
    if (uploadedFileName) {
      ai.files.delete({ name: uploadedFileName }).catch(() => {});
    }
  }
}
