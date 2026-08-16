import { DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "$env/dynamic/private";
import { getR2Client } from "./r2-client.js";

/** Default presigned PUT URL lifetime (5 minutes). */
export const DEFAULT_PRESIGN_TTL_SECONDS = 300;

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
			ContentLength: body.byteLength
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
				Key: key
			})
		);
	} catch (err) {
		console.error(`r2Delete: failed to delete key "${key}":`, err);
	}
}

/**
 * Create a short-lived presigned PUT URL that lets a client (e.g. the browser)
 * upload bytes directly to R2 at the given key — the file bytes never pass
 * through the server. The URL is scoped to the single key and Content-Type
 * (via `signableHeaders`) and expires after `expiresIn` seconds (default 300).
 */
export async function r2PresignPut(
	key: string,
	contentType: string,
	expiresIn: number = DEFAULT_PRESIGN_TTL_SECONDS
): Promise<string> {
	const client = getR2Client();
	return getSignedUrl(
		client,
		new PutObjectCommand({
			Bucket: env.R2_BUCKET!,
			Key: key,
			ContentType: contentType
		}),
		{
			expiresIn,
			signableHeaders: new Set(["content-type"])
		}
	);
}

/**
 * List object keys under a given prefix. Returns the keys (in `{key}` order)
 * for objects currently in the bucket under `prefix`, or an empty array when
 * there are none. Used by admin settings to list `test/*` uploads.
 */
export async function r2ListKeys(prefix: string): Promise<string[]> {
	const client = getR2Client();
	const command = new ListObjectsV2Command({
		Bucket: env.R2_BUCKET!,
		Prefix: prefix
	});
	const result = await client.send(command);
	return (result.Contents ?? []).map((obj) => obj.Key ?? "").filter(Boolean);
}

/** A single R2 configuration field and whether it is set (never exposes the value). */
export type R2ConfigField = {
	key: string;
	set: boolean;
	label: string;
};

/**
 * Return the current R2 configuration status for display in admin settings.
 * Reports which env vars are set (never their values) plus the endpoint in use.
 * Pure — does not construct the client or make network calls.
 */
export function getR2ConfigStatus(): {
	fields: R2ConfigField[];
	endpoint: string | null;
	ready: boolean;
} {
	const fields: R2ConfigField[] = [
		{ key: "R2_ACCOUNT_ID", set: Boolean(env.R2_ACCOUNT_ID?.trim()), label: "Account ID" },
		{ key: "R2_ACCESS_KEY_ID", set: Boolean(env.R2_ACCESS_KEY_ID?.trim()), label: "Access Key ID" },
		{
			key: "R2_SECRET_ACCESS_KEY",
			set: Boolean(env.R2_SECRET_ACCESS_KEY?.trim()),
			label: "Secret Access Key"
		},
		{ key: "R2_BUCKET", set: Boolean(env.R2_BUCKET?.trim()), label: "Bucket" },
		{ key: "R2_PUBLIC_URL", set: Boolean(env.R2_PUBLIC_URL?.trim()), label: "Public URL" }
	];
	const ready = fields.every((f) => f.set);
	const endpoint = env.R2_ACCOUNT_ID?.trim()
		? `https://${env.R2_ACCOUNT_ID.trim()}.r2.cloudflarestorage.com`
		: null;
	return { fields, endpoint, ready };
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
