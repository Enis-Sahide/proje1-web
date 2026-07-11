import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Kişisel Numeroloji Haritası ve Kader Sayısı | 7Layers',
  description: 'Doğum tarihiniz ve isminizin sayısal titreşimlerini analiz edin. Kader sayısı, ruh güdüsü ve yaşam yolu numaralarınızın gizli anlamlarını öğrenin.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
