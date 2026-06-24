ALTER TABLE "profiles" ADD COLUMN "avatar_url" text;
--> statement-breakpoint

-- Row Level Security on profiles ----------------------------------------------
-- A user can read and update only their own row. Inserts/deletes are owned by
-- the handle_new_user() trigger (which runs as a SECURITY DEFINER function and
-- therefore bypasses RLS) and by the service role for backfills.
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

DROP POLICY IF EXISTS "profiles_select_own" ON "profiles";
CREATE POLICY "profiles_select_own" ON "profiles"
	FOR SELECT
	TO authenticated
	USING (id = auth.uid());
--> statement-breakpoint

DROP POLICY IF EXISTS "profiles_update_own" ON "profiles";
CREATE POLICY "profiles_update_own" ON "profiles"
	FOR UPDATE
	TO authenticated
	USING (id = auth.uid())
	WITH CHECK (id = auth.uid());
--> statement-breakpoint

-- handle_new_user() trigger ---------------------------------------------------
-- Provisions a public.profiles row the first time Supabase Auth creates an
-- auth.users row. Populates display_name from the Google identity's full_name
-- (falling back to the email's local part) and avatar_url from the avatar_url
-- claim. Runs as SECURITY DEFINER so it bypasses RLS for the insert. Idempotent
-- via ON CONFLICT DO NOTHING.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
	display_name_value text;
	avatar_url_value text;
	local_part text;
BEGIN
	display_name_value := NULLIF(NEW.raw_user_meta_data ->> 'full_name', '');

	IF display_name_value IS NULL THEN
		local_part := split_part(COALESCE(NEW.email, ''), '@', 1);
		IF local_part = '' THEN
			display_name_value := 'Pengguna';
		ELSE
			display_name_value := local_part;
		END IF;
	END IF;

	avatar_url_value := NULLIF(NEW.raw_user_meta_data ->> 'avatar_url', '');

	INSERT INTO public.profiles (id, display_name, avatar_url)
	VALUES (NEW.id, display_name_value, avatar_url_value)
	ON CONFLICT (id) DO NOTHING;

	RETURN NEW;
END;
$$;
--> statement-breakpoint

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
	AFTER INSERT ON auth.users
	FOR EACH ROW
	EXECUTE FUNCTION public.handle_new_user();
