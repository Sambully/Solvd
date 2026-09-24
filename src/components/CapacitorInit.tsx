"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function CapacitorInit() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let unlistenBackButton: (() => void) | undefined;
    let unlistenUrlOpen: (() => void) | undefined;

    async function initNativePlugins() {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;

        // 1. Status Bar Setup
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: "#0f172a" });

        // 2. Deep Link & OAuth Callback Handler
        const { App } = await import("@capacitor/app");
        const { Browser } = await import("@capacitor/browser");
        const urlListener = await App.addListener("appUrlOpen", async (data) => {
          try {
            // Close any active Chrome Custom Tab overlay immediately upon receiving callback
            try {
              await Browser.close();
            } catch {}

            const parsed = new URL(data.url);
            let path = parsed.pathname;
            if (parsed.search) path += parsed.search;
            if (parsed.hash) path += parsed.hash;

            if (path && path !== "/") {
              router.push(path);
            }
          } catch (e) {
            console.warn("Could not parse deep link URL:", e);
          }
        });

        unlistenUrlOpen = () => {
          urlListener.remove();
        };

        // 3. Hardware Back Button Listener
        const backListener = await App.addListener("backButton", ({ canGoBack }) => {
          // Check if user is inside an active timed test
          const isTakingTest =
            window.location.pathname.includes("/tests/runner") ||
            window.location.pathname.includes("/test/");

          if (isTakingTest) {
            const confirmed = window.confirm(
              "You have an ongoing NEET CBT exam in progress. Are you sure you want to exit?"
            );
            if (!confirmed) return;
          }

          if (canGoBack || window.history.length > 1) {
            window.history.back();
          } else {
            // If on home/dashboard root screen with no history, exit app cleanly
            App.exitApp();
          }
        });

        unlistenBackButton = () => {
          backListener.remove();
        };
      } catch (err) {
        console.warn("Capacitor native plugins not initialized:", err);
      }
    }

    initNativePlugins();

    return () => {
      if (unlistenBackButton) unlistenBackButton();
      if (unlistenUrlOpen) unlistenUrlOpen();
    };
  }, [pathname, router]);

  return null;
}
