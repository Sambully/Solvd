import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { generateVideoLessonFromNotes } from "@/features/notes-to-video/utils/geminiGenerator";

export const maxDuration = 120; // Allow sufficient time for Gemini + TTS generation

export async function POST(req: Request) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to generate video lessons." }, { status: 401 });
    }

    let notesText: string | undefined;
    let imageBase64: string | undefined;
    let imageMimeType: string = "image/jpeg";
    let voiceName: string = "en-IN-NeerjaNeural";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const textParam = formData.get("notesText") as string | null;
      if (textParam) notesText = textParam;

      const voiceParam = formData.get("voiceName") as string | null;
      if (voiceParam) voiceName = voiceParam;

      const file = formData.get("file") as File | null;
      if (file) {
        imageMimeType = file.type || "image/jpeg";
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        imageBase64 = buffer.toString("base64");
      }
    } else {
      const body = await req.json();
      notesText = body.notesText;
      imageBase64 = body.imageBase64;
      if (body.imageMimeType) imageMimeType = body.imageMimeType;
      if (body.voiceName) voiceName = body.voiceName;
    }

    if (!notesText?.trim() && !imageBase64) {
      return NextResponse.json(
        { error: "Please provide either notes text or upload an image." },
        { status: 400 }
      );
    }

    const lesson = await generateVideoLessonFromNotes({
      notesText,
      imageBase64,
      imageMimeType,
      voiceName,
    });

    return NextResponse.json({ success: true, lesson });
  } catch (error: unknown) {
    console.error("Error in notes-to-video script API:", error);
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || "Failed to generate video lesson. Please try again." },
      { status: 500 }
    );
  }
}
