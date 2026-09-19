import { db } from '@/db/client';
import { siteVisits } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import { getAccount } from '@/lib/auth/account';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const BOT_PATTERNS = /bot|crawl|spider|slurp|google|bing|yandex|baidu|duckduckgo|ahrefs|semrush|petalbot|headless|monitoring|uptime/i;

export async function POST(request: Request) {
  try {
    const userAgent = request.headers.get('user-agent') || '';
    if (BOT_PATTERNS.test(userAgent)) {
      return json({ success: true, ignored: 'bot' });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return errorJson('Invalid JSON', 400);
    }

    const { path, visitorId: clientVisitorId } = body;
    if (!path) {
      return errorJson('Missing path', 400);
    }

    // Ignore admin paths from public tracking
    if (path.startsWith('/admin')) {
      return json({ success: true, ignored: 'admin_path' });
    }

    // Capture clean client IP address (take first IP from x-forwarded-for chain)
    const rawForwarded = request.headers.get('x-forwarded-for');
    const rawRealIp = request.headers.get('x-real-ip');
    const clientIp = rawForwarded 
      ? rawForwarded.split(',')[0].trim() 
      : (rawRealIp ? rawRealIp.trim() : '127.0.0.1');

    // Hash the cleaned client IP for privacy
    const ipHash = crypto.createHash('sha256').update(clientIp).digest('hex');

    // Extract visitor ID from body or cookie
    let visitorId = clientVisitorId || null;
    if (!visitorId) {
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(/7l_vid=([^;]+)/);
      if (match) {
        visitorId = match[1];
      }
    }

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
        // If logged in as admin, do not pollute public analytics
        const account = await getAccount(payload.sub);
        if (account?.role === 'admin') {
          return json({ success: true, ignored: 'admin_user' });
        }
      }
    } catch (e) {}

    // Insert into database
    await db.insert(siteVisits).values({
      ipHash,
      visitorId: visitorId || ipHash, // fallback to ipHash if visitorId not provided
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
