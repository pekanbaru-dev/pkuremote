import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock $env/dynamic/private before any storage imports
vi.mock("$env/dynamic/private", () => ({
	env: {
		R2_ACCOUNT_ID: "test-account-id",
		R2_ACCESS_KEY_ID: "test-access-key",
		R2_SECRET_ACCESS_KEY: "test-secret-key",
		R2_BUCKET: "test-bucket",
		R2_PUBLIC_URL: "https://cdn.example.com",
	},
}));

// Track which Command instances were sent via a shared spy on the prototype
const mockSend = vi.fn().mockResolvedValue({});

vi.mock("@aws-sdk/client-s3", () => {
	class S3Client {
		send = mockSend;
	}
	class PutObjectCommand {
		constructor(public input: Record<string, unknown>) {}
	}
	class DeleteObjectCommand {
		constructor(public input: Record<string, unknown>) {}
	}
	return { S3Client, PutObjectCommand, DeleteObjectCommand };
});

import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { _resetR2Client } from "./r2-client";
import {
	MAX_BANNER_BYTES,
	MediaUploadError,
	contentTypeFor,
	deleteArticleCover,
	deleteEventBanner,
	safeBasename,
	uploadArticleCover,
	uploadEventBanner,
	validateBannerFile,
} from "./index";

beforeEach(() => {
	_resetR2Client();
	mockSend.mockClear();
	mockSend.mockResolvedValue({});
});

// ---------------------------------------------------------------------------
// Pure validation helpers — unchanged, no I/O
// ---------------------------------------------------------------------------

describe("validateBannerFile", () => {
	it("accepts allowed image types and returns the canonical extension", () => {
		expect(validateBannerFile({ type: "image/png", size: 100 })).toBe("png");
		expect(validateBannerFile({ type: "image/jpeg", size: 100 })).toBe("jpg");
		expect(validateBannerFile({ type: "image/webp", size: 100 })).toBe("webp");
	});

	it("rejects an empty file", () => {
		expect(() => validateBannerFile({ type: "image/png", size: 0 })).toThrowError(MediaUploadError);
		try {
			validateBannerFile({ type: "image/png", size: 0 });
		} catch (e) {
			expect((e as MediaUploadError).code).toBe("EMPTY_FILE");
		}
	});

	it("rejects a disallowed type", () => {
		try {
			validateBannerFile({ type: "application/pdf", size: 100 });
			expect.unreachable();
		} catch (e) {
			expect((e as MediaUploadError).code).toBe("INVALID_TYPE");
		}
	});

	it("rejects a file above the size limit", () => {
		try {
			validateBannerFile({ type: "image/png", size: MAX_BANNER_BYTES + 1 });
			expect.unreachable();
		} catch (e) {
			expect((e as MediaUploadError).code).toBe("FILE_TOO_LARGE");
		}
	});
});

describe("safeBasename", () => {
	it("returns the bare filename from a stored url", () => {
		expect(safeBasename("/uploads/abc-123.png")).toBe("abc-123.png");
		expect(safeBasename("abc-123.webp")).toBe("abc-123.webp");
	});

	it("rejects traversal (..) and backslash inputs", () => {
		expect(safeBasename("../secret")).toBeNull();
		expect(safeBasename("/uploads/../../etc/passwd")).toBeNull();
		expect(safeBasename("..")).toBeNull();
		expect(safeBasename("foo\\bar.png")).toBeNull();
		expect(safeBasename("")).toBeNull();
	});

	it("reduces a nested path to its separator-free final segment", () => {
		const result = safeBasename("foo/bar.png");
		expect(result).toBe("bar.png");
		expect(result).not.toContain("/");
	});
});

describe("contentTypeFor", () => {
	it("maps known extensions", () => {
		expect(contentTypeFor("x.png")).toBe("image/png");
		expect(contentTypeFor("x.jpg")).toBe("image/jpeg");
		expect(contentTypeFor("x.jpeg")).toBe("image/jpeg");
		expect(contentTypeFor("x.webp")).toBe("image/webp");
	});

	it("falls back to octet-stream for unknown extensions", () => {
		expect(contentTypeFor("x.txt")).toBe("application/octet-stream");
	});
});

// ---------------------------------------------------------------------------
// R2 upload functions
// ---------------------------------------------------------------------------

