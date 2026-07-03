import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

// Svelte 5's HTMLAttributes allows `string | null` for several common
// attributes (class, id, style, etc.), which clashes with bits-ui's stricter
// prop types. This helper narrows those fields to `string | undefined`.
export type BitsCompatibleHTMLAttributes<T extends EventTarget> = Omit<
	svelteHTML.HTMLAttributes<T>,
	"class" | "id" | "style" | "tabindex" | "role" | "title" | "lang" | "dir"
> & {
	class?: string;
	id?: string;
	style?: string;
	tabindex?: number;
	role?: string;
	title?: string;
	lang?: string;
	dir?: string;
};
