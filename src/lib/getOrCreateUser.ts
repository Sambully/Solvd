import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getOrCreateUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const name = clerkUser.fullName ?? clerkUser.firstName ?? "Student";

  let lastError: unknown = null;

  // Retry up to 3 times with backoff to handle transient Supabase pooler drops / cold starts
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const user = await prisma.user.upsert({
        where: { clerkId: clerkUser.id },
        update: { email, name },
        create: { clerkId: clerkUser.id, email, name },
      });
      return user;
    } catch (err) {
      lastError = err;
      if (attempt < 3) {
        // Wait 500ms on first retry, 1000ms on second retry
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  console.error("Failed to fetch/create user after 3 database attempts:", lastError);
  throw lastError;
}
