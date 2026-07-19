import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch('https://sos70.ru/provider.php?file=shm.jpg', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://sos70.ru/'
      },
      next: { revalidate: 600 } // Cache for 10 minutes
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch image from Tomsk: ${res.status}`);
    }

    const imageBuffer = await res.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error: any) {
    console.error('Schumann Image Proxy Error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch Schumann Resonance image from Tomsk observatory' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
