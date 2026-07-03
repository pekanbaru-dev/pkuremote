CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "event_categories" (
	"event_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "event_categories_event_id_category_id_pk" PRIMARY KEY("event_id","category_id")
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "ends_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "banner_url" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "status" text DEFAULT 'upcoming' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "quota" integer;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "remaining_slots" integer;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "price_normal" integer;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "price_promo" integer;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "event_categories" ADD CONSTRAINT "event_categories_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_categories" ADD CONSTRAINT "event_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "events_slug_idx" ON "events" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_status_check" CHECK ("events"."status" IN ('upcoming', 'live', 'past'));--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_category_check" CHECK ("events"."category" IN ('workshop', 'talk', 'meetup', 'social', 'other') OR "events"."category" IS NULL);--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_remaining_slots_check" CHECK ("events"."remaining_slots" IS NULL OR "events"."remaining_slots" >= 0);--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_quota_check" CHECK ("events"."quota" IS NULL OR "events"."quota" > 0);--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_price_promo_check" CHECK ("events"."price_promo" IS NULL OR "events"."price_normal" IS NULL OR "events"."price_promo" < "events"."price_normal");