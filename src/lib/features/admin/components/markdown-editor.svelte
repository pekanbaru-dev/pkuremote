<script lang="ts">
	import { browser } from "$app/environment";
	import { Carta, MarkdownEditor } from "carta-md";
	import DOMPurify from "isomorphic-dompurify";
	import { Input } from "$lib/components/ui/input";
	import "carta-md/default.css";

	let {
		value = $bindable(""),
		name,
		placeholder = ""
	}: { value?: string; name: string; placeholder?: string } = $props();

	// Carta touches the DOM, so only build it in the browser; the hidden input
	// below carries the markdown into the native form POST regardless.
	const carta = browser
		? new Carta({ sanitizer: (html: string) => DOMPurify.sanitize(html) })
		: null;
</script>

<div class="md-editor">
	{#if browser && carta}
		<MarkdownEditor {carta} bind:value mode="tabs" {placeholder} />
	{:else}
		<div class="md-editor__ssr" aria-hidden="true">{value}</div>
	{/if}
</div>
<Input type="hidden" {name} {value} />

<style>
	.md-editor__ssr {
		min-height: 12rem;
		white-space: pre-wrap;
		border-radius: 0.5rem;
		border: 1px solid var(--color-hairline);
		padding: 0.5rem 0.625rem;
		color: var(--color-ink);
	}
</style>
