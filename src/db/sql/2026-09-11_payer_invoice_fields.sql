-- ─────────────────────────────────────────────────────────────
-- pos_transactions: fatura için alıcı bilgileri (adres, TCKN/VKN, vergi dairesi)
-- Checkout formundan toplanır; ödeme tamamlanınca invoices tablosuna kopyalanır.
--
-- Çalıştırma:
--   psql "$DATABASE_URL" -f src/db/sql/2026-09-11_payer_invoice_fields.sql
-- ─────────────────────────────────────────────────────────────

BEGIN;

ALTER TABLE "pos_transactions"
  ADD COLUMN IF NOT EXISTS "payer_is_company" boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "payer_tax_number" text,
  ADD COLUMN IF NOT EXISTS "payer_tax_office" text,
  ADD COLUMN IF NOT EXISTS "payer_address" text,
  ADD COLUMN IF NOT EXISTS "payer_city" text,
  ADD COLUMN IF NOT EXISTS "payer_district" text;

COMMIT;
