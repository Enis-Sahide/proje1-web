import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users, profiles, userProgress } from '@/db/schema';
import { deriveRole, ROLE_LEVELS, ADMIN_EMAIL } from './roles';

export interface Account {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  race: string | null;
  avatarUrl: string | null;
  unlockedTiers: string[];
  examAttempts: Record<string, string>;
  activeExam: unknown;
}

// Profil/ilerleme satırlarını garanti et (self-healing) + admin email'i admin yap.
export async function ensureProfileAndProgress(userId: string, email: string) {
  const isAdmin = email.toLowerCase() === ADMIN_EMAIL;
  await db.insert(profiles).values({ userId, role: isAdmin ? 'admin' : 'free' }).onConflictDoNothing();
  await db.insert(userProgress).values({ userId }).onConflictDoNothing();
  if (isAdmin) {
    await db.update(profiles).set({ role: 'admin' }).where(eq(profiles.userId, userId));
  }
}

export async function getAccount(userId: string): Promise<Account | null> {
  const [u] = await db.select().from(users).where(eq(users.id, userId));
  if (!u) return null;
  await ensureProfileAndProgress(userId, u.email);
  const [p] = await db.select().from(profiles).where(eq(profiles.userId, userId));
  const [pr] = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  let role = p?.role || 'free';
  if (u.email.toLowerCase() === ADMIN_EMAIL) role = 'admin';
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role,
    race: p?.race ?? null,
    avatarUrl: p?.avatarUrl ?? null,
    unlockedTiers: pr?.unlockedTiers ?? [],
    examAttempts: (pr?.examAttempts as Record<string, string>) ?? {},
    activeExam: pr?.activeExam ?? null,
  };
}

// unlockedTiers değiştiğinde rolü yükselt (asla düşürme).
export async function syncRoleFromTiers(userId: string, email: string, unlockedTiers: string[]) {
  const newRole = deriveRole(unlockedTiers, email);
  const [p] = await db.select().from(profiles).where(eq(profiles.userId, userId));
  const current = p?.role || 'free';
  if ((ROLE_LEVELS[newRole] ?? 0) > (ROLE_LEVELS[current] ?? 0)) {
    await db.update(profiles).set({ role: newRole }).where(eq(profiles.userId, userId));
    return newRole;
  }
  return current;
}
