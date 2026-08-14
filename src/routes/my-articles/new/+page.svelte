<script lang="ts">
	import { ArticleEditor } from "$lib/features/articles";
	import type { ActionData } from "./$types";

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Tulis Artikel Baru</title>
</svelte:head>

<div class="container-page py-12">
	<div class="mb-8 flex items-center gap-4">
		<a href="/my-articles" class="text-label-md font-label text-muted-foreground hover:text-ink">
			← Artikel Saya
		</a>
		<h1 class="font-display text-display-sm font-bold text-ink">Tulis Artikel Baru</h1>
	</div>

	<div class="max-w-3xl">
		<ArticleEditor error={form?.error} />
	</div>
</div>
