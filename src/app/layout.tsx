import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import CapacitorInit from "@/components/CapacitorInit";
import NavigationProgressBar from "@/components/NavigationProgressBar";
import AppDownloadBanner from "@/components/AppDownloadBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Solvd · Authentic NTA NEET CBT Platform",
  description: "Computer-based NEET assessment platform and mock exams for medical aspirants",
  icons: {
    icon: "/app-icon-square.png",
    shortcut: "/app-icon-square.png",
    apple: "/app-icon-square.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <Suspense fallback={null}>
            <NavigationProgressBar />
          </Suspense>
          <CapacitorInit />
          <AppDownloadBanner />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
