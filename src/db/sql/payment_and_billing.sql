-- ─────────────────────────────────────────────────────────────
-- Treps sanal POS + faturalama altyapısı
--
-- Elle yazıldı: `drizzle-kit generate` şu an bu dalda etkileşimli soru
-- soruyor (0009 snapshot'ında duran vendors / products / product_categories
-- tabloları şemadan kaldırılmış; drizzle "drop mu, rename mi" diye soruyor).
-- Bu dosya yalnızca YENİ tablolar ekler, hiçbir şeyi düşürmez.
--
-- Çalıştırma:
--   psql "$DATABASE_URL" -f src/db/sql/payment_and_billing.sql
-- ─────────────────────────────────────────────────────────────

BEGIN;

-- ── Sanal POS ayarları (tek satır) ──────────────────────────
CREATE TABLE IF NOT EXISTS "pos_settings" (
  "provider" text PRIMARY KEY DEFAULT 'treps' NOT NULL,
  "is_active" boolean DEFAULT false NOT NULL,
  "api_base_url" text DEFAULT 'https://poapi.treps.tr' NOT NULL,
  "api_username" text,
  "api_password" text,
  "merchant_id" integer,
  "commission_plan_code" text,
  "max_installment" integer DEFAULT 1 NOT NULL,
  "min_amount" numeric DEFAULT '1' NOT NULL,
  "secure_3d_key" text,
  "webhook_secret" text,
  "last_tested_at" timestamp with time zone,
  "last_test_result" boolean,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ── Satılan raporlar ve fiyatları ───────────────────────────
CREATE TABLE IF NOT EXISTS "report_products" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "price" numeric NOT NULL,
  "tax_rate" numeric DEFAULT '20' NOT NULL,
  "currency" text DEFAULT 'TRY' NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "sort" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ── POS işlemleri ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "pos_transactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "external_order_id" text NOT NULL UNIQUE,
  "guest_order_id" text REFERENCES "guest_orders"("id") ON DELETE SET NULL,
  "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "product_type" text NOT NULL,
  "amount" numeric NOT NULL,
  "currency" text DEFAULT 'TRY' NOT NULL,
  "installment" integer DEFAULT 1 NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "hpp_token" text,
  "hpp_url" text,
  "treps_order_id" text,
  "treps_payment_id" text,
  "treps_transaction_id" text,
  "card_brand" text,
  "card_last_four" text,
  "error_code" text,
  "error_message" text,
  "payer_name" text,
  "payer_email" text,
  "payer_phone" text,
  "payer_is_company" boolean DEFAULT false NOT NULL,
  "payer_tax_number" text,
  "payer_tax_office" text,
  "payer_address" text,
  "payer_city" text,
  "payer_district" text,
  "raw_response" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "pos_transactions_hpp_token_idx" ON "pos_transactions" ("hpp_token");
CREATE INDEX IF NOT EXISTS "pos_transactions_status_idx" ON "pos_transactions" ("status");
CREATE INDEX IF NOT EXISTS "pos_transactions_guest_order_idx" ON "pos_transactions" ("guest_order_id");

-- ── Faturalama ayarları (tek satır) ─────────────────────────
CREATE TABLE IF NOT EXISTS "invoice_settings" (
  "provider" text PRIMARY KEY DEFAULT 'birfatura' NOT NULL,
  "is_active" boolean DEFAULT false NOT NULL,
  "test_mode" boolean DEFAULT true NOT NULL,
  "api_key" text,
  "secret_key" text,
  "integration_key" text,
  "seller_title" text,
  "seller_tax_number" text,
  "seller_tax_office" text,
  "seller_address" text,
  "seller_district" text,
  "seller_city" text,
  "seller_email" text,
  "seller_phone" text,
  "invoice_series" text DEFAULT 'EAR' NOT NULL,
  "default_tax_rate" numeric DEFAULT '20' NOT NULL,
  "auto_issue" boolean DEFAULT true NOT NULL,
  "last_tested_at" timestamp with time zone,
  "last_test_result" boolean,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ── Faturalar ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "invoices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "pos_transaction_id" uuid REFERENCES "pos_transactions"("id") ON DELETE SET NULL,
  "guest_order_id" text REFERENCES "guest_orders"("id") ON DELETE SET NULL,
  "invoice_number" text NOT NULL UNIQUE,
  "ettn" uuid DEFAULT gen_random_uuid() NOT NULL,
  "invoice_date" timestamp with time zone DEFAULT now() NOT NULL,
  "buyer_name" text NOT NULL,
  "buyer_email" text,
  "buyer_tax_number" text,
  "buyer_tax_office" text,
  "buyer_address" text,
  "buyer_city" text,
  "buyer_district" text,
  "subtotal" numeric NOT NULL,
  "tax_amount" numeric NOT NULL,
  "total" numeric NOT NULL,
  "currency" text DEFAULT 'TRY' NOT NULL,
  "status" text DEFAULT 'draft' NOT NULL,
  "document_type" text DEFAULT 'EARSIV' NOT NULL,
  "provider" text,
  "provider_document_no" text,
  "provider_uuid" text,
  "pdf_url" text,
  "error_message" text,
  "attempt_count" integer DEFAULT 0 NOT NULL,
  "raw_response" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "invoices_status_idx" ON "invoices" ("status");
CREATE INDEX IF NOT EXISTS "invoices_pos_transaction_idx" ON "invoices" ("pos_transaction_id");

CREATE TABLE IF NOT EXISTS "invoice_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "invoice_id" uuid NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "quantity" numeric DEFAULT '1' NOT NULL,
  "unit_price" numeric NOT NULL,
  "tax_rate" numeric DEFAULT '20' NOT NULL,
  "line_total" numeric NOT NULL,
  "tax_amount" numeric NOT NULL,
  "sort" integer DEFAULT 0 NOT NULL
);

CREATE INDEX IF NOT EXISTS "invoice_items_invoice_idx" ON "invoice_items" ("invoice_id");

-- ── Fatura numarası sayacı (seri + yıl) ─────────────────────
CREATE TABLE IF NOT EXISTS "invoice_counters" (
  "id" text PRIMARY KEY NOT NULL,
  "series" text NOT NULL,
  "year" integer NOT NULL,
  "last_number" integer DEFAULT 0 NOT NULL
);

-- ── Başlangıç verisi ────────────────────────────────────────
-- Fiyatlar mevcut sabit değerlerle aynı; admin panelinden değiştirilebilir.
INSERT INTO "report_products" ("id", "name", "description", "price", "tax_rate", "sort")
VALUES
  ('astrology', 'Doğum Haritası Analizi Raporu',
   'Ezoterik doğum haritası, gezegen yorumları ve açı analizleri içeren PDF rapor.', '444', '20', 1),
  ('kabbalah', 'Kabalistik 4 Alem Harita Analizi Raporu',
   'Assiah, Yetzirah, Beriyah ve Atzilut alemlerinin ayrı ayrı yorumlandığı PDF rapor.', '999', '20', 2),
  ('human-design', 'Human Design Kapsamlı Yaşam Rehberi Raporu',
   'Tip, otorite, profil ve kapı yorumlarını içeren kapsamlı PDF rapor.', '555', '20', 3),
  ('incarnation', 'Karmik & Enkarnasyon Analizi Raporu',
   'Geçmiş yaşam, karmik borçlar, Drakonik ruh haritası ve gelecek enkarnasyon potansiyelini içeren kapsamlı PDF rapor.', '888', '20', 4),
  ('cosmic-matrix', '7Layers Kozmik Matris Sentez Raporu',
   'Astroloji, Human Design, Kabala ve Kelt/Druid kök ağacı sentezi; 4 element, 4 alem, 13 gezegen teşhisi ve bitkisel aromaterapi frekanslarını içeren kapsamlı PDF rapor.', '1111', '20', 5)
ON CONFLICT ("id") DO NOTHING;

-- Ayar satırlarını boş olarak hazırla; anahtarlar admin panelinden girilir.
INSERT INTO "pos_settings" ("provider") VALUES ('treps') ON CONFLICT ("provider") DO NOTHING;
INSERT INTO "invoice_settings" ("provider") VALUES ('birfatura') ON CONFLICT ("provider") DO NOTHING;

COMMIT;
