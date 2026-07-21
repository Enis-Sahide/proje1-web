/**
 * Statik içeriği (src/data/*) PostgreSQL'e aktaran tek-seferlik, idempotent seed.
 * Çalıştırma:  pnpm --dir web exec tsx src/db/seed.ts
 *
 * İçerik tabloları her çalıştırmada temizlenip yeniden yazılır (kullanıcı/auth
 * tablolarına DOKUNULMAZ).
 */
import './_imageRequireShim'; // DİĞER import'lardan önce: RN görsel require'larını yol string'ine çevirir
import { config } from 'dotenv';
config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// ── İçerik kaynakları (web/src/data) ────────────────────────────
import { CHAKRAS, TOPICS } from '../data/chakraData';
import { LESSONS } from '../data/chakraLessons';
import { allQuizzes, type Quiz } from '../data/allQuizzes';
import { FINAL_QUIZ_QUESTIONS } from '../data/finalQuiz';
import { ruhBedenQuiz1, ruhBedenQuiz2, ruhBedenQuiz3 } from '../data/ruhBedenQuizzes';
import { EMOTIONAL_DISEASES, enrichDisease } from '../data/emotionalDiseases';
import { CHAKRA_TEST_QUESTIONS } from '../data/chakraTestQuestions';
import gatesData from '../data/gates.json';
import { DAILY_AFFIRMATIONS } from '../data/affirmations';
import { GUIDELINES } from '../data/guidelinesData';
import { RESOURCES } from '../data/resourcesData';
import { CATEGORIES, VENDORS, PRODUCTS } from '../data/marketplaceData';
// mobile-only (web'e kopyalandı)
import { ASTROLOGY_LESSONS } from '../data/astrologyLessons';
import { HUMAN_DESIGN_LESSONS } from '../data/humanDesignLessons';
import { KABBALAH_LESSONS } from '../data/kabbalahLessons';
import { YOGA_LESSONS } from '../data/yogaLessons';
import { AKUPUNKTUR_LESSONS } from '../data/akupunkturLessons';
import { runeSymbols, runeBindings } from '../data/runeLessons';
import { numerologyData } from '../data/numerologyData';
import {
  lifePathData,
  birthdayData,
  arrowsData,
  personalYearData,
  emptyArrowsData,
} from '../data/numerologyDataWeb';
// Inline içerikler (Faz 7)
import {
  BREATHWORK,
  MEDITATION,
  VIP,
  IMECE,
  MOON_PHASES,
  racesWithAvatar,
  chakraHomeFor,
  BLOG_POSTS,
  SCHUMANN_RULES,
} from './seedExtra';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// Sınav geçilince açılan tier (mobil test/[id].tsx mantığı).
const UNLOCK_MAP: Record<string, string> = {
  numeroloji_1: 'numeroloji_2',
  numeroloji_2: 'numeroloji_3',
  numeroloji_3: 'numeroloji_master',
  rune1: 'rune_2',
  rune2: 'rune_master',
  yoga_1: 'yoga_2',
  yoga_2: 'yoga_master',
  human_1: 'human_2',
  human_2: 'human_master',
  astroloji_1: 'astroloji_2',
  astroloji_2: 'astroloji_master',
  akupunktur_1: 'akupunktur_2',
  akupunktur_2: 'akupunktur_master',
  duygusal_hastaliklar_50: 'duygusal_hastaliklar_access',
};

function deriveDiscipline(id: string): string {
  if (id.startsWith('numeroloji')) return 'numeroloji';
  if (id.startsWith('rune')) return 'rune';
  if (id.startsWith('yoga')) return 'yoga';
  if (id.startsWith('human')) return 'human_design';
  if (id.startsWith('astroloji')) return 'astroloji';
  if (id.startsWith('akupunktur')) return 'akupunktur';
  if (id.startsWith('kabbalah')) return 'kabbalah';
  if (id.startsWith('duygusal')) return 'duygusal_hastaliklar';
  if (id.startsWith('ruh_beden')) return 'ruh_beden';
  if (id.startsWith('final')) return 'final';
  return 'other';
}

function deriveTier(id: string): string | null {
  const m = id.match(/(\d+)$/);
  return m ? m[1] : null;
}

