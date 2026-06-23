import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { quizzes } from '@/db/schema';
import { ADMIN_EMAIL } from './auth/roles';

// Seviye-bazlı üyelik modeli.
// free → (her iki giriş sınavı ≥%80) → apprentice
//      → (tüm 1. derece sınavları ≥%80) → journeyman
//      → (tüm 2. derece sınavları ≥%80) → master
export const ENTRY_EXAMS = ['aura', 'duygusal_hastaliklar_50'];
export const PASS_THRESHOLD = 80;
export const ROLE_LEVELS: Record<string, number> = {
  free: 0,
  apprentice: 1,
  journeyman: 2,
  master: 3,
  admin: 999,
};

export function roleLevel(role: string): number {
  return ROLE_LEVELS[role] ?? 0;
}

// Belirli seviyeye sayan sınav id'leri (quizzes.level).
export async function levelExamIds(level: number): Promise<string[]> {
  const rows = await db.select({ id: quizzes.id }).from(quizzes).where(eq(quizzes.level, level));
  return rows.map((r) => r.id);
}

// Bir sınavın "girilebilmesi için gereken" seviye (entry=0).
export async function examLevel(examId: string): Promise<number> {
  if (ENTRY_EXAMS.includes(examId)) return 0;
  const [q] = await db.select({ level: quizzes.level }).from(quizzes).where(eq(quizzes.id, examId));
  return q?.level ?? 0;
}

// Geçilen sınavlardan rolü hesapla (admin e-postası her zaman admin).
export async function computeRole(passed: string[], email?: string | null): Promise<string> {
  if (email && email.toLowerCase() === ADMIN_EMAIL) return 'admin';
  const set = new Set(passed ?? []);
  const entryDone = ENTRY_EXAMS.every((e) => set.has(e));
  if (!entryDone) return 'free';
  const [l1, l2] = await Promise.all([levelExamIds(1), levelExamIds(2)]);
  const allL1 = l1.length > 0 && l1.every((e) => set.has(e));
  const allL2 = l2.length > 0 && l2.every((e) => set.has(e));
  if (allL1 && allL2) return 'master';
  if (allL1) return 'journeyman';
  return 'apprentice';
}
