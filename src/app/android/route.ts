import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'www.7layers.tr';
  const proto = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const redirectUrl = `${proto}://${host}/indir`;
  return NextResponse.redirect(redirectUrl, 307);
}
