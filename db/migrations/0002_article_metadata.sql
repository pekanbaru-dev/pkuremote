ALTER TABLE "posts" ADD COLUMN "category_id" uuid REFERENCES "categories"("id") ON DELETE SET NULL;
ALTER TABLE "posts" ADD COLUMN "tags" text[] DEFAULT '{}'::text[] NOT NULL;
