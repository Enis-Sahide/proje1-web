import { and, eq, ne, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { chatProfiles } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAccount } from '@/lib/auth/account';
import {
  ensureChatReady,
  formatSafeDisplayName,
  resolveChatUserId,
  validateNickname,
} from '@/lib/chat/chatService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await ensureChatReady();

    const userId = await resolveChatUserId(request);
    if (!userId) {
      return errorJson('Rumuz belirlemek için giriş yapmalısınız.', 401);
    }

    const account = await getAccount(userId);
    if (!account) {
      return errorJson('Kullanıcı bulunamadı.', 404);
    }

    const body = await request.json();
    const rawNickname = typeof body.nickname === 'string' ? body.nickname : '';

    const validation = validateNickname(rawNickname);
    if (!validation.valid) {
      return errorJson(validation.error || 'Geçersiz rumuz.', 400);
    }

    const newNickname = validation.cleaned && validation.cleaned.length > 0 ? validation.cleaned : null;

    // Check uniqueness if non-null
    if (newNickname) {
      const existing = await db
        .select()
        .from(chatProfiles)
        .where(
          and(
            sql`lower(${chatProfiles.nickname}) = lower(${newNickname})`,
            ne(chatProfiles.userId, account.id)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return errorJson('Bu rumuz başka bir yolcu tarafından kullanılıyor.', 409);
      }
    }

    await db
      .insert(chatProfiles)
      .values({
        userId: account.id,
        nickname: newNickname,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: chatProfiles.userId,
        set: {
          nickname: newNickname,
          updatedAt: new Date(),
        },
      });

    const effectiveDisplayName = formatSafeDisplayName(account.fullName, account.email, newNickname);

    return json({
      success: true,
      nickname: newNickname,
      effectiveDisplayName,
    });
  } catch (err: any) {
    console.error('[POST /api/chat/nickname] Error:', err);
    return errorJson('Rumuz kaydedilemedi.', 500);
  }
}

export const OPTIONS = preflight;

