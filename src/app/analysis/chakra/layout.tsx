import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Kişisel Çakra Analizi ve Denge Raporu | 7Layers',
  description: 'Çakralarınızın aktiflik düzeylerini test edin. Hangi çakranızın tıkalı olduğunu öğrenin ve dengeleyici meditasyon pratikleriyle enerjinizi hizalayın.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
