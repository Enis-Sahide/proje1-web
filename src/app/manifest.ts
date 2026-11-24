import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '7Layers Ancient Knowledge Realm',
    short_name: '7Layers',
    description:
      '7Layers Kadim Bilgiler Alanı - İnsan Tasarımı, Astroloji, Kabala, Çakra Frekansları ve Schumann Rezonansı Platformu.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#050508',
    theme_color: '#050508',
    lang: 'tr',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
