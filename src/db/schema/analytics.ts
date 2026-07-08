import { pgTable, text, timestamp, serial } from 'drizzle-orm/pg-core';

export const siteVisits = pgTable('site_visits', {
  id: serial('id').primaryKey(),
  ipHash: text('ip_hash').notNull(),
  path: text('path').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
