-- ─────────────────────────────────────────────────────────────
-- Fatura profilleri (kullanıcı başına N adet) + işlem/fatura bağları
--
-- Çalıştırma:
--   psql "$DATABASE_URL" -f src/db/sql/2026-09-11_billing_profiles.sql
-- ─────────────────────────────────────────────────────────────

BEGIN;

CREATE TABLE IF NOT EXISTS "billing_profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "label" text NOT NULL,
  "type" text DEFAULT 'individual' NOT NULL,
  "title" text NOT NULL,
  "tax_number" text,
  "tax_office" text,
  "address" text NOT NULL,
  "city" text NOT NULL,
  "district" text NOT NULL,
  "phone" text,
  "email" text,
  "is_default" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "billing_profiles_user_idx" ON "billing_profiles" ("user_id");

ALTER TABLE "pos_transactions"
  ADD COLUMN IF NOT EXISTS "billing_profile_id" uuid REFERENCES "billing_profiles"("id") ON DELETE SET NULL;

ALTER TABLE "invoices"
  ADD COLUMN IF NOT EXISTS "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS "invoices_user_idx" ON "invoices" ("user_id");

-- Mevcut faturaları işlem üzerinden kullanıcıya bağla.
UPDATE "invoices" i
SET "user_id" = t."user_id"
FROM "pos_transactions" t
WHERE i."pos_transaction_id" = t."id" AND i."user_id" IS NULL AND t."user_id" IS NOT NULL;

COMMIT;
