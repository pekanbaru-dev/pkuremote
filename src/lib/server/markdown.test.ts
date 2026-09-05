import { describe, expect, it } from "vitest";
import { renderMarkdown, sanitizeArticleHtml } from "./markdown";

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

describe("sanitizeArticleHtml", () => {
	// ── image tests (existing) ──────────────────────────────────────────────

	it("preserves a safe image width from TipTap JSON", () => {
		const html = sanitizeArticleHtml(
			JSON.stringify({
				type: "doc",
				content: [{ type: "image", attrs: { src: "https://example.com/image.jpg", width: 75 } }]
			})
		);
		expect(html).toContain('<img src="https://example.com/image.jpg" alt="" width="75%">');
	});

	it("renders image metadata and alignment", () => {
		const html = sanitizeArticleHtml(
			JSON.stringify({
				type: "doc",
				content: [
					{
						type: "image",
						attrs: {
							src: "https://example.com/image.jpg",
							alt: "Kegiatan & komunitas",
							title: "Foto kegiatan",
							alignment: "right"
						}
					}
				]
			})
		);
		expect(html).toContain(
			'<img src="https://example.com/image.jpg" alt="Kegiatan &amp; komunitas" title="Foto kegiatan" data-align="right">'
		);
	});

	it("clamps image widths to the supported range", () => {
		const html = sanitizeArticleHtml(
			JSON.stringify({
				type: "doc",
				content: [
					{ type: "image", attrs: { src: "https://example.com/small.jpg", width: 10 } },
					{ type: "image", attrs: { src: "https://example.com/large.jpg", width: 150 } }
				]
			})
		);
		expect(html).toContain('width="20%"');
		expect(html).toContain('width="100%"');
	});

	// ── inline marks ────────────────────────────────────────────────────────

	it("renders bold and italic marks", () => {
		const html = sanitizeArticleHtml(
			JSON.stringify({
				type: "doc",
				content: [
					{
						type: "paragraph",
						content: [
							{ type: "text", text: "tebal", marks: [{ type: "bold" }] },
							{ type: "text", text: " dan " },
							{ type: "text", text: "miring", marks: [{ type: "italic" }] }
						]
					}
				]
			})
		);
		expect(html).toContain("<strong>tebal</strong>");
		expect(html).toContain("<em>miring</em>");
	});

	it("renders strikethrough", () => {
		const html = sanitizeArticleHtml(
			JSON.stringify({
				type: "doc",
				content: [
					{
						type: "paragraph",
						content: [{ type: "text", text: "coret", marks: [{ type: "strike" }] }]
					}
				]
			})
		);
		expect(html).toContain("<s>coret</s>");
	});

	it("renders inline code mark", () => {
		const html = sanitizeArticleHtml(
			JSON.stringify({
				type: "doc",
				content: [
					{
						type: "paragraph",
						content: [{ type: "text", text: "npm install", marks: [{ type: "code" }] }]
					}
				]
			})
		);
		expect(html).toContain("<code>npm install</code>");
	});

	it("renders link mark with safe href", () => {
		const html = sanitizeArticleHtml(
			JSON.stringify({
				type: "doc",
				content: [
					{
						type: "paragraph",
						content: [
							{
								type: "text",
								text: "kunjungi",
								marks: [{ type: "link", attrs: { href: "https://example.com" } }]
							}
						]
					}
				]
			})
		);
		expect(html).toContain('href="https://example.com"');
		expect(html).toContain("kunjungi");
	});

	it("strips javascript: URLs in link marks", () => {
		const html = sanitizeArticleHtml(
			JSON.stringify({
				type: "doc",
				content: [
					{
						type: "paragraph",
						content: [
							{
								type: "text",
								text: "xss",
								marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }]
							}
						]
					}
				]
			})
		);
		expect(html).not.toContain("javascript:");
	});

	// ── block nodes ─────────────────────────────────────────────────────────

	it("renders heading levels 1–6", () => {
		const html = sanitizeArticleHtml(
			JSON.stringify({
				type: "doc",
				content: [
					{ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "H2" }] },
					{ type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "H3" }] },
					{ type: "heading", attrs: { level: 4 }, content: [{ type: "text", text: "H4" }] }
				]
			})
		);
		expect(html).toContain("<h2>H2</h2>");
		expect(html).toContain("<h3>H3</h3>");
		expect(html).toContain("<h4>H4</h4>");
	});

	it("renders code block with language class", () => {
		const html = sanitizeArticleHtml(
			JSON.stringify({
				type: "doc",
				content: [
					{
						type: "codeBlock",
						attrs: { language: "javascript" },
						content: [{ type: "text", text: "const x = 1;" }]
					}
				]
			})
		);
		expect(html).toContain('<pre><code class="language-javascript">const x = 1;</code></pre>');
	});

	it("renders horizontal rule", () => {
		const html = sanitizeArticleHtml(
			JSON.stringify({
				type: "doc",
				content: [{ type: "horizontalRule" }]
			})
		);
		expect(html).toContain("<hr>");
	});

	it("renders hard break", () => {
		const html = sanitizeArticleHtml(
			JSON.stringify({
				type: "doc",
				content: [
					{
						type: "paragraph",
						content: [
							{ type: "text", text: "baris satu" },
							{ type: "hardBreak" },
							{ type: "text", text: "baris dua" }
						]
					}
				]
			})
		);
		expect(html).toContain("<br>");
		expect(html).toContain("baris satu");
		expect(html).toContain("baris dua");
	});

	it("renders ordered list with custom start", () => {
		const html = sanitizeArticleHtml(
			JSON.stringify({
				type: "doc",
				content: [
					{
						type: "orderedList",
						attrs: { start: 3 },
						content: [
							{
								type: "listItem",
								content: [{ type: "paragraph", content: [{ type: "text", text: "tiga" }] }]
							}
						]
					}
				]
			})
		);
		expect(html).toContain('start="3"');
		expect(html).toContain("<li>");
	});

	it("renders table with th and td", () => {
		const html = sanitizeArticleHtml(
			JSON.stringify({
				type: "doc",
				content: [
					{
						type: "table",
						content: [
							{
								type: "tableRow",
								content: [
									{
										type: "tableHeader",
										content: [{ type: "paragraph", content: [{ type: "text", text: "Nama" }] }]
									},
									{
										type: "tableHeader",
										content: [{ type: "paragraph", content: [{ type: "text", text: "Nilai" }] }]
									}
								]
							},
							{
								type: "tableRow",
								content: [
									{
										type: "tableCell",
										content: [{ type: "paragraph", content: [{ type: "text", text: "Andi" }] }]
									},
									{
										type: "tableCell",
										content: [{ type: "paragraph", content: [{ type: "text", text: "90" }] }]
									}
								]
							}
						]
					}
				]
			})
		);
		expect(html).toContain("<table>");
		expect(html).toContain("<th>");
		expect(html).toContain("<td>");
		expect(html).toContain("Nama");
		expect(html).toContain("Andi");
	});

	it("renders text-align on paragraph", () => {
		const html = sanitizeArticleHtml(
			JSON.stringify({
				type: "doc",
				content: [
					{
						type: "paragraph",
						attrs: { textAlign: "center" },
						content: [{ type: "text", text: "tengah" }]
					}
				]
			})
		);
		expect(html).toContain('style="text-align:center"');
		expect(html).toContain("tengah");
	});

	// ── XSS defense ─────────────────────────────────────────────────────────

	it("strips script injection from text nodes", () => {
		const html = sanitizeArticleHtml(
			JSON.stringify({
				type: "doc",
				content: [
					{
						type: "paragraph",
						content: [{ type: "text", text: "<script>alert(1)</script>" }]
					}
				]
			})
		);
		expect(html).not.toContain("<script");
	});
});
