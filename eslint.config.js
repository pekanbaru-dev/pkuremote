import prettier from "eslint-config-prettier";
import path from "node:path";
import js from "@eslint/js";
import svelte from "eslint-plugin-svelte";
import { defineConfig, includeIgnoreFile } from "eslint/config";
import globals from "globals";
import ts from "typescript-eslint";

const gitignorePath = path.resolve(import.meta.dirname, ".gitignore");

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			"no-undef": "off"
		}
	},
	{
		files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: [".svelte"],
				parser: ts.parser
			}
		}
	},
	{
		// Override or add rule settings here, such as:
		// 'svelte/button-has-type': 'error'
		rules: {
			"svelte/no-navigation-without-resolve": "off",
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
		files: ["src/**/*.{ts,js,svelte,svelte.ts,svelte.js}"],
		ignores: ["tests/**", "**/*.test.ts", "**/*.test.svelte.ts"],
		rules: {
			"no-restricted-imports": [
				"error",
				{
					patterns: [
						{
							group: ["**/Button", "**/button", "!$lib/components/ui/button"],
							message: "use <Button /> from $lib/components/ui"
						},
						{
							group: ["**/Input", "**/input", "!$lib/components/ui/input"],
							message: "use <Input /> from $lib/components/ui"
						},
						{
							group: ["**/Textarea", "**/textarea", "!$lib/components/ui/textarea"],
							message: "use <Textarea /> from $lib/components/ui"
						},
						{
							group: ["**/Table", "**/table", "!$lib/components/ui/table"],
							message: "use <Table /> from $lib/components/ui"
						},
						{
							group: ["**/Dialog", "**/dialog", "!$lib/components/ui/dialog"],
							message: "use <Dialog /> from $lib/components/ui"
						},
						{
							group: ["**/Checkbox", "**/checkbox", "!$lib/components/ui/checkbox"],
							message: "use <Checkbox /> from $lib/components/ui"
						},
						{
							group: ["**/Radio", "**/radio", "!$lib/components/ui/radio"],
							message: "use <Radio /> from $lib/components/ui"
						},
						{
							group: [
								"**/CurrencyInput",
								"**/currency-input",
								"!$lib/components/ui/currency-input"
							],
							message: "use <CurrencyInput /> from $lib/components/ui"
						}
					]
				}
			]
		}
	},
	{
		files: ["src/lib/components/ui/**/*.ts", "src/lib/components/ui/**/*.svelte"],
		rules: {
			"svelte/no-restricted-html-elements": "off",
			"no-restricted-imports": "off"
		}
	}
);