// Seviyeye sayan dersler (menüde olanlar). ruh_beden hariç.
const LEVEL_DISCIPLINES = [
  'numeroloji',
  'rune',
  'yoga',
  'human_design',
  'astroloji',
  'akupunktur',
  'kabbalah',
];

function deriveLevel(id: string): number | null {
  const d = deriveDiscipline(id);
  if (!LEVEL_DISCIPLINES.includes(d)) return null;
  const t = deriveTier(id);
  if (t === '1' || t === '2' || t === '3') return Number(t);
  return null;
}

async function chunkedInsert(tx: any, table: any, rows: any[], size = 300) {
  for (let i = 0; i < rows.length; i += size) {
    await tx.insert(table).values(rows.slice(i, i + size));
  }
}

async function main() {
  const s = schema;

  // ── Satır setlerini hazırla ───────────────────────────────────
  const chakraRows = Object.entries(CHAKRAS).map(([id, v]) => ({
    id: Number(id),
    title: v.title,
    subtitle: v.subtitle,
    color: v.color,
    ...chakraHomeFor(Number(id)),
  }));

  // ── Inline içerik satırları (Faz 7) ───────────────────────────
  const breathworkRows = BREATHWORK.map((b, i) => ({ ...b, sort: i }));
  const meditationRows = MEDITATION.map((m, i) => ({ ...m, hz: String(m.hz), sort: i }));
  const vipRows = VIP.map((v, i) => ({ ...v, sort: i }));
  const imeceRows = IMECE.map((p, i) => ({ ...p, sort: i }));
  const moonRows = MOON_PHASES.map((m, i) => ({ ...m, sort: i }));
  const raceRows = racesWithAvatar;

  const chakraTopicRows = TOPICS.map((t, i) => ({
    id: t.id,
    title: t.title,
    icon: (t as any).icon ?? null,
    sort: i,
  }));

  const chakraLessonRows = Object.entries(LESSONS).map(([key, v]: [string, any]) => {
    const chakraId = Number(key.split('_')[0]);
    return {
      id: key,
      chakraId: Number.isNaN(chakraId) ? null : chakraId,
      topic: key.substring(key.indexOf('_') + 1),
      title: v.title ?? null,
      imageUrl: v.image?.uri ?? null,
      frequency: v.frequency ?? null,
      data: v,
    };
  });

  const lessonSources: Array<[string, Record<string, any>]> = [
    ['astrology', ASTROLOGY_LESSONS],
    ['human_design', HUMAN_DESIGN_LESSONS],
    ['kabbalah', KABBALAH_LESSONS],
    ['yoga', YOGA_LESSONS],
    ['akupunktur', AKUPUNKTUR_LESSONS],
  ];
  const lessonRows: any[] = [];
  for (const [discipline, rec] of lessonSources) {
    for (const [key, v] of Object.entries(rec)) {
      lessonRows.push({
        id: `${discipline}:${key}`,
        discipline,
        lessonKey: key,
        tier: deriveTier(key),
        title: (v as any).title ?? null,
        imageUrl: (v as any).image?.uri ?? null,
        data: v,
      });
    }
  }

  const standardQuizzes: Record<string, Quiz> = {
    ...allQuizzes,
    ruh_beden_1: ruhBedenQuiz1 as any,
    ruh_beden_2: ruhBedenQuiz2 as any,
    ruh_beden_3: ruhBedenQuiz3 as any,
  };
  const quizRows: any[] = [];
  const questionRows: any[] = [];
  for (const [id, quiz] of Object.entries(standardQuizzes)) {
    quizRows.push({
      id,
      title: quiz.title,
      description: quiz.description ?? null,
      discipline: deriveDiscipline(id),
      tier: deriveTier(id),
      passThreshold: 80, // seviye modeli: tüm sınavlar ≥%80
      unlockTier: UNLOCK_MAP[id] ?? null, // (legacy)
      level: deriveLevel(id),
    });
    quiz.questions.forEach((q, idx) => {
      questionRows.push({
        quizId: id,
        qKey: q.id,
        sort: idx,
        question: q.question,
        options: q.options,
        correctIndex: q.correctAnswerIndex,
        explanation: q.explanation ?? null,
      });
    });
  }
  // Final sınavı (farklı şekil: correctAnswer string)
  quizRows.push({
    id: 'final',
    title: 'Final Sınavı',
    description: 'Tüm öğretileri kapsayan kapsamlı final sınavı',
    discipline: 'final',
    tier: 'final',
    passThreshold: 80,
    unlockTier: null,
    level: null, // giriş/özel — seviyeye saymaz
  });
  FINAL_QUIZ_QUESTIONS.forEach((q: any, idx: number) => {
    const ci = q.options.indexOf(q.correctAnswer);
    questionRows.push({
      quizId: 'final',
      qKey: String(q.id),
      sort: idx,
      question: q.question,
      options: q.options,
      correctIndex: ci >= 0 ? ci : 0,
      explanation: null,
    });
  });

  const emotionalRows = EMOTIONAL_DISEASES.map((d) => {
    const enriched = enrichDisease(d);
    return {
      name: enriched.name,
      cause: enriched.cause,
      affirmation: enriched.affirmation,
      organSystem: enriched.organSystem,
      detailedExplanation: enriched.detailedExplanation,
      symptomMessage: enriched.symptomMessage,
    };
  });

  const chakraTestRows = CHAKRA_TEST_QUESTIONS.map((q) => ({
    id: q.id,
    chakraKey: q.chakraId,
    text: q.text,
  }));

  const gateRows = (gatesData as any[]).map((g) => ({
    id: g.id,
    title: g.title ?? null,
    iching: g.iching ?? null,
    astrology: g.astrology ?? null,
    biology: g.biology ?? null,
    description: g.description ?? null,
  }));

  const runeRows = runeSymbols.map((r: any) => ({
    id: Number(r.id),
    name: r.name,
    symbol: r.symbol ?? null,
    data: r,
  }));

  const runeBindingRows = runeBindings.map((b: any) => ({
    id: b.id,
    title: b.title,
    data: b,
  }));

  const numerologyMeaningRows = Object.entries(numerologyData).map(([num, v]: [string, any]) => ({
    number: Number(num),
    title: v.title ?? null,
    data: v,
  }));

  const calcSources: Array<[string, Record<string, any>]> = [
    ['life_path', lifePathData],
    ['birthday', birthdayData],
    ['arrows', arrowsData],
    ['personal_year', personalYearData],
    ['empty_arrows', emptyArrowsData],
  ];
  const calcRows: any[] = [];
  for (const [kind, rec] of calcSources) {
    for (const [key, value] of Object.entries(rec)) {
      calcRows.push({ kind, key: String(key), value });
    }
  }

  const affirmationRows = Object.entries(DAILY_AFFIRMATIONS).map(([day, v]: [string, any]) => ({
    id: Number(day),
    text: v.text,
    author: v.author,
  }));

  const guidelineRows = GUIDELINES.map((g, i) => ({
    sort: i,
    icon: g.icon,
    title: g.title,
    content: g.content,
    color: g.color,
  }));

  const resourceRows = RESOURCES.map((r, i) => ({
    sort: r.sort ?? i,
    title: r.title,
    type: r.type,
    fileUrl: r.fileUrl ?? null,
    level: r.level,
    description: r.description ?? null,
  }));

  const categoryRows = CATEGORIES.map((c) => ({ id: c.id, name: c.name, icon: c.icon }));
  const vendorRows = VENDORS.map((v) => ({
    id: v.id,
    name: v.name,
    description: v.description,
    avatar: v.avatar,
    rating: v.rating != null ? String(v.rating) : null,
    isFeatured: !!v.isFeatured,
  }));
  const productRows = PRODUCTS.map((p) => ({
    id: p.id,
    vendorId: p.vendorId,
    categoryId: p.categoryId,
    name: p.name,
    description: p.description,
    price: p.price != null ? String(p.price) : null,
    image: p.image,
    stock: p.stock ?? 0,
  }));

  // ── Transaction: temizle (çocuk→ebeveyn) + ekle (ebeveyn→çocuk) ──
  await db.transaction(async (tx) => {
    // delete children first
    await tx.delete(s.quizQuestions);
    await tx.delete(s.quizzes);
    await tx.delete(s.products);
    await tx.delete(s.vendors);
    await tx.delete(s.productCategories);
    await tx.delete(s.chakraLessons);
    await tx.delete(s.chakraTopics);
    await tx.delete(s.chakras);
    await tx.delete(s.lessons);
    await tx.delete(s.emotionalDiseases);
    await tx.delete(s.chakraTestQuestions);
    await tx.delete(s.hdGates);
    await tx.delete(s.runes);
    await tx.delete(s.runeBindings);
    await tx.delete(s.numerologyMeanings);
    await tx.delete(s.numerologyCalcData);
    await tx.delete(s.affirmations);
    await tx.delete(s.guidelines);
    await tx.delete(s.resources);
    // Faz 7 inline içerikler
    await tx.delete(s.breathworkTechniques);
    await tx.delete(s.meditationFrequencies);
    await tx.delete(s.vipTechnologies);
    await tx.delete(s.imeceProducts);
    await tx.delete(s.moonPhases);
    await tx.delete(s.races);
    await tx.delete(s.blogPosts);
    await tx.delete(s.schumannRules);

    // insert parents first
    await chunkedInsert(tx, s.chakras, chakraRows);
    await chunkedInsert(tx, s.chakraTopics, chakraTopicRows);
    await chunkedInsert(tx, s.chakraLessons, chakraLessonRows);
    await chunkedInsert(tx, s.quizzes, quizRows);
    await chunkedInsert(tx, s.quizQuestions, questionRows);
    await chunkedInsert(tx, s.lessons, lessonRows);
    await chunkedInsert(tx, s.emotionalDiseases, emotionalRows);
    await chunkedInsert(tx, s.chakraTestQuestions, chakraTestRows);
    await chunkedInsert(tx, s.hdGates, gateRows);
    await chunkedInsert(tx, s.runes, runeRows);
    await chunkedInsert(tx, s.runeBindings, runeBindingRows);
    await chunkedInsert(tx, s.numerologyMeanings, numerologyMeaningRows);
    await chunkedInsert(tx, s.numerologyCalcData, calcRows);
    await chunkedInsert(tx, s.affirmations, affirmationRows);
    await chunkedInsert(tx, s.productCategories, categoryRows);
    await chunkedInsert(tx, s.vendors, vendorRows);
    await chunkedInsert(tx, s.products, productRows);
    await chunkedInsert(tx, s.guidelines, guidelineRows);
    await chunkedInsert(tx, s.resources, resourceRows);
    // Faz 7 inline içerikler
    await chunkedInsert(tx, s.breathworkTechniques, breathworkRows);
    await chunkedInsert(tx, s.meditationFrequencies, meditationRows);
    await chunkedInsert(tx, s.vipTechnologies, vipRows);
    await chunkedInsert(tx, s.imeceProducts, imeceRows);
    await chunkedInsert(tx, s.moonPhases, moonRows);
    await chunkedInsert(tx, s.races, raceRows);
    await chunkedInsert(tx, s.blogPosts, BLOG_POSTS);
    await chunkedInsert(tx, s.schumannRules, SCHUMANN_RULES);
  });

  // ── Özet ──────────────────────────────────────────────────────
  console.log('✅ Seed tamamlandı:');
  console.table({
    chakras: chakraRows.length,
    chakra_topics: chakraTopicRows.length,
    chakra_lessons: chakraLessonRows.length,
    quizzes: quizRows.length,
    quiz_questions: questionRows.length,
    lessons: lessonRows.length,
    emotional_diseases: emotionalRows.length,
    chakra_test_questions: chakraTestRows.length,
    hd_gates: gateRows.length,
    runes: runeRows.length,
    rune_bindings: runeBindingRows.length,
    numerology_meanings: numerologyMeaningRows.length,
    numerology_calc_data: calcRows.length,
    affirmations: affirmationRows.length,
    guidelines: guidelineRows.length,
    resources: resourceRows.length,
    product_categories: categoryRows.length,
    vendors: vendorRows.length,
    products: productRows.length,
    breathwork_techniques: breathworkRows.length,
    meditation_frequencies: meditationRows.length,
    vip_technologies: vipRows.length,
    imece_products: imeceRows.length,
    moon_phases: moonRows.length,
    races: raceRows.length,
    blog_posts: BLOG_POSTS.length,
  });

  await pool.end();
}

main().catch(async (e) => {
  console.error('❌ Seed hatası:', e);
  await pool.end();
  process.exit(1);
});
