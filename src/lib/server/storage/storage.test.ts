import { describe, expect, it, vi } from "vitest";

vi.mock("$env/dynamic/private", () => ({ env: {} }));

import {
	MAX_BANNER_BYTES,
	MediaUploadError,
	contentTypeFor,
	safeBasename,
	validateBannerFile
} from "./index";

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
