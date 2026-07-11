import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Canlı Schumann Rezonansı & Güneş Rüzgarları | 7Layers',
  description: 'Gezegenimizin doğal frekansı olan 7.83Hz Schumann Rezonansını, güneş rüzgarlarını ve Kp fırtına endeksini anlık uzay uydusu verileriyle takip edin.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
