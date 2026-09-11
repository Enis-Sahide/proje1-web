import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import { createProfile, listProfiles } from '@/lib/billing/profile-service';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return preflight();
}

// GET /api/billing/profiles — Giriş yapmış kullanıcının fatura profilleri.
export async function GET(request: Request) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);
  const rows = await listProfiles(payload.sub);
  return json({ success: true, data: rows });
}

// POST /api/billing/profiles — Yeni fatura profili.
export async function POST(request: Request) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);
  const body = await request.json().catch(() => ({}));
  const result = await createProfile(payload.sub, body);
  if (!result.ok) return errorJson(result.error, 400);
  return json({ success: true, data: result.value });
}
