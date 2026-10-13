import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Doğum Haritası Analizi | 7Layers',
  description: 'Doğum tarihiniz, saatiniz ve konumunuza göre doğum haritanızı hesaplayın. Gezegenlerin yaşam derslerinizi ve potansiyellerinizi keşfedin.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
