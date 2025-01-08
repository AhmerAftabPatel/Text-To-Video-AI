CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"imageUrl" varchar,
	"subscription" boolean DEFAULT false,
	"credits" integer DEFAULT 30
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "videoData" (
	"id" serial PRIMARY KEY NOT NULL,
	"script" json NOT NULL,
	"audioFileUrl" varchar NOT NULL,
	"captions" json NOT NULL,
	"imageList" varchar[],
	"type" varchar DEFAULT 'general',
	"createdBy" varchar NOT NULL
);
