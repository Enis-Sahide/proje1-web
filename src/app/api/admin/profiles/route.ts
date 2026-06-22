import { desc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users, profiles } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import { getAccount } from '@/lib/auth/account';

export const dynamic = 'force-dynamic';

// Admin: tüm üyeleri listele (eski supabase profiles select karşılığı).
export async function GET(request: Request) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);
  const me = await getAccount(payload.sub);
  if (me?.role !== 'admin') return errorJson('Yetkisiz', 403);

  const rows = await db
    .select({
      id: users.id,
      full_name: users.fullName,
      email: users.email,
      role: profiles.role,
      created_at: users.createdAt,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .orderBy(desc(users.createdAt));

  return json(rows);
}

export const OPTIONS = preflight;
