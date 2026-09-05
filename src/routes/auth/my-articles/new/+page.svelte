<script lang="ts">
	import { ArticleEditor } from "$lib/features/articles";
	import ChevronLeft from "@lucide/svelte/icons/chevron-left";
	import type { ActionData } from "./$types";

	let { form, data }: { form: ActionData; data: import("./$types").PageData } = $props();
</script>

<svelte:head>
	<title>Tulis Artikel Baru</title>
</svelte:head>

<div class="relative mx-auto w-full max-w-7xl px-2 pt-2 pb-4 tablet:px-[0.8rem] tablet:pt-2 tablet:pb-[1.4rem]">
	<!-- Back button — floating left -->
	<a
		href="/auth/my-articles"
		class="fixed left-4 top-4 z-50 inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-canvas/90 text-on-surface-variant shadow-sm backdrop-blur hover:bg-surface-container hover:text-ink transition-colors"
		aria-label="Kembali ke Artikel Saya"
	>
		<ChevronLeft class="size-4" />
	</a>

	<div>
		<ArticleEditor error={form?.error} categories={data.categories} />
	</div>
</div>
