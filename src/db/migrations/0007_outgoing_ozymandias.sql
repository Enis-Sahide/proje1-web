CREATE TABLE "guest_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"analysis_type" text NOT NULL,
	"birth_data" jsonb NOT NULL,
	"amount" integer NOT NULL,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"download_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "emotional_diseases" ADD COLUMN "organ_system" text;--> statement-breakpoint
ALTER TABLE "emotional_diseases" ADD COLUMN "detailed_explanation" text;--> statement-breakpoint
ALTER TABLE "emotional_diseases" ADD COLUMN "symptom_message" text;