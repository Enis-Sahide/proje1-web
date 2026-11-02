import { desc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { chatMessages, chatNotifications, chatProfiles, chatRooms, profiles, users } from '@/db/schema';
import { json, errorJson, preflight } from '@/lib/http/cors';
import { getAuthPayload } from '@/lib/auth/session';
import { getAccount } from '@/lib/auth/account';
import {
  ensureChatReady,
  formatSafeDisplayName,
  ROLE_TITLES,
  sendExpoPushNotification,
  validateChatMessageContent,
} from '@/lib/chat/chatService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await ensureChatReady();

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId') || 'genel-meydan';

    const payload = await getAuthPayload(request);
    const currentUserId = payload?.sub || null;

    const rows = await db
      .select({
        id: chatMessages.id,
        roomId: chatMessages.roomId,
        userId: chatMessages.userId,
        content: chatMessages.content,
        replyToId: chatMessages.replyToId,
        replyPreviewName: chatMessages.replyPreviewName,
        replyPreviewText: chatMessages.replyPreviewText,
        createdAt: chatMessages.createdAt,
        fullName: users.fullName,
        email: users.email,
        role: profiles.role,
        nickname: chatProfiles.nickname,
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.userId, users.id))
      .leftJoin(profiles, eq(chatMessages.userId, profiles.userId))
      .leftJoin(chatProfiles, eq(chatMessages.userId, chatProfiles.userId))
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(70);

    // Reverse so oldest is at top, newest is at bottom of chat view
    const messages = rows.reverse().map((r) => {
      const role = r.role || 'free';
      const senderName = formatSafeDisplayName(r.fullName, r.email, r.nickname);
      return {
        id: r.id,
        roomId: r.roomId,
        userId: r.userId,
        senderName,
        senderRole: role,
        senderRoleTitle: ROLE_TITLES[role] || 'Arayışta',
        content: r.content,
        replyToId: r.replyToId,
        replyPreviewName: r.replyPreviewName,
        replyPreviewText: r.replyPreviewText,
        createdAt: r.createdAt,
        isOwn: currentUserId === r.userId,
      };
    });

    return json({
      success: true,
      roomId,
      messages,
    });
  } catch (err: any) {
    console.error('[GET /api/chat/messages] Error:', err);
    return errorJson('Mesajlar yüklenemedi.', 500);
  }
}

