CREATE TABLE "breathwork_techniques" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"instruction" text,
	"phases" jsonb NOT NULL,
	"required_role" text,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "imece_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"icon" text,
	"description" text,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meditation_frequencies" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"hz" numeric NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"intent" text,
	"color" text,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moon_phases" (
	"id" serial PRIMARY KEY NOT NULL,
	"utc_date" text NOT NULL,
	"phase" text NOT NULL,
	"phase_name" text,
	"sign" text,
	"sign_symbol" text,
	"degree" text,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "races" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"avatar_url" text,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vip_technologies" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"icon" text,
	"color" text,
	"border_color" text,
	"text_color" text,
	"status" text,
	"path" text,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chakras" ADD COLUMN "image_icon" text;--> statement-breakpoint
ALTER TABLE "chakras" ADD COLUMN "home_top" text;