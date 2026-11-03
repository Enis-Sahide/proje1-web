import { pgTable, uuid, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { users } from './auth';

// Ezoterik Meclis / Sohbet Odaları
export const chatRooms = pgTable('chat_rooms', {
  id: text('id').primaryKey(), // slug: 'genel-meydan', 'kabala', 'sembolizm', vb.
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(), // emoji / sembol
  colorHex: text('color_hex').notNull().default('#D4AF37'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Kullanıcının sohbet odalarındaki Rumuz (Mahlas), Push Token ve moderasyon bilgisi
export const chatProfiles = pgTable('chat_profiles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  nickname: text('nickname'),
  expoPushToken: text('expo_push_token'),
  isMuted: boolean('is_muted').notNull().default(false),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Sohbet mesajları
export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomId: text('room_id')
    .notNull()
    .references(() => chatRooms.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  replyToId: uuid('reply_to_id'),
  replyPreviewName: text('reply_preview_name'),
  replyPreviewText: text('reply_preview_text'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Mesaja yanıt geldiğinde oluşturulan bildirimler
export const chatNotifications = pgTable('chat_notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipientUserId: uuid('recipient_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  senderUserId: uuid('sender_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  senderName: text('sender_name').notNull(),
  roomId: text('room_id')
    .notNull()
    .references(() => chatRooms.id, { onDelete: 'cascade' }),
  roomTitle: text('room_title').notNull(),
  roomIcon: text('room_icon').notNull().default('💬'),
  messageId: uuid('message_id').notNull(),
  messagePreview: text('message_preview').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
