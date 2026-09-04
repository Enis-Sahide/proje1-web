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
    default: "7Layers Ancient Knowledge School | Kadim Bilgiler Okulu",
    template: "%s | 7Layers Ancient Knowledge School"
  },
  description: "7Layers Ancient Knowledge School (Kadim Bilgiler Okulu) - İnsan Tasarımı (Human Design), Çakra Analizi, Schumann Rezonansı, Gezegen Saatleri ve Kadim İlimler platformu. Kendinizi ve kozmik enerjileri keşfedin.",
  keywords: [
    "7layers",
    "7layers ancient knowledge school",
    "ancient knowledge school",
    "kadim bilgiler okulu",
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
  authors: [{ name: "7Layers Ancient Knowledge School" }],
  creator: "7Layers",
  verification: {
    google: 'a15kbuAKAeY4DSM8hNw31SrHZjIoSb1IIyMFTBEhq14',
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: "7Layers Ancient Knowledge School | Kadim Bilgiler Okulu",
    description: "İnsan Tasarımı, Çakra Analizi, Schumann Rezonansı, Gezegen Saatleri ve Kadim İlimler Okulu. Kendinizi ve kozmik enerjileri keşfedin.",
    url: 'https://www.7layers.tr',
    siteName: '7Layers Ancient Knowledge School',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: '7Layers Ancient Knowledge School Logo',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "7Layers Ancient Knowledge School | Kadim Bilgiler Okulu",
    description: "İnsan Tasarımı, Çakra Analizi, Schumann Rezonansı ve Kadim İlimler Okulu.",
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
