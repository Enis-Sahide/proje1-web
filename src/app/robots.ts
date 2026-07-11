import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/*',
        '/profile',
        '/profile/*',
        '/auth',
        '/auth/*',
        '/api',
        '/api/*',
      ],
    },
    sitemap: 'https://www.7layers.tr/sitemap.xml',
  };
}
