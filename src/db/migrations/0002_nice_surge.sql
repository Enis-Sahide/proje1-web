ALTER TABLE "user_progress" ADD COLUMN "passed_exams" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "level" smallint;