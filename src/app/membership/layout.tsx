import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: '7Layers Kozmik Üyelik ve Seviye Sistemleri | 7Layers',
  description: 'Üyelik derecenizi yükseltin. Çırak, Kalfa ve Üstat seviyelerine ulaşarak tüm kilitli kadim derslere, sınavlara ve anlık bildirimlere erişin.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
