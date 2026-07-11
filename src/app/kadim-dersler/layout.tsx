import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Kadim Bilgelik Dersleri ve Sınavları | 7Layers',
  description: 'Ezoterizm, Tarot, Rune, Astroloji, Yoga, Akupunktur ve Sembolizm alanlarında kadim dersleri çalışın, seviyenizi yükseltin ve sınavları tamamlayın.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
