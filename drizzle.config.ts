import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const directUrl = process.env.DIRECT_URL;
if (!directUrl) {
	throw new Error(
		"DIRECT_URL is not set. Copy .env.example to .env and fill in the Supabase direct connection string."
	);
}

export default defineConfig({
	schema: "./db/schema/*.ts",
	out: "./db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: directUrl
	},
	strict: true,
	verbose: true
});
