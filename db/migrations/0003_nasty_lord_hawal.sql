-- Adds the 'rejected' post status for the editorial workflow.
--
-- NOTE: drizzle-kit originally generated this migration with
-- `ADD COLUMN "category_id"` and `ADD COLUMN "tags"` as well, which made it
-- fail everywhere with `column "category_id" of relation "posts" already
-- exists` — `0002_article_metadata.sql` had already added both. The cause was a
-- missing `meta/0002_snapshot.json`: 0002 was hand-written into the journal
-- without a snapshot, so `generate` diffed against 0001 and re-emitted columns
-- that were already live. `meta/0003_snapshot.json` records the correct shape,
-- so later `generate` runs are unaffected.
--
-- What is actually missing on a database that has 0002 applied is only the enum
-- value, plus the constraint NAME: 0002 created the FK inline via `REFERENCES`,
-- so Postgres auto-named it `posts_category_id_fkey` rather than the name the
-- snapshot expects. Both statements below are idempotent so this applies
-- equally to a fresh database and to one already carrying 0002.
ALTER TYPE "public"."post_status" ADD VALUE IF NOT EXISTS 'rejected';--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM pg_constraint
		WHERE conrelid = 'posts'::regclass AND conname = 'posts_category_id_fkey'
	) AND NOT EXISTS (
		SELECT 1 FROM pg_constraint
		WHERE conrelid = 'posts'::regclass AND conname = 'posts_category_id_categories_id_fk'
	) THEN
		ALTER TABLE "posts"
			RENAME CONSTRAINT "posts_category_id_fkey" TO "posts_category_id_categories_id_fk";
	END IF;
END $$;
