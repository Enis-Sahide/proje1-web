CREATE TABLE "resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"file_url" text,
	"level" smallint DEFAULT 0 NOT NULL,
	"description" text
);
