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
			"del",
			"code",
			"h1",
			"h2",
			"h3",
			"h4",
			"h5",
			"h6",
			"ul",
			"ol",
			"li",
			"blockquote",
			"pre",
			"a",
			"img",
			"hr",
			"table",
			"thead",
			"tbody",
			"tr",
			"th",
			"td",
			"colgroup",
			"col",
			"span"
		],
		ALLOWED_ATTR: [
			"href",
			"src",
			"alt",
			"title",
			"target",
			"rel",
			"class",
			"style",
			"start",
			"width",
			"data-align",
			"colspan",
			"rowspan"
		]
	});
}

// ---------------------------------------------------------------------------
// ProseMirror / TipTap JSON renderer
// ---------------------------------------------------------------------------

type Mark = {
	type: string;
	attrs?: Record<string, unknown>;
};

type Node = {
	type?: string;
	text?: string;
	marks?: Mark[];
	attrs?: Record<string, unknown>;
	content?: Node[];
};

function renderMarks(text: string, marks: Mark[]): string {
	return marks.reduce((acc, mark) => {
		switch (mark.type) {
			case "bold":
				return `<strong>${acc}</strong>`;
			case "italic":
				return `<em>${acc}</em>`;
			case "strike":
				return `<s>${acc}</s>`;
			case "code":
				return `<code>${acc}</code>`;
			case "underline":
				return `<u>${acc}</u>`;
			case "link": {
				const href = escapeHtml(mark.attrs?.href);
				const rel = 'rel="noopener noreferrer"';
				return `<a href="${href}" target="_blank" ${rel}>${acc}</a>`;
			}
			default:
				return acc;
		}
	}, text);
}

function renderNode(node: Node): string {
	// Text node — apply marks and return
	if (node.type === "text") {
		const safe = escapeHtml(node.text ?? "");
		return node.marks?.length ? renderMarks(safe, node.marks) : safe;
	}

	const children = (node.content ?? []).map(renderNode).join("");

	switch (node.type) {
		case "paragraph": {
			const align = node.attrs?.textAlign;
			const style = align && align !== "left" ? ` style="text-align:${align}"` : "";
			return `<p${style}>${children}</p>`;
		}
		case "heading": {
			const level = Math.min(6, Math.max(1, Number(node.attrs?.level ?? 2)));
			const tag = `h${level}`;
			const align = node.attrs?.textAlign;
			const style = align && align !== "left" ? ` style="text-align:${align}"` : "";
			return `<${tag}${style}>${children}</${tag}>`;
		}
		case "blockquote":
			return `<blockquote>${children}</blockquote>`;
		case "bulletList":
			return `<ul>${children}</ul>`;
		case "orderedList": {
			const start = Number(node.attrs?.start ?? 1);
			const startAttr = start !== 1 ? ` start="${start}"` : "";
			return `<ol${startAttr}>${children}</ol>`;
		}
		case "listItem":
			return `<li>${children}</li>`;
		case "codeBlock": {
			const lang = escapeHtml(node.attrs?.language ?? "");
			const classAttr = lang ? ` class="language-${lang}"` : "";
			return `<pre><code${classAttr}>${children}</code></pre>`;
		}
		case "horizontalRule":
			return `<hr>`;
		case "hardBreak":
			return `<br>`;
		case "image": {
			const rawWidth = node.attrs?.width;
			const parsedWidth = Number.parseFloat(String(rawWidth ?? ""));
			const width = Number.isFinite(parsedWidth)
				? Math.min(100, Math.max(20, Math.round(parsedWidth)))
				: null;
			const src = escapeHtml(node.attrs?.src);
			const alt = escapeHtml(node.attrs?.alt);
			const title = String(node.attrs?.title ?? "").trim();
			const titleAttribute = title ? ` title="${escapeHtml(title)}"` : "";
			const rawAlignment = node.attrs?.alignment ?? node.attrs?.["data-align"];
			const alignment = isImageAlignment(rawAlignment) ? rawAlignment : "left";
			const widthAttribute = width === null ? "" : ` width="${width}%"`;
			const alignmentAttribute = alignment === "left" ? "" : ` data-align="${alignment}"`;
			return `<img src="${src}" alt="${alt}"${titleAttribute}${widthAttribute}${alignmentAttribute}>`;
		}
		case "table":
			return `<table>${children}</table>`;
		case "tableRow":
			return `<tr>${children}</tr>`;
		case "tableHeader":
			return `<th>${children}</th>`;
		case "tableCell":
			return `<td>${children}</td>`;
		case "mathematics": {
			// KaTeX renders its own HTML inside the node's html attr or children.
			// TipTap Mathematics stores rendered HTML in attrs.latex — emit as-is
			// wrapped in a span so KaTeX CSS can target it.
			const katexHtml = String(node.attrs?.html ?? node.attrs?.latex ?? children);
			return `<span class="math-node">${katexHtml}</span>`;
		}
		default:
			// Unknown node — still render children so content isn't silently lost
			return children;
	}
}

function sanitizeArticleBlocks(document: Node): string {
	const raw = (document.content ?? []).map(renderNode).join("");
	return DOMPurify.sanitize(raw, {
		ALLOWED_TAGS: [
			"p",
			"br",
			"strong",
			"em",
			"u",
			"s",
			"del",
			"code",
			"h1",
			"h2",
			"h3",
			"h4",
			"h5",
			"h6",
			"ul",
			"ol",
			"li",
			"blockquote",
			"pre",
			"a",
			"img",
			"hr",
			"table",
			"thead",
			"tbody",
			"tr",
			"th",
			"td",
			"span"
		],
		ALLOWED_ATTR: [
			"href",
			"target",
			"rel",
			"src",
			"alt",
			"title",
			"width",
			"data-align",
			"class",
			"style",
			"start",
			"colspan",
			"rowspan"
		]
	});
}

function isImageAlignment(value: unknown): value is "left" | "center" | "right" {
	return value === "left" || value === "center" || value === "right";
}

function escapeHtml(value: unknown): string {
	const entities: Record<string, string> = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#39;"
	};
	return String(value ?? "").replace(/[&<>"']/g, (ch) => entities[ch] ?? ch);
}
