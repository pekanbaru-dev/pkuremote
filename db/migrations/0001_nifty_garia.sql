CREATE TYPE "public"."user_role" AS ENUM('user', 'editor', 'admin');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('draft', 'in_review', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "post_slug_redirects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"old_slug" text NOT NULL,
	"post_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "published_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "published_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "role" "user_role" DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "cover_image_url" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "status" "post_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "reviewed_by" uuid;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "review_note" text;--> statement-breakpoint
ALTER TABLE "post_slug_redirects" ADD CONSTRAINT "post_slug_redirects_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "post_slug_redirects_old_slug_idx" ON "post_slug_redirects" USING btree ("old_slug");--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_reviewed_by_profiles_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "posts_status_idx" ON "posts" USING btree ("status");--> statement-breakpoint
-- Backfill: existing posts were published before this migration, so mark them published.
-- published_at was previously notNull with a value, so it is already set on all existing rows.
UPDATE "posts" SET "status" = 'published' WHERE "published_at" IS NOT NULL;