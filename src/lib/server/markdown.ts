import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

/**
 * Render trusted-author Markdown (event bodies, written by admins) to sanitized
 * HTML for the public site. `marked` handles CommonMark + GFM; DOMPurify is the
 * safety net that strips anything unsafe (scripts, event handlers, `javascript:`
 * URLs) even though authors are trusted — defense in depth.
 *
 * Server-only: DOMPurify runs under jsdom here, so this must never be imported
 * into client code.
 */
export function renderMarkdown(markdown: string): string {
	if (!markdown.trim()) return "";
	const raw = marked.parse(markdown, { async: false, gfm: true }) as string;
	return DOMPurify.sanitize(raw, {
		ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel", "start"],
		ADD_ATTR: ["target"]
	});
}

/**
 * Sanitize article body HTML (produced by the TipTap rich text editor) for
 * safe rendering. The body is already HTML, so we do NOT run it through
 * `marked` — only DOMPurify strips anything unsafe (scripts, event handlers,
 * `javascript:` URLs). Allows the common ProseMirror/TipTap node attributes.
 *
 * Server-only: DOMPurify runs under jsdom here, so this must never be
 * imported into client code.
 */
export function sanitizeArticleHtml(html: string): string {
	if (html.trim().startsWith("{")) return sanitizeArticleBlocks(JSON.parse(html));
	if (!html || !html.trim()) return "";
	return DOMPurify.sanitize(html, {
		ALLOWED_TAGS: [
			"p",
			"br",
			"strong",
			"em",
			"u",
			"s",
			"h1",
			"h2",
			"h3",
			"h4",
			"ul",
			"ol",
			"li",
			"blockquote",
			"pre",
			"code",
			"a",
			"img",
			"hr"
		],
		ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel", "class", "start"]
	});
}

function sanitizeArticleBlocks(document: {
	content?: Array<{
		type?: string;
		content?: unknown[];
		text?: string;
		attrs?: Record<string, string>;
	}>;
}): string {
	const render = (node: {
		type?: string;
		content?: unknown[];
		text?: string;
		attrs?: Record<string, string>;
	}): string => {
		const children = (node.content ?? []).map((child) => render(child as typeof node)).join("");
		if (node.type === "text") return node.text ?? "";
		if (node.type === "paragraph") return `<p>${children}</p>`;
		if (node.type === "heading") return `<h2>${children}</h2>`;
		if (node.type === "blockquote") return `<blockquote>${children}</blockquote>`;
		if (node.type === "bulletList") return `<ul>${children}</ul>`;
		if (node.type === "orderedList") return `<ol>${children}</ol>`;
		if (node.type === "listItem") return `<li>${children}</li>`;
		if (node.type === "image")
			return `<img src="${node.attrs?.src ?? ""}" alt="${node.attrs?.alt ?? ""}">`;
		return children;
	};
	return DOMPurify.sanitize(render(document), {
		ALLOWED_TAGS: ["p", "h2", "blockquote", "ul", "ol", "li", "img"],
		ALLOWED_ATTR: ["src", "alt"]
	});
}
