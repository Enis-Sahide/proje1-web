import { db } from '@/db/client';
import { siteVisits } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
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

    // Insert into database
    await db.insert(siteVisits).values({
      ipHash,
      path,
    });

    return json({ success: true });
  } catch (error: any) {
    console.error('Analytics track error:', error);
    return errorJson(error.message || 'Server error', 500);
  }
}

export const OPTIONS = preflight;
