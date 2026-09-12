import { eq, and, gt, desc } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '@/db/client';
import { users, emailVerifications, siteVisits } from '@/db/schema';
import { ensureProfileAndProgress } from '@/lib/auth/account';
import { buildAuthResponse } from '@/lib/auth/respond';
import { errorJson, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, code } = body;

    if (!email || !code) {
      return errorJson('E-posta ve doğrulama kodu gereklidir.', 400);
    }

    const normEmail = String(email).trim().toLowerCase();
    const cleanCode = String(code).trim();

    // En son oluşturulan ve henüz süresi dolmamış doğrulama kodunu bul
    const [verification] = await db
      .select()
      .from(emailVerifications)
      .where(
        and(
          eq(emailVerifications.email, normEmail),
          gt(emailVerifications.expiresAt, new Date())
        )
      )
      .orderBy(desc(emailVerifications.createdAt))
      .limit(1);

    if (!verification || verification.code !== cleanCode) {
      return errorJson('Doğrulama kodu hatalı veya süresi dolmuş. Lütfen kontrol edip tekrar deneyin.', 400);
    }

    // Kullanıcı users tablosunda yoksa şimdi oluştur (Lazy Registration)
    let [u] = await db.select().from(users).where(eq(users.email, normEmail));
    if (!u) {
      if (!verification.passwordHash) {
        return errorJson('Kayıt oturumunuzun süresi dolmuş. Lütfen formu doldurarak tekrar kayıt olun.', 400);
      }
      const [newUser] = await db
        .insert(users)
        .values({
          email: normEmail,
          passwordHash: verification.passwordHash,
          fullName: verification.fullName ?? null,
          emailVerified: true,
          emailVerifiedAt: new Date(),
        })
        .returning();
      u = newUser;
    } else {
      // Varsa doğrulanmış olarak güncelle
      await db
        .update(users)
        .set({
          emailVerified: true,
          emailVerifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, u.id));
    }

    await ensureProfileAndProgress(u.id, u.email);

    // Kullanılan doğrulama kodunu sil
    await db.delete(emailVerifications).where(eq(emailVerifications.email, normEmail));

    // İlk aktivite izini site_visits tablosuna ekle (Admin panelinde anında görünmesi için)
    try {
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 '127.0.0.1';
      const ipHash = crypto.createHash('sha256').update(ip).digest('hex');
      const country = request.headers.get('x-vercel-ip-country') || null;
      const region = request.headers.get('x-vercel-ip-country-region') || null;
      let city = request.headers.get('x-vercel-ip-city') || null;
      if (city) {
        try {
          city = decodeURIComponent(city);
        } catch (e) {}
      }

      await db.insert(siteVisits).values({
        ipHash,
        path: '/auth/register',
        country,
        region,
        city,
        userId: u.id,
      });
    } catch (err) {
      console.error('Failed to log registration visit:', err);
    }

    // Oturumu başlat ve yanıtı döndür
    return buildAuthResponse(u.id, request);
  } catch (err: any) {
    console.error('[Verify Email API Error]:', err);
    return errorJson(err?.message || 'Doğrulama sırasında beklenmeyen bir hata oluştu.', 500);
  }
}

export const OPTIONS = preflight;
