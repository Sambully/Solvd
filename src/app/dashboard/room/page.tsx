import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { getUserRooms } from "@/lib/roomActions";
import RoomLandingClient from "./RoomLandingClient";

export default async function RoomLandingPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const { rooms } = await getUserRooms();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-6 sm:p-8">
      <RoomLandingClient rooms={rooms || []} />
    </main>
  );
}
