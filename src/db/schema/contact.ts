import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const contactMessages = pgTable('contact_messages', {
  id: text('id').primaryKey(), // Benzersiz UUID / msg_xxxx
  name: text('name').notNull(),
  email: text('email').notNull(),
  subjectCategory: text('subject_category').notNull().default('Genel Danışma'),
  orderCode: text('order_code'),
  message: text('message').notNull(),
  status: text('status').notNull().default('unread'), // 'unread' | 'read' | 'replied'
  adminReply: text('admin_reply'),
  repliedAt: timestamp('replied_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;
