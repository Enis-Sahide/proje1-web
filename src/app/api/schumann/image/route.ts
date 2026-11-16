import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const FALLBACK_IMAGE_PATH = path.join(process.cwd(), 'public', 'shm.jpg');

const SRD_SUPABASE_URL = 'https://ljnpynnorwveqpsgkxws.supabase.co/rest/v1/sonogram_data?select=id,captured_at,image_url,status&status=eq.active&order=captured_at.desc&limit=1';
const SRD_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbnB5bm5vcnd2ZXFwc2dreHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzA3ODgsImV4cCI6MjA3NDc0Njc4OH0.oETMBS9xsjhZk1KDH43FkNO-EEK9bhxw0reYHc2-crE';

interface SharedSchumannImageCache {
  buffer: Buffer;
  fetchedAt: number;
  isOffline: boolean;
  capturedAt: string;
  source: 'live-sos70' | 'live-mirror' | 'fallback-cache';
}

const globalForSchumannImg = globalThis as unknown as {
  __schumannImageCache?: SharedSchumannImageCache;
};

export async function GET() {
  const now = Date.now();
  const cached = globalForSchumannImg.__schumannImageCache;
  if (cached && now - cached.fetchedAt < 180_000) {
    return new NextResponse(new Uint8Array(cached.buffer), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=180, s-maxage=180',
        'X-Schumann-Source': cached.source,
      },
    });
  }

  // 1. Try direct SOS70 live spectrogram first
  try {
    const res = await fetch('https://sos70.ru/provider.php?file=shm.jpg', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://sos70.ru/'
      },
      signal: AbortSignal.timeout(3500),
      cache: 'no-store'
    });

    if (res.ok) {
      const imageBuffer = Buffer.from(await res.arrayBuffer());
      if (imageBuffer.length > 5000 && imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8) {
        globalForSchumannImg.__schumannImageCache = {
          buffer: imageBuffer,
          fetchedAt: Date.now(),
          isOffline: false,
          capturedAt: new Date().toISOString(),
          source: 'live-sos70',
        };
        try {
          await fs.writeFile(FALLBACK_IMAGE_PATH, imageBuffer);
        } catch {}

        return new NextResponse(new Uint8Array(imageBuffer), {
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=300, s-maxage=300',
            'X-Schumann-Source': 'live-sos70',
          },
        });
      }
    }
  } catch (err: any) {
    console.warn('Direct SOS70 image fetch failed:', err?.message || err);
  }

  // 2. Try schumannresonancedata.com archive (which mirrors Tomsk every 10 mins)
  let capturedAtIso = '2026-11-01T23:50:39.113Z';
  let imageBuffer: Buffer | null = null;
  let isRecentMirror = false;

  try {
    const metaRes = await fetch(SRD_SUPABASE_URL, {
      headers: {
        apikey: SRD_SUPABASE_KEY,
        Authorization: `Bearer ${SRD_SUPABASE_KEY}`,
      },
      signal: AbortSignal.timeout(3500),
      cache: 'no-store',
    });

    if (metaRes.ok) {
      const rows = await metaRes.json();
      if (Array.isArray(rows) && rows.length > 0 && rows[0].image_url) {
        capturedAtIso = rows[0].captured_at || capturedAtIso;
        const ageMs = Date.now() - new Date(capturedAtIso).getTime();
        isRecentMirror = ageMs >= 0 && ageMs < 45 * 60 * 1000;

        const imgRes = await fetch(rows[0].image_url, {
          signal: AbortSignal.timeout(4000),
          cache: 'no-store',
        });
        if (imgRes.ok) {
          const buf = Buffer.from(await imgRes.arrayBuffer());
          if (buf.length > 5000) {
            imageBuffer = buf;
            try {
              await fs.writeFile(FALLBACK_IMAGE_PATH, imageBuffer);
            } catch {}
          }
        }
      }
    }
  } catch (mirrorErr: any) {
    console.warn('Mirror sonogram fetch failed:', mirrorErr?.message || mirrorErr);
  }

  // 3. Fallback to local public/shm.jpg if mirror fetch also failed
  try {
    if (!imageBuffer) {
      imageBuffer = await fs.readFile(FALLBACK_IMAGE_PATH);
    }

    const source = isRecentMirror ? 'live-mirror' : 'fallback-cache';
    globalForSchumannImg.__schumannImageCache = {
      buffer: imageBuffer,
      fetchedAt: Date.now(),
      isOffline: !isRecentMirror,
      capturedAt: capturedAtIso,
      source,
    };

    if (isRecentMirror) {
      return new NextResponse(new Uint8Array(imageBuffer), {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=180',
          'X-Schumann-Source': 'live-mirror',
        },
      });
    }

    return new NextResponse(new Uint8Array(imageBuffer), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-cache, max-age=60',
        'X-Schumann-Source': 'fallback-cache',
      },
    });
  } catch (fallbackErr: any) {
    console.error('Schumann Image Proxy Fallback Error:', fallbackErr);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch Schumann Resonance image from Tomsk observatory' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
