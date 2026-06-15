import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/core/ui/Navigation";
import { ThemeProvider } from "@/core/ui/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import AnimatedBackground from "@/core/ui/AnimatedBackground";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Proje1 - Kadim Bilgiler ve Analizler",
  description: "İnsan tasarımı, çakra analizi, meditasyon ve kadim dersler.",
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
            <Navigation />
            <main className="flex-grow flex flex-col">
              {children}
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
