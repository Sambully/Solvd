import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { startOrResumeExamAttempt } from "@/lib/attemptService";

export async function POST(req: Request) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { examId?: unknown; roomId?: unknown; roomExamId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const examId = typeof body.examId === "string" ? body.examId.trim() : "";
  const roomId = typeof body.roomId === "string" && body.roomId.trim() ? body.roomId.trim() : null;
  const roomExamId =
    typeof body.roomExamId === "string" && body.roomExamId.trim() ? body.roomExamId.trim() : null;

  if (!examId) {
    return NextResponse.json({ error: "examId is required." }, { status: 400 });
  }

  try {
    const result = await startOrResumeExamAttempt({
      userId: user.id,
      examId,
      roomId,
      roomExamId,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to initialize exam attempt.";
    const status = /not found|unauthorized/i.test(message) ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
