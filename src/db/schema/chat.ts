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

// Kullanıcının sohbet odalarındaki Rumuz (Mahlas) ve moderasyon bilgisi
export const chatProfiles = pgTable('chat_profiles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  nickname: text('nickname'),
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
