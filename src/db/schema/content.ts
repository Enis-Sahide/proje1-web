import {
  pgTable,
  text,
  integer,
  smallint,
  jsonb,
  serial,
  primaryKey,
} from 'drizzle-orm/pg-core';

// ── Çakra sistemi ───────────────────────────────────────────────
export const chakras = pgTable('chakras', {
  id: smallint('id').primaryKey(), // 1..7
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  color: text('color'),
  imageIcon: text('image_icon'), // ana sayfa çakra ikonu (storage url)
  homeTop: text('home_top'), // ana sayfadaki dikey konum (örn '82%')
});

export const chakraTopics = pgTable('chakra_topics', {
  id: text('id').primaryKey(), // nedir | dengeleme | tasavvuf | meditasyon
  title: text('title').notNull(),
  icon: text('icon'),
  sort: integer('sort').notNull().default(0),
});

// LESSONS Record<string, any> — anahtar: `${chakraId}_${topic}` (örn 1_nedir)
export const chakraLessons = pgTable('chakra_lessons', {
  id: text('id').primaryKey(),
  chakraId: smallint('chakra_id').references(() => chakras.id),
  topic: text('topic'),
  title: text('title'),
  imageUrl: text('image_url'),
  frequency: integer('frequency'),
  // İçerik şekli değişken (astrology/quiz/content) → orijinali korumak için JSONB.
  data: jsonb('data').notNull(),
});

// Genel dersler: astrology / human_design / kabbalah / rune (mobile-only Record'lar)
export const lessons = pgTable('lessons', {
  id: text('id').primaryKey(), // `${discipline}:${lessonKey}`
  discipline: text('discipline').notNull(),
  lessonKey: text('lesson_key').notNull(),
  tier: text('tier'),
  title: text('title'),
  imageUrl: text('image_url'),
  data: jsonb('data').notNull(), // full original entry (content, items, ...)
});

// ── Quizler (normalize) ─────────────────────────────────────────
export const quizzes = pgTable('quizzes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  discipline: text('discipline'),
  tier: text('tier'),
  passThreshold: integer('pass_threshold').notNull().default(100),
  unlockTier: text('unlock_tier'), // (legacy) eski tek-tek kilit modeli
  // Seviye-bazlı model: 1=çıraklık, 2=kalfalık, 3=ustalık sınavı; null=seviyeye saymaz (giriş/özel).
  level: smallint('level'),
});

export const quizQuestions = pgTable('quiz_questions', {
  id: serial('id').primaryKey(),
  quizId: text('quiz_id')
    .notNull()
    .references(() => quizzes.id, { onDelete: 'cascade' }),
  qKey: text('q_key'), // orijinal soru id'si
  sort: integer('sort').notNull().default(0),
  question: text('question').notNull(),
  options: jsonb('options').notNull(), // string[]
  correctIndex: integer('correct_index').notNull(),
  explanation: text('explanation'),
});

// ── Diğer içerik ────────────────────────────────────────────────
export const emotionalDiseases = pgTable('emotional_diseases', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  cause: text('cause'),
  affirmation: text('affirmation'),
});

export const chakraTestQuestions = pgTable('chakra_test_questions', {
  id: smallint('id').primaryKey(),
  chakraKey: text('chakra_key').notNull(), // root | sacral | solar | ...
  text: text('text').notNull(),
});

export const hdGates = pgTable('hd_gates', {
  id: smallint('id').primaryKey(), // 1..64
  title: text('title'),
  iching: text('iching'),
  astrology: text('astrology'),
  biology: text('biology'),
  description: text('description'),
});

export const runes = pgTable('runes', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  symbol: text('symbol'),
  data: jsonb('data').notNull(), // tüm rune alanları
});

export const runeBindings = pgTable('rune_bindings', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  data: jsonb('data').notNull(),
});

export const numerologyMeanings = pgTable('numerology_meanings', {
  number: smallint('number').primaryKey(),
  title: text('title'),
  data: jsonb('data').notNull(),
});

// numerologyDataWeb sözlükleri: lifePathData/birthdayData/arrowsData/personalYearData/emptyArrowsData
export const numerologyCalcData = pgTable(
  'numerology_calc_data',
  {
    kind: text('kind').notNull(),
    key: text('key').notNull(),
    value: jsonb('value').notNull(),
  },
  (t) => [primaryKey({ columns: [t.kind, t.key] })],
);

export const affirmations = pgTable('affirmations', {
  id: smallint('id').primaryKey(), // 0..6 (haftanın günü)
  text: text('text').notNull(),
  author: text('author'),
});

export const guidelines = pgTable('guidelines', {
  id: serial('id').primaryKey(),
  sort: integer('sort').notNull().default(0),
  icon: text('icon'),
  title: text('title').notNull(),
  content: text('content'),
  color: text('color'),
});

export const resources = pgTable('resources', {
  id: serial('id').primaryKey(),
  sort: integer('sort').notNull().default(0),
  title: text('title').notNull(),
  type: text('type').notNull(), // 'book' | 'pdf' | 'research'
  fileUrl: text('file_url'),
  level: smallint('level').notNull().default(0), // 0=seeker, 1=apprentice, 2=journeyman, 3=master
  description: text('description'),
});
