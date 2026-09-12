-- email_verifications: yanlış OTP denemesi sayacı (5 denemede kod iptal)
BEGIN;
ALTER TABLE "email_verifications" ADD COLUMN IF NOT EXISTS "attempts" integer DEFAULT 0 NOT NULL;
COMMIT;
