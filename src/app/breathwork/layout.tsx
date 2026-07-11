import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Prana & Diyafram Nefes Egzersizleri | 7Layers',
  description: 'Enerji seviyenizi dengeleyecek kadim pranayama nefes teknikleri. Akciğer kapasitesini artırıcı ve stres azaltıcı kontrollü nefes rehberleri.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
