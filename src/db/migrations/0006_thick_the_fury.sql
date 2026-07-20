CREATE TABLE "schumann_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"min_score" numeric(3, 1) NOT NULL,
	"title" text NOT NULL,
	"science" text NOT NULL,
	"symptoms" text NOT NULL,
	"spiritual" text NOT NULL
);
