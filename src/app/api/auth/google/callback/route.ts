import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users, profiles } from '@/db/schema';
import { hashPassword } from '@/lib/auth/password';
import { ensureProfileAndProgress, getAccount } from '@/lib/auth/account';
import { signAccessToken } from '@/lib/auth/jwt';
import { createSession, setAuthCookies } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  const origin = isLocal ? 'http://localhost:3000' : 'https://7layers.tr';

  // State içerisindeki hedef yönlendirme adresini ayrıştır
  let redirectTarget = '/';
  if (state) {
    try {
      const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
      if (parsed.redirect && typeof parsed.redirect === 'string') {
        redirectTarget = parsed.redirect;
      }
    } catch (e) {
      console.warn('[Google OAuth] State decode failed:', e);
    }
  }

  // Kullanıcı Google ekranında iptal ettiyse veya hata döndüyse
  if (error || !code) {
    const errorUrl = new URL(redirectTarget, origin);
    errorUrl.searchParams.set('auth_error', error || 'Google ile giriş iptal edildi.');
    return NextResponse.redirect(errorUrl.toString());
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('[Google OAuth] Missing Google Client credentials');
    return NextResponse.redirect(new URL('/?auth_error=google_config_missing', origin));
  }

  const redirectUri = isLocal
    ? 'http://localhost:3000/api/auth/google/callback'
    : 'https://7layers.tr/api/auth/google/callback';

  try {
    // 1. Google'dan authorization code karşılığında access_token al
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('[Google OAuth] Token exchange error:', tokenData);
      return NextResponse.redirect(new URL(`/?auth_error=google_token_failed`, origin));
    }

    // 2. Google UserInfo API'sinden kullanıcı bilgilerini çek
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userInfo = await userInfoRes.json();
    if (!userInfoRes.ok || !userInfo.email) {
      console.error('[Google OAuth] UserInfo fetch error:', userInfo);
      return NextResponse.redirect(new URL(`/?auth_error=google_userinfo_failed`, origin));
    }

    const normEmail = String(userInfo.email).trim().toLowerCase();
    const fullName = userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim() || null;
    const picture = userInfo.picture || null;

    // 3. Veritabanında kullanıcıyı ara veya yeni kayıt aç
    const [existing] = await db.select().from(users).where(eq(users.email, normEmail));
    let userId = existing?.id;

    if (!existing) {
      // Yeni kullanıcı: Güvenli rastgele şifre ata, e-postasını doğrulanmış yap
      const randomPassword = randomBytes(32).toString('hex');
      const passwordHash = await hashPassword(randomPassword);

      const [newUser] = await db
        .insert(users)
        .values({
          email: normEmail,
          passwordHash,
          fullName,
          emailVerified: true,
          emailVerifiedAt: new Date(),
        })
        .returning();

      userId = newUser.id;
    } else {
      // Mevcut kullanıcı: E-postasını doğrulanmış olarak güncelle
      await db
        .update(users)
        .set({
          emailVerified: true,
          emailVerifiedAt: existing.emailVerifiedAt || new Date(),
          fullName: existing.fullName || fullName,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.id));
    }

    // Profil ve ilerleme satırlarını güvenceye al
    await ensureProfileAndProgress(userId, normEmail);

    // Profil fotoğrafı varsa ve henüz atanmamışsa kaydet
    if (picture) {
      const [p] = await db.select().from(profiles).where(eq(profiles.userId, userId));
      if (p && !p.avatarUrl) {
        await db.update(profiles).set({ avatarUrl: picture }).where(eq(profiles.userId, userId));
      }
    }

    // 4. Sistemimizin JWT oturumunu başlat
    const account = await getAccount(userId);
    if (!account) {
      throw new Error('Hesap veritabanından okunamadı.');
    }

    const accessToken = await signAccessToken({
      sub: account.id,
      email: account.email,
      role: account.role,
    });

    const { token: refreshToken, expiresAt } = await createSession(
      account.id,
      request.headers.get('user-agent'),
    );

    // 5. Hedef sayfaya çerezlerle yönlendir
    const targetUrl = new URL(redirectTarget, origin);
    const response = NextResponse.redirect(targetUrl);
    setAuthCookies(response, accessToken, refreshToken, expiresAt);

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen OAuth hatası';
    console.error('[Google OAuth Callback] Error:', msg);
    return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(msg)}`, origin));
  }
}
