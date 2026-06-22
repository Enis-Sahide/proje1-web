import { pgTable, text, integer, numeric, serial, jsonb } from 'drizzle-orm/pg-core';

// Daha önce sayfalara gömülü (inline) olan içerikler.

// breathwork TECHNIQUES
export const breathworkTechniques = pgTable('breathwork_techniques', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  instruction: text('instruction'),
  phases: jsonb('phases').notNull(), // [{ name, time }]
  requiredRole: text('required_role'),
  sort: integer('sort').notNull().default(0),
});

// meditation FREQUENCIES + ORGAN_FREQUENCIES
export const meditationFrequencies = pgTable('meditation_frequencies', {
  id: text('id').primaryKey(),
  kind: text('kind').notNull(), // 'chakra' | 'organ'
  hz: numeric('hz').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  intent: text('intent'),
  color: text('color'),
  sort: integer('sort').notNull().default(0),
});

// VIP_MODULES (modül listesi; interaktif sayfalar kodda kalır)
export const vipTechnologies = pgTable('vip_technologies', {
  id: text('id').primaryKey(), // slug
  title: text('title').notNull(),
  description: text('description'),
  icon: text('icon'), // lucide ikon adı
  color: text('color'),
  borderColor: text('border_color'),
  textColor: text('text_color'),
  status: text('status'),
  path: text('path'),
  sort: integer('sort').notNull().default(0),
});

// imece productSeries
export const imeceProducts = pgTable('imece_products', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  icon: text('icon'),
  description: text('description'),
  items: jsonb('items').notNull().default([]), // [{ name, desc }]
  sort: integer('sort').notNull().default(0),
});

// MOON_PHASES_2026
export const moonPhases = pgTable('moon_phases', {
  id: serial('id').primaryKey(),
  utcDate: text('utc_date').notNull(),
  phase: text('phase').notNull(), // new_moon | full_moon | solar_eclipse | lunar_eclipse
  phaseName: text('phase_name'),
  sign: text('sign'),
  signSymbol: text('sign_symbol'),
  degree: text('degree'),
  sort: integer('sort').notNull().default(0),
});

// RACES (onboarding ırk seçimi)
export const races = pgTable('races', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  avatarUrl: text('avatar_url'),
  sort: integer('sort').notNull().default(0),
});
