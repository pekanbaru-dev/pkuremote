import { describe, expect, it } from "vitest";
import { ESLint } from "eslint";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — svelte-eslint-parser's default export doesn't match ESLint's strict Parser type, but it works at runtime
import svelteParser from "svelte-eslint-parser";
import sveltePlugin from "eslint-plugin-svelte";
import tsParser from "@typescript-eslint/parser";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..", "..", "..");

const ROUTE_FIXTURE = '<input type="text" />';
const COMPONENT_FIXTURE = '<input type="text" />';
const TABLE_FIXTURE = "<table><tr><td>x</td></tr></table>";
const FORM_FIXTURE = '<form method="POST"><a href="/x">link</a></form>';

const ROUTE_FILE = "src/routes/whatever/+page.svelte";
const COMPONENT_FILE = "src/lib/components/ui/whatever/+page.svelte";

// Minimal flat config that mirrors the project's `svelte/no-restricted-html-elements`
// rule + the `src/lib/components/ui/**` exemption, but without the project's full
// `projectService: true` config (which rejects synthetic file paths).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const testConfig: any = [
	{
		files: ["**/*.svelte"],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tsParser,
				extraFileExtensions: [".svelte"]
			}
		},
		plugins: { svelte: sveltePlugin },
		rules: {
			"svelte/no-restricted-html-elements": [
				"error",
				{ elements: ["input"], message: "use <Input /> from $lib/components/ui" },
				{ elements: ["textarea"], message: "use <Textarea /> from $lib/components/ui" },
				{ elements: ["button"], message: "use <Button /> from $lib/components/ui" },
				{ elements: ["table"], message: "use <Table /> from $lib/components/ui" },
				{ elements: ["select"], message: "use <Autocomplete /> from $lib/components/ui" }
			]
		}
	},
	{
		files: ["src/lib/components/ui/**/*.svelte"],
		rules: {
			"svelte/no-restricted-html-elements": "off"
		}
	}
];

async function lint(fixture: string, filePath: string) {
	const eslint = new ESLint({
		overrideConfigFile: true,
		overrideConfig: testConfig,
		cwd: projectRoot
	});
	const [result] = await eslint.lintText(fixture, { filePath });
	return result;
}

describe("enforce-component-library rules", () => {
	it("blocks raw <input> in routes", async () => {
		const result = await lint(ROUTE_FIXTURE, ROUTE_FILE);
		const rule = result.messages.find((m) => m.ruleId === "svelte/no-restricted-html-elements");
		expect(rule).toBeDefined();
		expect(rule?.message).toContain("<Input />");
		expect(rule?.message).toContain("$lib/components/ui");
	});

	it("does not block raw <input> in component primitives", async () => {
		const result = await lint(COMPONENT_FIXTURE, COMPONENT_FILE);
		const rule = result.messages.find((m) => m.ruleId === "svelte/no-restricted-html-elements");
		expect(rule).toBeUndefined();
	});

	it("blocks raw <table> in routes", async () => {
		const result = await lint(TABLE_FIXTURE, ROUTE_FILE);
		const rule = result.messages.find((m) => m.ruleId === "svelte/no-restricted-html-elements");
		expect(rule).toBeDefined();
		expect(rule?.message).toContain("<Table />");
	});

	it("does not block <form> or <a> in routes", async () => {
		const result = await lint(FORM_FIXTURE, ROUTE_FILE);
		const rule = result.messages.find((m) => m.ruleId === "svelte/no-restricted-html-elements");
		expect(rule).toBeUndefined();
	});
});
