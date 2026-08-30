<script lang="ts">
	import { ArticleEditor } from "$lib/features/articles";
	import type { ActionData } from "./$types";

	let { form, data }: { form: ActionData; data: import("./$types").PageData } = $props();
</script>

<svelte:head>
	<title>Tulis Artikel Baru</title>
</svelte:head>

<div class="mx-auto w-full max-w-[52rem] px-5 py-10 tablet:px-8 tablet:py-14">
	<div class="mb-10 flex items-center gap-3">
		<a
			href="/my-articles"
			class="text-label-md font-medium text-on-surface-variant transition-colors hover:text-ink"
		>
			← Artikel Saya
		</a>
		<span class="h-4 w-px bg-hairline" aria-hidden="true"></span>
		<h1 class="text-label-md font-semibold text-ink">Tulis artikel baru</h1>
	</div>

	<div>
		<ArticleEditor error={form?.error} categories={data.categories} />
	</div>
</div>
