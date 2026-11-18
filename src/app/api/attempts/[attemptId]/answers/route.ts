import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { saveAttemptProgress, type AnswerUpsertInput } from "@/lib/attemptService";
import type { QuestionStatus } from "@/lib/ntaTypes";

async function handleUpsert(
  req: Request,
  context: { params: Promise<{ attemptId: string }> }
) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { attemptId } = await context.params;
  if (!attemptId) {
    return NextResponse.json({ error: "attemptId is required." }, { status: 400 });
  }

  let body: {
    answers?: unknown;
    questionId?: unknown;
    selectedOptionIndex?: unknown;
    status?: unknown;
    currentQuestionIndex?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const answers: AnswerUpsertInput[] = [];

  if (Array.isArray(body.answers)) {
    for (const item of body.answers) {
      if (item && typeof item === "object" && typeof (item as { questionId?: unknown }).questionId === "string") {
        const entry = item as {
          questionId: string;
          selectedOptionIndex?: number | null;
          status?: QuestionStatus;
        };
        answers.push({
          questionId: entry.questionId,
          selectedOptionIndex:
            entry.selectedOptionIndex === undefined ? null : entry.selectedOptionIndex,
          status: entry.status,
        });
      }
    }
  } else if (typeof body.questionId === "string") {
    answers.push({
      questionId: body.questionId,
      selectedOptionIndex:
        typeof body.selectedOptionIndex === "number" ? body.selectedOptionIndex : null,
      status: typeof body.status === "string" ? (body.status as QuestionStatus) : undefined,
    });
  }

  const currentQuestionIndex =
    typeof body.currentQuestionIndex === "number" ? body.currentQuestionIndex : undefined;

  const result = await saveAttemptProgress({
    userId: user.id,
    attemptId,
    answers,
    currentQuestionIndex,
  });

  if (!result.ok) {
    const statusCode =
      result.code === "NOT_FOUND" ? 404 : result.code === "EXPIRED" ? 410 : 409;
    return NextResponse.json({ error: result.error, code: result.code }, { status: statusCode });
  }

  return NextResponse.json(result);
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ attemptId: string }> }
) {
  return handleUpsert(req, context);
}

// POST alias supports navigator.sendBeacon on pagehide/unload
export async function POST(
  req: Request,
  context: { params: Promise<{ attemptId: string }> }
) {
  return handleUpsert(req, context);
}
