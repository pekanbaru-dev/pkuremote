import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "$env/dynamic/private";
import { getR2Client } from "./r2-client.js";

/**
 * Upload bytes to R2 under the given key with the specified Content-Type.
 * Rejects with an Error if the upload fails.
 */
export async function r2Put(key: string, body: Uint8Array, contentType: string): Promise<void> {
	const client = getR2Client();
	await client.send(
		new PutObjectCommand({
			Bucket: env.R2_BUCKET!,
			Key: key,
			Body: body,
			ContentType: contentType,
			ContentLength: body.byteLength,
		})
	);
}

/**
 * Remove an object from R2 by key. Best-effort — failures are logged and
 * swallowed so callers' already-committed state is never corrupted.
 */
export async function r2Delete(key: string): Promise<void> {
	try {
		const client = getR2Client();
		await client.send(
			new DeleteObjectCommand({
				Bucket: env.R2_BUCKET!,
				Key: key,
			})
		);
	} catch (err) {
		console.error(`r2Delete: failed to delete key "${key}":`, err);
	}
}

/**
 * Construct a public CDN URL from an R2 object key.
 * Throws a descriptive Error if R2_PUBLIC_URL is not set.
 */
export function r2PublicUrl(key: string): string {
	const base = env.R2_PUBLIC_URL?.trim();
	if (!base) {
		throw new Error(
			"R2_PUBLIC_URL is not set. Configure the public base URL for your R2 bucket in .env."
		);
	}
	// Normalize: strip trailing slash from base, ensure key has no leading slash
	return `${base.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
}

/**
 * Extract the R2 object key from a stored CDN URL by stripping the
 * R2_PUBLIC_URL prefix. Returns null if the URL does not start with the
 * configured public base (e.g. an old /uploads/ path — safe to ignore).
 */
export function r2KeyFromUrl(url: string): string | null {
	const base = env.R2_PUBLIC_URL?.trim();
	if (!base || !url) return null;
	const normalizedBase = base.replace(/\/$/, "");
	if (!url.startsWith(normalizedBase + "/")) return null;
	return url.slice(normalizedBase.length + 1);
}
