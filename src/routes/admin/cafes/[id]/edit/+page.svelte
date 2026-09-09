<script lang="ts">
	import { CafeForm } from "$lib/features/admin";
	import type { ActionData, PageData } from "./$types";

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Ubah {data.cafe.name} — Admin PKUBersua</title>
</svelte:head>

<section class="flex flex-col gap-6">
	<header>
		<h1 class="font-display text-headline-md text-ink">Ubah Kafe WFC</h1>
		<p class="mt-1 text-sm text-on-surface-variant">Perbarui informasi {data.cafe.name}.</p>
	</header>

	<CafeForm
		cafe={data.cafe}
		values={form?.values ?? null}
		errorMessage={form?.message ?? null}
		submitLabel="Simpan Perubahan"
	/>
</section>
