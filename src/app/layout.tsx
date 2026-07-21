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
  metadataBase: new URL('https://www.7layers.tr'),
  title: {
    default: "7Layers - Kadim Bilgiler, İnsan Tasarımı & Çakra Analizi",
    template: "%s | 7Layers"
  },
  description: "İnsan Tasarımı (Human Design), Çakra Analizi, Schumann Rezonansı, Gezegen Saatleri ve Kadim Bilgiler platformu. Kendinizi ve kozmik enerjileri keşfedin.",
  keywords: [
    "7layers",
    "insan tasarımı",
    "human design türkçe",
    "çakra analizi",
    "schumann rezonansı",
    "gezegen saatleri",
    "meditasyon",
    "nefes egzersizleri",
    "kadim bilgiler",
    "7layers android"
  ],
  authors: [{ name: "7Layers" }],
  creator: "7Layers",
  publisher: "7Layers",
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: "7Layers - Kadim Bilgiler, İnsan Tasarımı & Çakra Analizi",
    description: "İnsan Tasarımı, Çakra Analizi, Schumann Rezonansı ve Gezegen Saatleri platformu. Kendinizi ve kozmik enerjileri keşfedin.",
    url: 'https://www.7layers.tr',
    siteName: '7Layers',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: '7Layers Logo',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "7Layers - Kadim Bilgiler ve Analizler",
    description: "İnsan Tasarımı, Çakra Analizi, Schumann Rezonansı ve Gezegen Saatleri.",
    images: ['/logo.png'],
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
