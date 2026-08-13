import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getOrCreateUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const name = clerkUser.fullName ?? clerkUser.firstName ?? "Student";

  const user = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: { email, name },
    create: { clerkId: clerkUser.id, email, name },
  });

  return user;
}
