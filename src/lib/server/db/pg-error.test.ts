import { describe, expect, it } from "vitest";
import { isForeignKeyViolation, isUniqueViolation, pgErrorCode } from "./pg-error";

describe("pgErrorCode", () => {
	it("reads a code off the top-level error", () => {
		expect(pgErrorCode({ code: "23505" })).toBe("23505");
	});

	it("unwraps drizzle's DrizzleQueryError wrapper (.cause holds the pg error)", () => {
		// This is the real-world shape: `new DrizzleQueryError(query, params, pgError)`
		// leaves the pg error (with .code) on `.cause`; the wrapper has none.
		const wrapped = { message: "Failed query: insert …", cause: { code: "23505" } };
		expect(pgErrorCode(wrapped)).toBe("23505");
	});

	it("walks multiple levels of nesting", () => {
		expect(pgErrorCode({ cause: { cause: { code: "23503" } } })).toBe("23503");
	});

	it("returns undefined when no code is present", () => {
		expect(pgErrorCode(new Error("boom"))).toBeUndefined();
		expect(pgErrorCode(null)).toBeUndefined();
	});
});

describe("isUniqueViolation", () => {
	it("detects 23505 whether direct or wrapped", () => {
		expect(isUniqueViolation({ code: "23505" })).toBe(true);
		expect(isUniqueViolation({ cause: { code: "23505" } })).toBe(true);
	});

	it("ignores other codes", () => {
		expect(isUniqueViolation({ cause: { code: "23503" } })).toBe(false);
		expect(isUniqueViolation(null)).toBe(false);
	});
});

describe("isForeignKeyViolation", () => {
	it("detects 23503 whether direct or wrapped", () => {
		expect(isForeignKeyViolation({ code: "23503" })).toBe(true);
		expect(isForeignKeyViolation({ cause: { code: "23503" } })).toBe(true);
	});
});
