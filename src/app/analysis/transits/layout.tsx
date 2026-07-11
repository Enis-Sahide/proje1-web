import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Anlık Gökyüzü Transit Hesaplama | 7Layers',
  description: 'Gökyüzündeki güncel transit gezegenlerin doğum haritanıza olan etkilerini analiz edin. Şu an hangi evinizde hangi gezegenin aktif olduğunu öğrenin.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
