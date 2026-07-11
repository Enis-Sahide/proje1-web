import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Kozmik Frekans ve Meditasyon Kütüphanesi | 7Layers',
  description: 'Çakra dengeleme, zihinsel dinginlik ve yüksek benlikle hizalanma meditasyonları. Özel frekans sesleri ve rehberli meditasyon pratikleri.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
