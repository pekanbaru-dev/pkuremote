<script lang="ts">
	import { EventForm } from "$lib/features/admin";
	import type { PageData, ActionData } from "./$types";

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Event Baru — Admin PKUBersua</title>
</svelte:head>

<section class="flex flex-col gap-6">
	<header>
		<h1 class="font-display text-headline-md text-ink">Event Baru</h1>
		<p class="text-on-surface-variant mt-1 text-sm">Isi detail event lalu simpan.</p>
	</header>

	{#if form?.message && !form?.field}
		<p class="label-meta text-error" role="alert">{form.message}</p>
	{/if}

	<EventForm
		categories={data.categories}
		values={form?.values ?? null}
		errorField={form?.field ?? null}
		errorMessage={form?.message ?? null}
		submitLabel="Buat Event"
	/>
</section>
