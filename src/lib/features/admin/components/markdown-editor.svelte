<script lang="ts">
	import { onMount } from "svelte";
	import type { Carta } from "carta-md";
	import { Input } from "$lib/components/ui/input";

	let {
		value = $bindable(""),
		name,
		placeholder = ""
	}: { value?: string; name: string; placeholder?: string } = $props();

	// Carta (and its Shiki dependency) is imported lazily in the browser only, so
	// it never enters the SSR/server bundle. The hidden <Input> carries the
	// markdown into the native form POST whether or not the editor has mounted.
	let Editor = $state<typeof import("carta-md").MarkdownEditor | null>(null);
	let carta = $state<Carta | null>(null);

	onMount(async () => {
		const [cartaMod, dompurifyMod] = await Promise.all([
			import("carta-md"),
			import("isomorphic-dompurify"),
			import("carta-md/default.css")
		]);
		const sanitize = dompurifyMod.default.sanitize;
		carta = new cartaMod.Carta({ sanitizer: (html: string) => sanitize(html) as string });
		Editor = cartaMod.MarkdownEditor;
	});
</script>

<div class="md-editor">
	{#if Editor && carta}
		<Editor {carta} bind:value mode="tabs" {placeholder} />
	{:else}
		<div class="md-editor__loading" aria-hidden="true">{value}</div>
	{/if}
</div>
<Input type="hidden" {name} {value} />

<style>
	.md-editor__loading {
		min-height: 14rem;
		white-space: pre-wrap;
		border-radius: 0.5rem;
		border: 1px solid var(--color-hairline);
		padding: 0.5rem 0.625rem;
		color: var(--color-ink);
	}

	/* Brand-tune Carta's default theme to the cream/ink palette. */
	.md-editor :global(.carta-theme__default) {
		--border-color: var(--color-hairline);
		--hover-color: var(--color-surface-container-high);
		--text-color: var(--color-ink);
		--caret-color: var(--color-primary);
		--focus-outline: var(--color-primary);
		--selection-color: color-mix(in oklch, var(--color-primary-container) 45%, transparent);
	}
	.md-editor :global(.carta-editor) {
		border-radius: 0.5rem;
		background: var(--color-canvas);
	}
	.md-editor :global(.carta-toolbar) {
		background: var(--color-surface-container-low);
		border-top-left-radius: 0.5rem;
		border-top-right-radius: 0.5rem;
	}
	/* A sensible height instead of Carta's fixed 600px. */
	.md-editor :global(.carta-input),
	.md-editor :global(.carta-renderer) {
		height: 20rem;
	}
	/* Editor placeholder reads as a hint, matching the other form fields. */
	.md-editor :global(.carta-input ::placeholder) {
		color: color-mix(in oklch, var(--color-muted) 55%, transparent);
	}
	/* Active Write/Preview tab. */
	.md-editor :global(.carta-toolbar-left .carta-active) {
		color: var(--color-ink);
		font-weight: 600;
		border-bottom: 2px solid var(--color-primary);
	}
	.md-editor :global(.carta-font-code) {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	}
</style>
