import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import { deleteProfile, updateProfile } from '@/lib/billing/profile-service';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return preflight();
}

// PATCH /api/billing/profiles/[id] — Profili günceller (kısmi). `{ isDefault: true }` varsayılan yapar.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const result = await updateProfile(payload.sub, id, body);
  if (!result.ok) return errorJson(result.error, result.error === 'Profil bulunamadı' ? 404 : 400);
  return json({ success: true, data: result.value });
}

// DELETE /api/billing/profiles/[id]
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);
  const { id } = await params;
  const result = await deleteProfile(payload.sub, id);
  if (!result.ok) return errorJson(result.error, 404);
  return json({ success: true });
}
