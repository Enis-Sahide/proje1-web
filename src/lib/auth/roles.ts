export const ADMIN_EMAIL = 'enissahide.kesik@outlook.com';

export const ROLE_LEVELS: Record<string, number> = {
  free: 0,
  apprentice: 1,
  journeyman: 2,
  master: 3,
  admin: 999,
};

// unlockedTiers + email'den rol türet (eski AuthContext/ProgressContext mantığı).
export function deriveRole(unlockedTiers: string[] = [], email?: string | null): string {
  if (email && email.toLowerCase() === ADMIN_EMAIL) return 'admin';
  if (!unlockedTiers || unlockedTiers.length === 0) return 'free';
  const hasMaster = unlockedTiers.some(
    (t) => t.includes('master') || t.endsWith('_3') || t.includes('Final'),
  );
  const hasJourneyman = unlockedTiers.some((t) => t.includes('_2') || t.endsWith('_2'));
  if (hasMaster) return 'master';
  if (hasJourneyman) return 'journeyman';
  return 'apprentice';
}

export function hasAccess(role: string, unlockedTiers: string[] = [], tierId?: string): boolean {
  if (role === 'admin') return true;
  if (!tierId) return true;
  if (tierId.endsWith('_1')) return true;
  return unlockedTiers.includes(tierId);
}
