import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Ücretsiz Human Design Analizi (İnsan Tasarımı) | 7Layers',
  description: 'Doğum bilgilerinize göre Human Design (İnsan Tasarımı) haritanızı çıkarın. Tipinizi, otoritenizi, profilinizi ve yaşam amacınızı derinlemesine analiz edin.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