export async function POST(request: Request) {
  try {
    await ensureChatReady();

    const payload = await getAuthPayload(request);
    if (!payload?.sub) {
      return errorJson('Mesaj göndermek için üye girişi yapmalısınız.', 401);
    }

    const account = await getAccount(payload.sub);
    if (!account) {
      return errorJson('Kullanıcı hesabı bulunamadı.', 404);
    }

    const body = await request.json();
    const roomId = typeof body.roomId === 'string' ? body.roomId.trim() : 'genel-meydan';
    const rawContent = typeof body.content === 'string' ? body.content : '';
    const replyToId = typeof body.replyToId === 'string' && body.replyToId.length > 10 ? body.replyToId : null;

    // Check room exists
    const [room] = await db.select().from(chatRooms).where(eq(chatRooms.id, roomId));
    if (!room) {
      return errorJson('Geçersiz sohbet odası.', 404);
    }

    // Check if user is muted
    const [cp] = await db
      .select()
      .from(chatProfiles)
      .where(eq(chatProfiles.userId, account.id));

    if (cp?.isMuted && account.role !== 'admin') {
      return errorJson('Sohbet odalarında yazma yetkiniz geçici olarak kısıtlanmıştır.', 403);
    }

    // Slow-mode rate limit (4 seconds between messages for non-admin users)
    if (account.role !== 'admin') {
      const lastMsgs = await db
        .select({ createdAt: chatMessages.createdAt })
        .from(chatMessages)
        .where(eq(chatMessages.userId, account.id))
        .orderBy(desc(chatMessages.createdAt))
        .limit(1);

      if (lastMsgs.length > 0 && lastMsgs[0].createdAt) {
        const elapsedMs = Date.now() - new Date(lastMsgs[0].createdAt).getTime();
        if (elapsedMs < 3800) {
          const waitSec = Math.ceil((3800 - elapsedMs) / 1000);
          return errorJson(`Lütfen yeni mesaj göndermeden önce ${waitSec} saniye bekleyin.`, 429);
        }
      }
    }

    const validation = validateChatMessageContent(rawContent);
    if (!validation.valid || !validation.cleaned) {
      return errorJson(validation.error || 'Geçersiz mesaj içeriği.', 400);
    }

    let replyPreviewName: string | null = null;
    let replyPreviewText: string | null = null;
    let replyTargetUserId: string | null = null;
    let replyTargetPushToken: string | null = null;

    if (replyToId) {
      const [targetMsg] = await db
        .select({
          userId: chatMessages.userId,
          content: chatMessages.content,
          fullName: users.fullName,
          email: users.email,
          nickname: chatProfiles.nickname,
          expoPushToken: chatProfiles.expoPushToken,
        })
        .from(chatMessages)
        .innerJoin(users, eq(chatMessages.userId, users.id))
        .leftJoin(chatProfiles, eq(chatMessages.userId, chatProfiles.userId))
        .where(eq(chatMessages.id, replyToId));

      if (targetMsg) {
        replyPreviewName = formatSafeDisplayName(targetMsg.fullName, targetMsg.email, targetMsg.nickname);
        replyPreviewText = targetMsg.content.slice(0, 90);
        replyTargetUserId = targetMsg.userId;
        replyTargetPushToken = targetMsg.expoPushToken || null;
      }
    }

    const [inserted] = await db
      .insert(chatMessages)
      .values({
        roomId,
        userId: account.id,
        content: validation.cleaned,
        replyToId,
        replyPreviewName,
        replyPreviewText,
      })
      .returning();

    const senderName = formatSafeDisplayName(account.fullName, account.email, cp?.nickname);

    // Create notification & trigger push if replying to another user's message
    if (replyTargetUserId && replyTargetUserId !== account.id) {
      try {
        await db.insert(chatNotifications).values({
          recipientUserId: replyTargetUserId,
          senderUserId: account.id,
          senderName,
          roomId,
          roomTitle: room.title,
          roomIcon: room.icon,
          messageId: inserted.id,
          messagePreview: validation.cleaned.slice(0, 120),
          isRead: false,
        });

        if (replyTargetPushToken) {
          void sendExpoPushNotification(
            replyTargetPushToken,
            `${room.icon} ${room.title} • Yeni Yanıt`,
            `@${senderName}: "${validation.cleaned.slice(0, 85)}"`,
            { roomId, messageId: inserted.id, type: 'chat_reply' }
          );
        }
      } catch (notifErr) {
        console.error('[POST /api/chat/messages] Notification error:', notifErr);
      }
    }

    return json({
      success: true,
      message: {
        id: inserted.id,
        roomId: inserted.roomId,
        userId: inserted.userId,
        senderName,
        senderRole: account.role,
        senderRoleTitle: ROLE_TITLES[account.role] || 'Arayışta',
        content: inserted.content,
        replyToId: inserted.replyToId,
        replyPreviewName: inserted.replyPreviewName,
        replyPreviewText: inserted.replyPreviewText,
        createdAt: inserted.createdAt,
        isOwn: true,
      },
    });
  } catch (err: any) {
    console.error('[POST /api/chat/messages] Error:', err);
    return errorJson('Mesaj gönderilirken bir hata oluştu.', 500);
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureChatReady();

    const payload = await getAuthPayload(request);
    if (!payload?.sub) {
      return errorJson('Yetkisiz işlem.', 401);
    }

    const account = await getAccount(payload.sub);
    if (!account) {
      return errorJson('Kullanıcı bulunamadı.', 404);
    }

    const { searchParams } = new URL(request.url);
    const msgId = searchParams.get('id');
    if (!msgId) {
      return errorJson('Mesaj ID gerekli.', 400);
    }

    const [existing] = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.id, msgId));

    if (!existing) {
      return errorJson('Mesaj bulunamadı.', 404);
    }

    if (account.role !== 'admin' && existing.userId !== account.id) {
      return errorJson('Bu mesajı silme yetkiniz yok.', 403);
    }

    await db.delete(chatMessages).where(eq(chatMessages.id, msgId));

    return json({ success: true, deletedId: msgId });
  } catch (err: any) {
    console.error('[DELETE /api/chat/messages] Error:', err);
    return errorJson('Mesaj silinemedi.', 500);
  }
}

export const OPTIONS = preflight;

