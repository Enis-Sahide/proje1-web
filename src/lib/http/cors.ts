import { NextResponse } from 'next/server';

// Mobil (Expo web) veya farklı origin'den çağrılara izin ver. Native fetch CORS'a
// tabi değildir; bu başlıklar tarayıcı tabanlı çağrılar için güvenli varsayılan.
export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export function json(data: unknown, init: ResponseInit = {}): NextResponse {
  const res = NextResponse.json(data as any, init);
  for (const [k, v] of Object.entries(CORS_HEADERS)) res.headers.set(k, v);
  return res;
}

export function preflight(): NextResponse {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export function errorJson(message: string, status = 400, extra?: Record<string, unknown>) {
  return json({ error: message, ...extra }, { status });
}
