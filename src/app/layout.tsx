import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/core/ui/Navigation";
import { ThemeProvider } from "@/core/ui/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import RouteGuard from "@/core/ui/RouteGuard";
import AnimatedBackground from "@/core/ui/AnimatedBackground";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import TestBanner from "@/components/TestBanner";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "7Layers - Kadim Bilgiler ve Analizler",
  description: "İnsan tasarımı, çakra analizi, meditasyon ve kadim dersler.",
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className={`${inter.className} min-h-full flex flex-col bg-mystic-dark relative`}>
        {/* Global Esoteric Pattern Background */}
        <AnimatedBackground />
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
          <AuthProvider>
            <RouteGuard>
              <AnalyticsTracker />
              <TestBanner />
              <Navigation />
              <main className="flex-grow flex flex-col">
                {children}
              </main>
            </RouteGuard>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
