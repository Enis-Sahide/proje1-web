import { db } from '@/db/client';
import { siteVisits } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return errorJson('Invalid JSON', 400);
    }

    const { path } = body;
    if (!path) {
      return errorJson('Missing path', 400);
    }

    // Capture IP address safely
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';

    // Hash the IP address to protect privacy but keep uniqueness
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

    // Capture Vercel headers for geolocation
    const country = request.headers.get('x-vercel-ip-country') || null;
    const region = request.headers.get('x-vercel-ip-country-region') || null;
    let city = request.headers.get('x-vercel-ip-city') || null;
    if (city) {
      try {
        city = decodeURIComponent(city);
      } catch (e) {}
    }

    // Identify logged-in user
    let userId = null;
    try {
      const payload = await getAuthPayload(request);
      if (payload && payload.sub) {
        userId = payload.sub;
      }
    } catch (e) {}

    // Insert into database
    await db.insert(siteVisits).values({
      ipHash,
      path,
      country,
      region,
      city,
      userId,
    });

    return json({ success: true });
  } catch (error: any) {
    console.error('Analytics track error:', error);
    return errorJson(error.message || 'Server error', 500);
  }
}

export const OPTIONS = preflight;
