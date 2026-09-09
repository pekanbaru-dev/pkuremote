import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error("DATABASE_URL is required to run production migrations.");
}

const migrationsFolder = process.env.MIGRATIONS_FOLDER ?? "/app/db/migrations";
const client = postgres(databaseUrl, { max: 1, prepare: false });

try {
	await migrate(drizzle(client), { migrationsFolder });
	console.info(`[migrations] applied successfully from ${migrationsFolder}`);
} finally {
	await client.end();
}
