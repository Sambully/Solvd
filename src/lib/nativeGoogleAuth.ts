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

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new NativeAuthTimeoutError(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

async function ensureInitialized(onStage?: (s: string) => void) {
  onStage?.("import-plugin");
  const mod = await withTimeout(
    import("@capawesome/capacitor-google-sign-in"),
    10000,
    "import-plugin"
  );
  const GoogleSignIn = mod.GoogleSignIn;
  if (!initialized) {
    if (!GOOGLE_WEB_CLIENT_ID) {
      throw new NativeAuthConfigError(
        "Google sign-in is not configured. Missing NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID."
      );
    }
    onStage?.("initialize");
    await withTimeout(
      GoogleSignIn.initialize({ clientId: GOOGLE_WEB_CLIENT_ID }),
      10000,
      "initialize"
    );
    initialized = true;
  }
  return GoogleSignIn;
}

export class NativeAuthConfigError extends Error {}

/** Thrown when the user dismisses the native account chooser. */
export class NativeAuthCanceledError extends Error {}

/** Thrown when the native chooser never responds (e.g. misconfigured SHA-1). */
export class NativeAuthTimeoutError extends Error {}

// If the native Credential Manager is misconfigured it can hang forever
// instead of rejecting. Bail out after this long so callers can fall back.
const NATIVE_SIGN_IN_TIMEOUT_MS = 15000;

/**
 * Launches the native Google account chooser and returns the verified
 * ID token plus profile fields.
 *
 * Throws:
 *  - NativeAuthCanceledError if the user backs out
 *  - NativeAuthConfigError if the client ID is missing
 *  - NativeAuthTimeoutError if the native flow never returns
 */
export async function nativeGoogleSignIn(
  onStage?: (s: string) => void
): Promise<NativeGoogleResult> {
  const GoogleSignIn = await ensureInitialized(onStage);

  onStage?.("signIn");
  try {
    const result = await withTimeout(
      GoogleSignIn.signIn(),
      NATIVE_SIGN_IN_TIMEOUT_MS,
      "signIn"
    );
    return {
      idToken: result.idToken,
      email: result.email,
      givenName: result.givenName,
      familyName: result.familyName,
      displayName: result.displayName,
      imageUrl: result.imageUrl,
    };
  } catch (err: unknown) {
    if (err instanceof NativeAuthTimeoutError) throw err;
    const code = (err as { code?: string })?.code ?? "";
    const message = (err as { message?: string })?.message ?? "";
    if (/CANCEL/i.test(code) || /cancel/i.test(message)) {
      throw new NativeAuthCanceledError("Sign-in canceled");
    }
    throw err;
  }
}
