<script lang="ts">
	import { CafeForm } from "$lib/features/admin";
	import type { ActionData } from "./$types";

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Kafe Baru — Admin PKUBersua</title>
</svelte:head>

<section class="flex flex-col gap-6">
	<header>
		<h1 class="font-display text-headline-md text-ink">Kafe WFC Baru</h1>
		<p class="mt-1 text-sm text-on-surface-variant">Tambahkan tempat kerja ke kurasi WFC.</p>
	</header>

	<CafeForm
		values={form?.values ?? null}
		errorMessage={form?.message ?? null}
		submitLabel="Buat Kafe"
	/>
</section>
