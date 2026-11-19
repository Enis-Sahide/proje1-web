import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users, profiles } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import { getAccount } from '@/lib/auth/account';
import { publicUser } from '@/lib/auth/respond';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);
  const { fullName, race, avatarUrl } = await request.json().catch(() => ({}));

  if (fullName !== undefined) {
    await db.update(users).set({ fullName, updatedAt: new Date() }).where(eq(users.id, payload.sub));
  }
  if (race !== undefined || avatarUrl !== undefined) {
    const patch: Record<string, unknown> = {};
    if (race !== undefined) patch.race = race;
    if (avatarUrl !== undefined) patch.avatarUrl = avatarUrl;
    await db.update(profiles).set(patch).where(eq(profiles.userId, payload.sub));
  }

  const account = await getAccount(payload.sub);
  if (!account) return errorJson('Kullanıcı bulunamadı', 404);
  return json({ user: publicUser(account) });
}

export async function DELETE(request: Request) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);

  const [existing] = await db.select().from(users).where(eq(users.id, payload.sub));
  if (!existing) return errorJson('Kullanıcı bulunamadı', 404);

  // Cascade delete removes profiles, user_progress, and sessions automatically
  await db.delete(users).where(eq(users.id, payload.sub));

  return json({
    success: true,
    message: 'Hesabınız ve tüm kişisel verileriniz kalıcı olarak silindi.'
  });
}

export const OPTIONS = preflight;
