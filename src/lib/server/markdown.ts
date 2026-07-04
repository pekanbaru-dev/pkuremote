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
