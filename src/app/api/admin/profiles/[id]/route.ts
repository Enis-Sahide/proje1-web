import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users, profiles, userProgress, emailVerifications } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import { getAccount } from '@/lib/auth/account';
import { ENTRY_EXAMS, levelExamIds } from '@/lib/levels';

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

  // 1. Rol değişimine göre kullanıcının geçmesi gereken sınav listesini hesapla
  if (role !== 'admin') {
    let newPassedExams: string[] = [];
    if (role === 'apprentice') {
      newPassedExams = [...ENTRY_EXAMS];
    } else if (role === 'journeyman') {
      const l1 = await levelExamIds(1);
      newPassedExams = [...ENTRY_EXAMS, ...l1];
    } else if (role === 'master') {
      const [l1, l2] = await Promise.all([levelExamIds(1), levelExamIds(2)]);
      newPassedExams = [...ENTRY_EXAMS, ...l1, ...l2];
    }

    // 2. user_progress tablosundaki passed_exams'i güncelle
    await db
      .insert(userProgress)
      .values({ userId: id, passedExams: newPassedExams })
      .onConflictDoUpdate({ target: userProgress.userId, set: { passedExams: newPassedExams } });
  }

  // 3. profiles tablosundaki role sütununu güncelle
  await db
    .insert(profiles)
    .values({ userId: id, role })
    .onConflictDoUpdate({ target: profiles.userId, set: { role } });

  return json({ success: true });
}

// Admin: üyeyi sistemden ve veritabanından kalıcı olarak sil.
export async function DELETE(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const payload = await getAuthPayload(request);
  if (!payload) return errorJson('Yetkisiz', 401);
  const me = await getAccount(payload.sub);
  if (me?.role !== 'admin') return errorJson('Yetkisiz', 403);

  const { id } = await ctx.params;
  if (id === me.id) {
    return errorJson('Kendi hesabınızı silemezsiniz.', 400);
  }

  const [targetUser] = await db.select().from(users).where(eq(users.id, id));
  if (!targetUser) return errorJson('Kullanıcı bulunamadı.', 404);

  if (targetUser.email.toLowerCase() === 'admin@7layers.tr') {
    return errorJson('Ana yönetici hesabı silinemez.', 400);
  }

  // Varsa doğrulama kayıtlarını sil
  await db.delete(emailVerifications).where(eq(emailVerifications.email, targetUser.email));
  // Kullanıcıyı sil (bağlı profiller, oturumlar cascade ile silinir)
  await db.delete(users).where(eq(users.id, id));

  return json({ success: true, message: 'Kullanıcı hesabı başarıyla silindi.' });
}

export const OPTIONS = preflight;
