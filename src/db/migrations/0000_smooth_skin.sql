CREATE TABLE "profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"role" text DEFAULT 'free' NOT NULL,
	"race" text,
	"avatar_url" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"unlocked_tiers" text[] DEFAULT '{}'::text[] NOT NULL,
	"exam_attempts" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"active_exam" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "affirmations" (
	"id" smallint PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"author" text
);
--> statement-breakpoint
CREATE TABLE "chakra_lessons" (
	"id" text PRIMARY KEY NOT NULL,
	"chakra_id" smallint,
	"topic" text,
	"title" text,
	"image_url" text,
	"frequency" integer,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chakra_test_questions" (
	"id" smallint PRIMARY KEY NOT NULL,
	"chakra_key" text NOT NULL,
	"text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chakra_topics" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"icon" text,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chakras" (
	"id" smallint PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"color" text
);
--> statement-breakpoint
CREATE TABLE "emotional_diseases" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"cause" text,
	"affirmation" text
);
--> statement-breakpoint
CREATE TABLE "guidelines" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"icon" text,
	"title" text NOT NULL,
	"content" text,
	"color" text
);
--> statement-breakpoint
CREATE TABLE "hd_gates" (
	"id" smallint PRIMARY KEY NOT NULL,
	"title" text,
	"iching" text,
	"astrology" text,
	"biology" text,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" text PRIMARY KEY NOT NULL,
	"discipline" text NOT NULL,
	"lesson_key" text NOT NULL,
	"tier" text,
	"title" text,
	"image_url" text,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "numerology_calc_data" (
	"kind" text NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	CONSTRAINT "numerology_calc_data_kind_key_pk" PRIMARY KEY("kind","key")
);
--> statement-breakpoint
CREATE TABLE "numerology_meanings" (
	"number" smallint PRIMARY KEY NOT NULL,
	"title" text,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" text NOT NULL,
	"q_key" text,
	"sort" integer DEFAULT 0 NOT NULL,
	"question" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_index" integer NOT NULL,
	"explanation" text
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"discipline" text,
	"tier" text,
	"pass_threshold" integer DEFAULT 100 NOT NULL,
	"unlock_tier" text
);
--> statement-breakpoint
CREATE TABLE "rune_bindings" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "runes" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"symbol" text,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"icon" text
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"vendor_id" text,
	"category_id" text,
	"name" text NOT NULL,
	"description" text,
	"price" numeric,
	"image" text,
	"stock" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"avatar" text,
	"rating" numeric,
	"is_featured" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chakra_lessons" ADD CONSTRAINT "chakra_lessons_chakra_id_chakras_id_fk" FOREIGN KEY ("chakra_id") REFERENCES "public"."chakras"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;