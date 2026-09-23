import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectTarget = searchParams.get('redirect') || '/';

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'Google OAuth kimlik bilgisi yapılandırılmamış.' }, { status: 500 });
  }

  // Origin tespiti (Localhost vs Canlı alan adı)
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  
  const redirectUri = isLocal
    ? 'http://localhost:3000/api/auth/google/callback'
    : 'https://7layers.tr/api/auth/google/callback';

  // Kullanıcının dönmek istediği URL'yi state içinde taşıyalım
  const state = Buffer.from(JSON.stringify({ redirect: redirectTarget })).toString('base64url');

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'select_account');
  googleAuthUrl.searchParams.set('state', state);

  return NextResponse.redirect(googleAuthUrl.toString());
}
