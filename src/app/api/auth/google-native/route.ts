import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * The Google Web Client ID. A native ID token minted through the Android/iOS
 * Credential Manager carries this value as its `aud` claim, so we verify
 * against it. Public client IDs are not secrets, so reusing the NEXT_PUBLIC
 * var here is fine.
 */
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";

type GoogleTokenInfo = {
  aud?: string;
  iss?: string;
  sub?: string;
  exp?: string;
  email?: string;
  email_verified?: string | boolean;
  given_name?: string;
  family_name?: string;
  picture?: string;
  error?: string;
  error_description?: string;
};

/**
 * Verifies a Google ID token via Google's tokeninfo endpoint and returns the
 * trusted claims, or null if the token is invalid / not intended for this app.
 */
async function verifyGoogleIdToken(idToken: string): Promise<GoogleTokenInfo | null> {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;

  const info = (await res.json()) as GoogleTokenInfo;
  if (info.error) return null;

  // Audience must be our client ID — rejects tokens minted for other apps.
  if (!GOOGLE_CLIENT_ID || info.aud !== GOOGLE_CLIENT_ID) return null;

  // Issuer must be Google.
  if (info.iss !== "https://accounts.google.com" && info.iss !== "accounts.google.com") {
    return null;
  }

  // Must not be expired.
  if (info.exp && Number(info.exp) * 1000 <= Date.now()) return null;

  // Email must be present and verified by Google.
  if (!info.email) return null;
  if (info.email_verified !== true && info.email_verified !== "true") return null;

  return info;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { idToken } = body ?? {};

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Google ID token is required" }, { status: 400 });
    }

    if (!GOOGLE_CLIENT_ID) {
      console.error("NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID is not configured");
      return NextResponse.json(
        { error: "Google sign-in is not configured on the server" },
        { status: 500 }
      );
    }

    const claims = await verifyGoogleIdToken(idToken);
    if (!claims || !claims.email) {
      return NextResponse.json({ error: "Invalid Google credentials" }, { status: 401 });
    }

    // Only ever trust the verified email from the token, never the request body.
    const cleanEmail = claims.email.trim().toLowerCase();
    const client = await clerkClient();

    // 1. Find existing Clerk user by verified email.
    const existingUsers = await client.users.getUserList({
      emailAddress: [cleanEmail],
    });

    let userId: string;

    if (existingUsers.data && existingUsers.data.length > 0) {
      userId = existingUsers.data[0].id;
    } else {
      // 2. Create a new Clerk user for this Google account.
      const newUser = await client.users.createUser({
        emailAddress: [cleanEmail],
        firstName: claims.given_name || undefined,
        lastName: claims.family_name || undefined,
        skipPasswordRequirement: true,
      });
      userId = newUser.id;
    }

    // 3. Issue a single-use sign-in ticket (valid 5 minutes).
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
