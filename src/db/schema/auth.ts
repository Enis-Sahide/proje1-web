import { sql } from 'drizzle-orm';
import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Supabase auth yerine kendi kullanıcı tablomuz.
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Rol ve profil bilgisi (eski public.profiles karşılığı).
export const profiles = pgTable('profiles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('free'), // free | apprentice | journeyman | master | admin
  race: text('race'), // onboarding (race-reveal)
  avatarUrl: text('avatar_url'),
});

// İlerleme: açılan tier'lar + sınav denemeleri (eski user_metadata karşılığı).
export const userProgress = pgTable('user_progress', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  unlockedTiers: text('unlocked_tiers')
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  examAttempts: jsonb('exam_attempts').notNull().default({}), // { "<quizId>": "YYYY-MM-DD" }
  activeExam: jsonb('active_exam'), // { examId, startTime, device } | null
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Refresh token oturumları (rotasyon + iptal).
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  refreshTokenHash: text('refresh_token_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