function makeFile(type: string, size: number): File {
	const bytes = new Uint8Array(size).fill(1);
	return new File([bytes], "test.png", { type });
}

describe("uploadEventBanner", () => {
	it("sends PutObjectCommand with banners/events/ key prefix", async () => {
		const file = makeFile("image/png", 1024);
		const url = await uploadEventBanner(file);

		expect(mockSend).toHaveBeenCalledOnce();
		const cmd = mockSend.mock.calls[0][0] as InstanceType<typeof PutObjectCommand>;
		expect(cmd).toBeInstanceOf(PutObjectCommand);
		expect(cmd.input.Key).toMatch(/^banners\/events\/.+\.png$/);
		expect(cmd.input.Bucket).toBe("test-bucket");
		expect(cmd.input.ContentType).toBe("image/png");

		expect(url).toMatch(/^https:\/\/cdn\.example\.com\/banners\/events\/.+\.png$/);
	});

	it("rejects invalid file type before touching R2", async () => {
		const file = makeFile("application/pdf", 1024);
		await expect(uploadEventBanner(file)).rejects.toThrow(MediaUploadError);
		expect(mockSend).not.toHaveBeenCalled();
	});

	it("rejects oversized file before touching R2", async () => {
		const file = makeFile("image/png", MAX_BANNER_BYTES + 1);
		await expect(uploadEventBanner(file)).rejects.toThrow(MediaUploadError);
		expect(mockSend).not.toHaveBeenCalled();
	});
});

describe("uploadArticleCover", () => {
	it("sends PutObjectCommand with banners/articles/ key prefix", async () => {
		const file = makeFile("image/webp", 512);
		const url = await uploadArticleCover(file);

		expect(mockSend).toHaveBeenCalledOnce();
		const cmd = mockSend.mock.calls[0][0] as InstanceType<typeof PutObjectCommand>;
		expect(cmd).toBeInstanceOf(PutObjectCommand);
		expect(cmd.input.Key).toMatch(/^banners\/articles\/.+\.webp$/);
		expect(cmd.input.Bucket).toBe("test-bucket");

		expect(url).toMatch(/^https:\/\/cdn\.example\.com\/banners\/articles\/.+\.webp$/);
	});
});

// ---------------------------------------------------------------------------
// R2 delete functions
// ---------------------------------------------------------------------------

describe("deleteEventBanner", () => {
	it("sends DeleteObjectCommand with key extracted from full CDN URL", async () => {
		await deleteEventBanner("https://cdn.example.com/banners/events/abc-123.png");

		expect(mockSend).toHaveBeenCalledOnce();
		const cmd = mockSend.mock.calls[0][0] as InstanceType<typeof DeleteObjectCommand>;
		expect(cmd).toBeInstanceOf(DeleteObjectCommand);
		expect(cmd.input.Key).toBe("banners/events/abc-123.png");
		expect(cmd.input.Bucket).toBe("test-bucket");
	});

	it("sends DeleteObjectCommand with bare key when URL prefix does not match", async () => {
		await deleteEventBanner("banners/events/bare-key.png");

		expect(mockSend).toHaveBeenCalledOnce();
		const cmd = mockSend.mock.calls[0][0] as InstanceType<typeof DeleteObjectCommand>;
		expect(cmd).toBeInstanceOf(DeleteObjectCommand);
		expect(cmd.input.Key).toBe("banners/events/bare-key.png");
	});

	it("does not throw when send rejects", async () => {
		mockSend.mockRejectedValueOnce(new Error("network error"));
		await expect(
			deleteEventBanner("https://cdn.example.com/banners/events/abc.png")
		).resolves.toBeUndefined();
	});
});

describe("deleteArticleCover", () => {
	it("sends DeleteObjectCommand with key extracted from full CDN URL", async () => {
		await deleteArticleCover("https://cdn.example.com/banners/articles/xyz-456.webp");

		expect(mockSend).toHaveBeenCalledOnce();
		const cmd = mockSend.mock.calls[0][0] as InstanceType<typeof DeleteObjectCommand>;
		expect(cmd).toBeInstanceOf(DeleteObjectCommand);
		expect(cmd.input.Key).toBe("banners/articles/xyz-456.webp");
	});
});
