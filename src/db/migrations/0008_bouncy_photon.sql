ALTER TABLE "site_visits" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "site_visits" ADD COLUMN "region" text;--> statement-breakpoint
ALTER TABLE "site_visits" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "site_visits" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "site_visits" ADD CONSTRAINT "site_visits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;