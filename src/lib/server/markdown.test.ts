import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
	it("renders common Markdown to HTML", () => {
		const html = renderMarkdown(
			"## Judul\n\nHalo **tebal** dan [tautan](https://example.com)\n\n- satu\n- dua"
		);
		expect(html).toContain("<h2>Judul</h2>");
		expect(html).toContain("<strong>tebal</strong>");
		expect(html).toContain('<a href="https://example.com">tautan</a>');
		expect(html).toContain("<li>satu</li>");
	});

	it("strips script tags and event-handler attributes (XSS defense)", () => {
		const html = renderMarkdown("<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>");
		expect(html).not.toContain("<script");
		expect(html).not.toContain("onerror");
	});

	it("drops javascript: URLs", () => {
		const html = renderMarkdown("[klik](javascript:alert(1))");
		expect(html).not.toContain("javascript:");
	});

	it("returns an empty string for blank input", () => {
		expect(renderMarkdown("")).toBe("");
		expect(renderMarkdown("   \n  ")).toBe("");
	});
});
