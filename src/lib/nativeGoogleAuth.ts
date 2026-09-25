/**
 * Native Google Sign-In helper (Android/iOS via Capacitor).
 *
 * On a native device this drives the OS-level Google account chooser
 * (Credential Manager) instead of a web OAuth redirect, so tapping
 * "Continue with Google" shows the native one-tap account sheet and
 * never leaves the app for Chrome.
 *
 * Requires the Google **Web Client ID** (same value on Android, iOS and Web)
 * exposed as NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID. The Android OAuth client's
 * package name + SHA-1 must also be registered in Google Cloud Console.
 */

export const GOOGLE_WEB_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";

export type NativeGoogleResult = {
  idToken: string;
  email: string | null;
  givenName: string | null;
  familyName: string | null;
  displayName: string | null;
  imageUrl: string | null;
};

/** True when running inside the Capacitor native shell (not a plain browser). */
export async function isNativePlatform(): Promise<boolean> {
  try {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

// The plugin's initialize() must run once per app session before signIn().
let initialized = false;

async function ensureInitialized() {
  const { GoogleSignIn } = await import("@capawesome/capacitor-google-sign-in");
  if (!initialized) {
    if (!GOOGLE_WEB_CLIENT_ID) {
      throw new NativeAuthConfigError(
        "Google sign-in is not configured. Missing NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID."
      );
    }
    await GoogleSignIn.initialize({ clientId: GOOGLE_WEB_CLIENT_ID });
    initialized = true;
  }
  return GoogleSignIn;
}

export class NativeAuthConfigError extends Error {}

/** Thrown when the user dismisses the native account chooser. */
export class NativeAuthCanceledError extends Error {}

/**
 * Launches the native Google account chooser and returns the verified
 * ID token plus profile fields. Throws NativeAuthCanceledError if the
 * user backs out, NativeAuthConfigError if the client ID is missing.
 */
export async function nativeGoogleSignIn(): Promise<NativeGoogleResult> {
  const GoogleSignIn = await ensureInitialized();

  try {
    const result = await GoogleSignIn.signIn();
    return {
      idToken: result.idToken,
      email: result.email,
      givenName: result.givenName,
      familyName: result.familyName,
      displayName: result.displayName,
      imageUrl: result.imageUrl,
    };
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code ?? "";
    const message = (err as { message?: string })?.message ?? "";
    if (/CANCEL/i.test(code) || /cancel/i.test(message)) {
      throw new NativeAuthCanceledError("Sign-in canceled");
    }
    throw err;
  }
}
