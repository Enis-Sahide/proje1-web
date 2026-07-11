import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Kişisel Kozmik Analizler Portalı | 7Layers',
  description: 'Astroloji, İnsan Tasarımı, Çakra, Numeroloji ve Kabala analizi gibi kişisel kozmik araçlarla kendinizi keşfedin.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
