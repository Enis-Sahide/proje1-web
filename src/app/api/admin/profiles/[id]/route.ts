import { db } from '@/db/client';
import { profiles } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import { getAccount } from '@/lib/auth/account';

export const dynamic = 'force-dynamic';

const VALID_ROLES = ['free', 'apprentice', 'journeyman', 'master', 'admin'];

// Admin: bir üyenin rolünü güncelle.
export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);
  const me = await getAccount(payload.sub);
  if (me?.role !== 'admin') return errorJson('Yetkisiz', 403);

  const { id } = await ctx.params;
  const { role } = await request.json().catch(() => ({}));
  if (!VALID_ROLES.includes(role)) return errorJson('Geçersiz rol');

  await db
    .insert(profiles)
    .values({ userId: id, role })
    .onConflictDoUpdate({ target: profiles.userId, set: { role } });

  return json({ success: true });
}

export const OPTIONS = preflight;
