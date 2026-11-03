import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

const FALLBACK_IMAGE_PATH = path.join(process.cwd(), 'public', 'shm.jpg');

async function addOfflineOverlayToImage(imageBuffer: Buffer): Promise<Buffer> {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 1480;
    const height = metadata.height || 420;

    // Day 3 (02.11.2026) starts at X=966; 02:30 TR time = 06:30 Tomsk time -> X ≈ 1089
    const cutoffX = Math.round((1089 / 1480) * width);
    const graphTopY = Math.round((28 / 420) * height);
    const graphBottomY = Math.round((393 / 420) * height);
    const logoLeftX = Math.round((1378 / 1480) * width);
    const logoBottomY = Math.round((90 / 420) * height);
    const legendLeftX = Math.round((1442 / 1480) * width);

    const bannerWidth = Math.min(width - 40, 960);
    const bannerHeight = 56;
    const bannerX = Math.round((width - bannerWidth) / 2);
    const bannerY = Math.round(height - bannerHeight - 36);

    const day1X = Math.round((285 / 1480) * width);
    const day2X = Math.round((740 / 1480) * width);
    const day3X = Math.round((1195 / 1480) * width);

    const svgOverlay = Buffer.from(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="warnBg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#1c1204" stop-opacity="0.94" />
            <stop offset="50%" stop-color="#2e1d05" stop-opacity="0.96" />
            <stop offset="100%" stop-color="#1c1204" stop-opacity="0.94" />
          </linearGradient>
        </defs>

        <!-- Update top date headers to 31.10.2026, 01.11.2026, 02.11.2026 -->
        <rect x="140" y="0" width="${logoLeftX - 150}" height="${graphTopY - 2}" fill="#000000" />
        <text x="${day1X}" y="18" font-family="Arial, Helvetica, sans-serif" font-size="13" fill="#E5E7EB" text-anchor="middle">31.10.2026</text>
        <text x="${day2X}" y="18" font-family="Arial, Helvetica, sans-serif" font-size="13" fill="#E5E7EB" text-anchor="middle">01.11.2026</text>
        <text x="${day3X}" y="18" font-family="Arial, Helvetica, sans-serif" font-size="13" fill="#E5E7EB" text-anchor="middle">02.11.2026</text>

        <!-- Blank out unmeasured region after 02.11.2026 02:30 TR (06:30 Tomsk) while keeping SOS70 logo & legend -->
        <rect x="${cutoffX}" y="${graphTopY}" width="${logoLeftX - cutoffX}" height="${logoBottomY - graphTopY}" fill="#000000" />
        <rect x="${cutoffX}" y="${logoBottomY}" width="${legendLeftX - cutoffX}" height="${graphBottomY - logoBottomY}" fill="#000000" />

        <!-- Vertical cutoff dashed line at 02.11 02:30 TSI (06:30 Tomsk) -->
        <line
          x1="${cutoffX}"
          y1="${graphTopY}"
          x2="${cutoffX}"
          y2="${graphBottomY}"
          stroke="#F59E0B"
          stroke-width="2"
          stroke-dasharray="6,4"
        />
        <rect x="${cutoffX + 8}" y="${graphTopY + 14}" width="248" height="42" rx="8" fill="#181004" fill-opacity="0.92" stroke="#F59E0B" stroke-width="1" />
        <text x="${cutoffX + 18}" y="${graphTopY + 32}" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="bold" fill="#FBBF24">SON OLCUM: 2 Kasim 02:30 (TSI)</text>
        <text x="${cutoffX + 18}" y="${graphTopY + 48}" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#FDE68A">Tomsk: 06:30 sonrasinda veri kesintisi</text>

        <!-- Bottom-center main warning overlay -->
        <rect
          x="${bannerX}"
          y="${bannerY}"
          width="${bannerWidth}"
          height="${bannerHeight}"
          rx="12"
          ry="12"
          fill="url(#warnBg)"
          stroke="#F59E0B"
          stroke-width="2"
        />
        <circle cx="${bannerX + 28}" cy="${bannerY + 28}" r="11" fill="#F59E0B" />
        <text
          x="${bannerX + 28}"
          y="${bannerY + 33}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="15"
          font-weight="bold"
          fill="#000000"
          text-anchor="middle"
        >!</text>
        <text
          x="${bannerX + 52}"
          y="${bannerY + 23}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="13"
          font-weight="bold"
          fill="#FBBF24"
        >SOS70 (TOMSK) KAYNAGINA ULASILAMIYOR - SON OLCUM: 2 KASIM 02:30 (TSI)</text>
        <text
          x="${bannerX + 52}"
          y="${bannerY + 42}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="11"
          fill="#FDE68A"
        >Bos ekran yerine veri kesintisinden onceki en son hesaplanan spektrogram gorseli gosterilmektedir.</text>
      </svg>
    `);

    return await sharp(imageBuffer)
      .composite([{ input: svgOverlay, top: 0, left: 0 }])
      .jpeg({ quality: 92 })
      .toBuffer();
  } catch (err) {
    console.error('Error compositing offline overlay onto fallback shm.jpg:', err);
    return imageBuffer;
  }
}

export async function GET() {
  try {
    const res = await fetch('https://sos70.ru/provider.php?file=shm.jpg', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://sos70.ru/'
      },
      signal: AbortSignal.timeout(4500),
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch image from Tomsk: ${res.status}`);
    }

    const arrayBuf = await res.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuf);

    // Save clean copy to public/shm.jpg so we always have the most recent valid spectrogram on disk
    try {
      await fs.writeFile(FALLBACK_IMAGE_PATH, imageBuffer);
    } catch (writeErr) {
      console.warn('Could not update cached public/shm.jpg:', writeErr);
    }

    return new NextResponse(new Uint8Array(imageBuffer), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'X-Schumann-Source': 'live',
      },
    });
  } catch (error: any) {
    console.warn('Schumann Image Proxy falling back to cached public/shm.jpg:', error?.message || error);
    try {
      const cachedBuffer = await fs.readFile(FALLBACK_IMAGE_PATH);
      const compositedBuffer = await addOfflineOverlayToImage(cachedBuffer);

      return new NextResponse(new Uint8Array(compositedBuffer), {
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
}
