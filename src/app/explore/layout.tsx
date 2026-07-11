import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Kozmik Portal Keşif Alanı | 7Layers',
  description: 'Farklı analiz araçları, kütüphaneler, günlük kozmik hava tahminleri ve manevi gelişim pratiklerini keşfedin.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
