import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor Configuration for Solvd NEET CBT
 *
 * For Local Testing on Physical Android Phone / Emulator:
 * - Update `server.url` to your machine's local Wi-Fi IP (e.g. `http://192.168.1.15:3000`)
 *   or use 10.0.2.2:3000 for standard Android Emulator.
 *
 * For Production Deployed Testing:
 * - Update `server.url` to your live domain (e.g. `https://your-domain.vercel.app`)
 */
const config: CapacitorConfig = {
  appId: "com.solvd.neet",
  appName: "Solvd NEET CBT",
  webDir: "public",
  server: {
    cleartext: true,
    androidScheme: "https",
    url: "https://solvd-ten.vercel.app",
    allowNavigation: [
      "solvd-ten.vercel.app",
      "*.vercel.app",
      "*.clerk.accounts.dev",
      "*.clerk.com",
      "*.accounts.dev",
      "pleasant-dog-63.clerk.accounts.dev",
      "accounts.google.com",
      "*.accounts.google.com",
      "*.google.com",
      "*.google.co.in",
      "*.googleapis.com",
      "*.gstatic.com",
      "ssl.gstatic.com",
      "apis.google.com",
      "content.googleapis.com",
    ],
  },
  android: {
    allowMixedContent: true,
    backgroundColor: "#0f172a",
    overrideUserAgent:
      "Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0f172a",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0f172a",
    },
    Keyboard: {
      resize: "body",
      style: "DARK",
      resizeOnFullScreen: true,
    },
  },
};

export default config;
