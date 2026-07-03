import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Locks the @theme block in `src/routes/layout.css` so the unqualified
 * `text-body` / `text-headline` / `text-title` / `text-display` /
 * `text-label` utilities keep generating CSS after the rewrite that
 * introduced compound tokens. Codex review 3502986905: the auth/profile
 * pages and the `.label-meta` helper still read these names, and
 * `var(--text-label)` is referenced directly from CSS.
 */
describe("layout.css unqualified text tokens", () => {
	const css = readFileSync(resolve("src/routes/layout.css"), "utf8");

	it.each(["--text-body", "--text-headline", "--text-title", "--text-display", "--text-label"])(
		"declares %s as a theme token with a literal value",
		(token) => {
			const re = new RegExp(`^\\s*${token}:\\s*[^;]+;`, "m");
			expect(css, `missing ${token} in @theme`).toMatch(re);
		}
	);

	it.each([
		"--text-body--line-height",
		"--text-body--font-weight",
		"--text-headline--line-height",
		"--text-headline--font-weight",
		"--text-title--line-height",
		"--text-title--font-weight",
		"--text-display--line-height",
		"--text-display--font-weight",
		"--text-label--line-height",
		"--text-label--font-weight"
	])("declares %s for the multi-axis utility", (token) => {
		const re = new RegExp(`^\\s*${token}:\\s*[^;]+;`, "m");
		expect(css, `missing ${token} in @theme`).toMatch(re);
	});
});

describe("build output: unqualified text utilities", () => {
	// The build emits hashed CSS files. Find any .css under the assets dir.
	const assetsDir = resolve(".svelte-kit/output/client/_app/immutable/assets");
	const cssPath = existsSync(assetsDir)
		? readdirSync(assetsDir)
				.filter((f) => f.endsWith(".css"))
				.map((f) => resolve(assetsDir, f))[0]
		: undefined;

	it.skipIf(!cssPath)("emits the unqualified text utilities and variables", () => {
		const built = readFileSync(cssPath as string, "utf8");
		for (const token of [
			"text-body",
			"text-headline",
			"text-title",
			"text-display",
			"text-label"
		]) {
			expect(built, `missing utility .${token} in built CSS`).toContain(`.${token}{`);
		}
		for (const variable of [
			"--text-body:",
			"--text-headline:",
			"--text-title:",
			"--text-display:",
			"--text-label:"
		]) {
			expect(built, `missing variable ${variable} in built CSS`).toContain(variable);
		}
	});
});
