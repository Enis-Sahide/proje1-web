import { pgTable, text, timestamp, serial, uuid } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const siteVisits = pgTable('site_visits', {
  id: serial('id').primaryKey(),
  ipHash: text('ip_hash').notNull(),
  path: text('path').notNull(),
  country: text('country'),
  region: text('region'),
  city: text('city'),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
