import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: '7Layers Blog - Kadim Bilgelik Kütüphanesi | 7Layers',
  description: 'Ezoterizm, manevi uyanış, kozmik portallar, astrolojik geçişler ve bilinci yükselten makalelerin yer aldığı bilgelik arşivi.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
