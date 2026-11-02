import { asc, eq, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { chatRooms, chatProfiles, chatMessages } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAccount } from '@/lib/auth/account';
import {
  ensureChatReady,
  formatSafeDisplayName,
  resolveChatUserId,
  ROLE_TITLES,
} from '@/lib/chat/chatService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await ensureChatReady();

    const rooms = await db
      .select()
      .from(chatRooms)
      .orderBy(asc(chatRooms.sortOrder));

    const countsResult = await db
      .select({
        roomId: chatMessages.roomId,
        count: sql<number>`count(*)::int`,
      })
      .from(chatMessages)
      .groupBy(chatMessages.roomId);

    const countMap = new Map<string, number>();
    for (const row of countsResult) {
      countMap.set(row.roomId, Number(row.count) || 0);
    }

    const enrichedRooms = rooms.map((r) => ({
      ...r,
      messageCount: countMap.get(r.id) || 0,
    }));

    // Check optional logged-in user
    let myProfile: {
      userId: string;
      nickname: string | null;
      maskedDefaultName: string;
      effectiveDisplayName: string;
      role: string;
      roleTitle: string;
      isAdmin: boolean;
    } | null = null;

    const userId = await resolveChatUserId(request);
    if (userId) {
      const account = await getAccount(userId);
      if (account) {
        const [cp] = await db
          .select()
          .from(chatProfiles)
          .where(eq(chatProfiles.userId, account.id));
        const nickname = cp?.nickname ?? null;
        const maskedDefaultName = formatSafeDisplayName(account.fullName, account.email, null);
        const effectiveDisplayName = formatSafeDisplayName(account.fullName, account.email, nickname);
        myProfile = {
          userId: account.id,
          nickname,
          maskedDefaultName,
          effectiveDisplayName,
          role: account.role,
          roleTitle: ROLE_TITLES[account.role] || 'Arayışta',
          isAdmin: account.role === 'admin',
        };
      }
    }

    return json({
      success: true,
      rooms: enrichedRooms,
      myProfile,
    });
  } catch (err: any) {
    console.error('[GET /api/chat/rooms] Error:', err);
    return errorJson('Sohbet odaları yüklenemedi.', 500);
  }
}

export const OPTIONS = preflight;

