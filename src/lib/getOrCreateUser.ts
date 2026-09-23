import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const getOrCreateUser = cache(async () => {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const name = clerkUser.fullName ?? clerkUser.firstName ?? "Student";

  try {
    // 1. Ultra-fast indexed read path (avoids write lock delays on Supabase pooler)
    const existing = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (existing) {
      // If user details changed, update without blocking
      if (existing.email !== email || existing.name !== name) {
        prisma.user
          .update({
            where: { id: existing.id },
            data: { email, name },
          })
          .catch(() => {});
      }
      return existing;
    }

    // 2. Only create if user is newly signing up
    const newUser = await prisma.user.create({
      data: { clerkId: clerkUser.id, email, name },
    });
    return newUser;
  } catch {
    // Fallback upsert for resilience
    try {
      return await prisma.user.upsert({
        where: { clerkId: clerkUser.id },
        update: { email, name },
        create: { clerkId: clerkUser.id, email, name },
      });
    } catch (err) {
      console.error("Failed to authenticate/fetch user:", err);
      return null;
    }
  }
});
