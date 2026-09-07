import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import {
  getRoomDetails,
  ensureRoomParticipant,
} from "@/lib/roomActions";
import PersistentRoomHubClient from "./PersistentRoomHubClient";

export default async function TestRoomPage({
  params,
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = await params;
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  // Ensure user is registered as participant
  await ensureRoomParticipant(roomCode, user.id);

  const detailsRes = await getRoomDetails(roomCode);
  if (!detailsRes.success || !detailsRes.room) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-4 p-8 text-center min-h-[60vh]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-black dark:text-zinc-50">
          Room Not Available
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {detailsRes.error || "The test room could not be found or you do not have permission."}
        </p>
        <Link
          href="/dashboard/room"
          className="mt-2 rounded-xl bg-black px-5 py-2.5 text-xs font-semibold text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
        >
          Back to Rooms
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/room"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Study Circles
        </Link>
      </div>

      <PersistentRoomHubClient initialData={detailsRes.room} />
    </main>
  );
}
