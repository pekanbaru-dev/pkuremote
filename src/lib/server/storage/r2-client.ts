import { S3Client } from "@aws-sdk/client-s3";
import { env } from "$env/dynamic/private";

let _client: S3Client | null = null;

/**
 * Returns a singleton S3Client configured for Cloudflare R2.
 * Lazily initialized on first call so env vars are available.
 * Throws a descriptive Error if any required env var is missing.
 */
export function getR2Client(): S3Client {
	if (_client) return _client;

	const missing: string[] = [];
	if (!env.R2_ACCOUNT_ID?.trim()) missing.push("R2_ACCOUNT_ID");
	if (!env.R2_ACCESS_KEY_ID?.trim()) missing.push("R2_ACCESS_KEY_ID");
	if (!env.R2_SECRET_ACCESS_KEY?.trim()) missing.push("R2_SECRET_ACCESS_KEY");
	if (!env.R2_BUCKET?.trim()) missing.push("R2_BUCKET");

	if (missing.length > 0) {
		throw new Error(
			`Cloudflare R2 is not configured. Missing environment variable(s): ${missing.join(", ")}. ` +
				`Set these in your .env file — see .env.example for guidance.`
		);
	}

	_client = new S3Client({
		region: "auto",
		endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: env.R2_ACCESS_KEY_ID!,
			secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
		},
	});

	return _client;
}

/** Exposed for testing — resets the singleton so tests can inject fresh env. */
export function _resetR2Client(): void {
	_client = null;
}
