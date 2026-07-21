import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '7LAYERS Android Beta Test Ekibine Katılın | Google Play Erken Erişim',
  description: '7LAYERS Android mobil uygulamasını herkesten önce deneyimleyin. Google Play kapalı test ekibimize katılarak erken erişim hakkı kazanın, çakra, insan tasarımı ve gezegen saatlerini mobil cihazınızdan keşfedin.',
  keywords: [
    '7layers android',
    '7layers apk',
    '7layers test ekibi',
    '7layers google play',
    '7layers beta test',
    '7layers mobil uygulama',
    'insan tasarımı android',
    'çakra analizi mobil',
    'gezegen saatleri android',
    'schumann rezonansı mobil'
  ],
  alternates: {
    canonical: 'https://www.7layers.tr/test',
  },
  openGraph: {
    title: '7LAYERS Android Beta Test Ekibine Katılın',
    description: '7LAYERS Android uygulamasını herkesten önce deneyimleyin. Google Play test ekibimize katılarak erken erişim kazanın.',
    url: 'https://www.7layers.tr/test',
    siteName: '7Layers',
    images: [
      {
        url: 'https://www.7layers.tr/logo.png',
        width: 512,
        height: 512,
        alt: '7LAYERS Android Beta Test Logo',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '7LAYERS Android Beta Test Ekibine Katılın',
    description: 'Google Play onay sürecimize destek olun, 7LAYERS Android uygulamasını hemen indirin.',
    images: ['https://www.7layers.tr/logo.png'],
  },
};

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': '7LAYERS',
    'operatingSystem': 'ANDROID',
    'applicationCategory': 'LifestyleApplication',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'TRY'
    },
    'description': 'İnsan Tasarımı, Çakra Analizi, Schumann Rezonansı ve Gezegen Saatleri Mobil Uygulaması',
    'installUrl': 'https://play.google.com/apps/testing/com.enissahide.esk7layers',
    'author': {
      '@type': 'Organization',
      'name': '7Layers'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      {children}
    </>
  );
}
