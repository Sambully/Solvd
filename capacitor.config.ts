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
    // Cleartext permits HTTP for local dev server testing on Wi-Fi/Hotspot
    cleartext: true,
    androidScheme: "https",
    url: "http://10.22.205.185:3000",
  },
  android: {
    allowMixedContent: true,
    backgroundColor: "#ffffff",
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
