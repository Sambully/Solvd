import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendRoomTestReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Core handler to find room exams starting in <= 15 minutes and dispatch emails.
 */
export async function dispatchPendingReminders() {
  const now = new Date();
  // Window: from 2 minutes ago to 15 minutes in the future
  const windowStart = new Date(now.getTime() - 2 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 15 * 60 * 1000);

  // Find all scheduled room exams within the 15-minute window that haven't sent reminders yet
  const pendingRoomExams = await prisma.roomExam.findMany({
    where: {
      scheduledAt: {
        gte: windowStart,
        lte: windowEnd,
      },
      reminderSentAt: null,
      status: {
        in: ["SCHEDULED", "IN_PROGRESS"],
      },
    },
    include: {
      exam: {
        select: {
          id: true,
          title: true,
          durationMinutes: true,
          _count: {
            select: { questions: true },
          },
        },
      },
      room: {
        select: {
          id: true,
          name: true,
          roomCode: true,
          hostUser: {
            select: { name: true },
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const results = [];

  for (const re of pendingRoomExams) {
    const participants = re.room.participants;
    let sentForThisExam = 0;

    for (const p of participants) {
      if (!p.user.email) continue;

      try {
        const sendRes = await sendRoomTestReminderEmail({
          to: p.user.email,
          recipientName: p.user.name || "Student",
          roomName: re.room.name,
          roomCode: re.room.roomCode,
          testTitle: re.exam.title,
          questionCount: re.exam._count.questions,
          durationMinutes: re.exam.durationMinutes,
          scheduledAt: re.scheduledAt,
          hostName: re.room.hostUser.name || "Room Host",
        });

        if (sendRes.success) {
          sentForThisExam++;
        }
      } catch (err) {
        console.error(`[Reminder Dispatch Error] User: ${p.user.email}, Exam: ${re.id}`, err);
      }
    }

    // Mark reminder as sent to avoid duplicate sends
    await prisma.roomExam.update({
      where: { id: re.id },
      data: { reminderSentAt: new Date() },
    });

    results.push({
      roomExamId: re.id,
      roomCode: re.room.roomCode,
      testTitle: re.exam.title,
      scheduledAt: re.scheduledAt,
      recipientsCount: participants.length,
      emailsSent: sentForThisExam,
    });
  }

  return {
    processedCount: pendingRoomExams.length,
    reminders: results,
  };
}

export async function GET() {
  try {
    const summary = await dispatchPendingReminders();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...summary,
    });
  } catch (err) {
    console.error("[Cron Reminders GET Exception]", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to process reminders" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const summary = await dispatchPendingReminders();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...summary,
    });
  } catch (err) {
    console.error("[Cron Reminders POST Exception]", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to process reminders" },
      { status: 500 }
    );
  }
}
