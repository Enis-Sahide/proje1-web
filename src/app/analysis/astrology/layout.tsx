import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Ezoterik Doğum Haritası Analizi | 7Layers',
  description: 'Doğum tarihiniz, saatiniz ve konumunuza göre ezoterik doğum haritanızı ücretsiz hesaplayın. Gezegenlerin ruhsal derslerinizi ve kozmik şifrenizi keşfedin.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
