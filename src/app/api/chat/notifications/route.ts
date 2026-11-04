import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { chatNotifications, chatProfiles } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { ensureChatReady, resolveChatUserId } from '@/lib/chat/chatService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await ensureChatReady(false);

    const userId = await resolveChatUserId(request);
    if (!userId) {
      return json({
        success: true,
        unreadCount: 0,
        notifications: [],
      });
    }

    const notifications = await db
      .select()
      .from(chatNotifications)
      .where(eq(chatNotifications.recipientUserId, userId))
      .orderBy(desc(chatNotifications.createdAt))
      .limit(20);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return json({
      success: true,
      unreadCount,
      notifications: notifications.map((n) => ({
        id: n.id,
        roomId: n.roomId,
        roomTitle: n.roomTitle,
        roomIcon: n.roomIcon,
        senderName: n.senderName,
        messageId: n.messageId,
        messagePreview: n.messagePreview,
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
    });
  } catch (err: any) {
    console.error('[GET /api/chat/notifications] Error:', err);
    return errorJson('Bildirimler alınamadı.', 500);
  }
}

export async function POST(request: Request) {
  try {
    await ensureChatReady(false);

    const userId = await resolveChatUserId(request);
    if (!userId) {
      return errorJson('Yetkisiz işlem.', 401);
    }

    const body = await request.json();
    const action = typeof body.action === 'string' ? body.action : 'mark_read';

    if (action === 'register_push_token') {
      const expoPushToken = typeof body.expoPushToken === 'string' ? body.expoPushToken.trim() : '';
      if (!expoPushToken) {
        return errorJson('Geçersiz bildirim anahtarı.', 400);
      }

      const [existing] = await db
        .select()
        .from(chatProfiles)
        .where(eq(chatProfiles.userId, userId));

      if (existing) {
        await db
          .update(chatProfiles)
          .set({ expoPushToken, updatedAt: new Date() })
          .where(eq(chatProfiles.userId, userId));
      } else {
        await db.insert(chatProfiles).values({
          userId,
          expoPushToken,
          updatedAt: new Date(),
        });
      }

      return json({ success: true });
    }

    if (action === 'mark_read') {
      const notificationId = typeof body.notificationId === 'string' ? body.notificationId : null;
      const roomId = typeof body.roomId === 'string' ? body.roomId : null;

      if (notificationId) {
        await db
          .update(chatNotifications)
          .set({ isRead: true })
          .where(
            and(
              eq(chatNotifications.id, notificationId),
              eq(chatNotifications.recipientUserId, userId)
            )
          );
      } else if (roomId) {
        await db
          .update(chatNotifications)
          .set({ isRead: true })
          .where(
            and(
              eq(chatNotifications.roomId, roomId),
              eq(chatNotifications.recipientUserId, userId)
            )
          );
      } else {
        await db
          .update(chatNotifications)
          .set({ isRead: true })
          .where(eq(chatNotifications.recipientUserId, userId));
      }

      return json({ success: true });
    }

    return errorJson('Geçersiz işlem.', 400);
  } catch (err: any) {
    console.error('[POST /api/chat/notifications] Error:', err);
    return errorJson('Bildirim işlemi yapılamadı.', 500);
  }
}

export const OPTIONS = preflight;

