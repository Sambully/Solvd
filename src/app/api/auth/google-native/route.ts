import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, photoUrl } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const client = await clerkClient();

    // 1. Check if user already exists in Clerk with this email
    const existingUsers = await client.users.getUserList({
      emailAddress: [cleanEmail],
    });

    let userId: string;

    if (existingUsers.data && existingUsers.data.length > 0) {
      userId = existingUsers.data[0].id;
    } else {
      // 2. Create new Clerk user for this Google account
      const newUser = await client.users.createUser({
        emailAddress: [cleanEmail],
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        skipPasswordRequirement: true,
      });
      userId = newUser.id;
    }

    // 3. Create a single-use Sign-In Token (ticket) valid for 5 minutes
    const signInToken = await client.signInTokens.createSignInToken({
      userId,
      expiresInSeconds: 300,
    });

    return NextResponse.json({ token: signInToken.token });
  } catch (error: unknown) {
    console.error("Native Google sign-in backend error:", error);
    const err = error as { message?: string; errors?: Array<{ message?: string }> };
    return NextResponse.json(
      { error: err?.errors?.[0]?.message || err?.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
