import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, Plus, Calendar, Clock, ArrowRight, Trophy, Crown } from "lucide-react";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { getUserRooms, type UserRoomSummary } from "@/lib/roomActions";
import RoomLandingClient from "./RoomLandingClient";

export default async function RoomLandingPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const { hostedRooms, joinedRooms } = await getUserRooms();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-6 sm:p-8">
      {/* Header & Quick Action Trigger */}
      <RoomLandingClient
        hostedRooms={hostedRooms}
        joinedRooms={joinedRooms}
      />
    </main>
  );
}
