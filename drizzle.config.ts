import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error(
		"DATABASE_URL is not set. Copy .env.example to .env and fill in the connection string for the app's Postgres."
	);
}

export default defineConfig({
	schema: "./db/schema/*.ts",
	out: "./db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: databaseUrl
	},
	strict: true,
	verbose: true
});
