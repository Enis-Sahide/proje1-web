import { db } from '@/db/client';
import { profiles } from '@/db/schema';
import { json, errorJson } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);
  
  const { targetRole } = await request.json().catch(() => ({}));
  if (!targetRole) return errorJson('Hedef rol belirtilmedi', 400);

  // Update the user's role in profiles table
  await db.update(profiles).set({ role: targetRole }).where(eq(profiles.userId, payload.sub));
  
  return json({ success: true, role: targetRole });
}
