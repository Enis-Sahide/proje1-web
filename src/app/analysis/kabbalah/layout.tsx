import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Kabalistik 4 Alem & Hayat Ağacı Analizi | 7Layers',
  description: 'Doğum haritanızın Kabala Sefirot (Hayat Ağacı) üzerindeki yerleşimlerini analiz edin. Ruhunuzun 4 alemdeki (Assiah, Yetzirah, Beriyah, Atzilut) yolculuğunu keşfedin.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
