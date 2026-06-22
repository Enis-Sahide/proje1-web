import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { hashPassword } from '@/lib/auth/password';
import { getAuthPayload } from '@/lib/auth/session';
import { json, errorJson, preflight } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';

// Oturum açmış kullanıcının şifresini değiştirir.
export async function POST(request: Request) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);
  const { password } = await request.json().catch(() => ({}));
  if (!password || String(password).length < 6) {
    return errorJson('Şifre en az 6 karakter olmalı');
  }
  const passwordHash = await hashPassword(String(password));
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, payload.sub));
  return json({ success: true });
}

export const OPTIONS = preflight;
