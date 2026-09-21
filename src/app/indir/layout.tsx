import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '7LAYERS Mobil Uygulamasını İndir | Google Play',
  description: '7LAYERS Kadim Bilgiler ve Kozmik Analiz Android uygulamasını Google Play Store üzerinden hemen ücretsiz indirin.',
  openGraph: {
    title: '7LAYERS Mobil Uygulamasını İndir',
    description: 'Canlı Schumann rezonansı, kozmik analizler ve frekans odası cebinizde.',
    url: 'https://www.7layers.tr/indir',
    siteName: '7LAYERS',
    type: 'website',
  },
};

export default function IndirLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
