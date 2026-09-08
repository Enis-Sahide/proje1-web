import { getAuthPayload } from './session';
import { getAccount, type Account } from './account';

/**
 * Admin korumalı route'lar için ortak yetki kontrolü.
 *
 * @returns Yetki varsa hesap, yoksa `null` (çağıran 401/403 döndürmeli).
 */
export async function requireAdmin(request: Request): Promise<Account | null> {
  const payload = await getAuthPayload(request);
  if (!payload) return null;
  const me = await getAccount(payload.sub);
  if (me?.role !== 'admin') return null;
  return me;
}
