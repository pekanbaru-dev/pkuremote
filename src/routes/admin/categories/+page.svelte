<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import { enhance } from "$app/forms";
	import * as Table from "$lib/components/ui/table";
	import * as Dialog from "$lib/components/ui/dialog";
	import { EmptyState } from "$lib/components/ui/empty-state";
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import type { EventCategoryRef } from "$lib/features/events";
	import type { PageData, ActionData } from "./$types";

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let pendingEdit = $state<EventCategoryRef | null>(null);
	let pendingDelete = $state<EventCategoryRef | null>(null);

	const createError = $derived(form?.action === "create" ? form : null);

	const labelSpan = "label-meta text-on-surface-variant";
</script>

<svelte:head>
	<title>Kelola Kategori — Admin PKUBersua</title>
</svelte:head>

<section class="flex flex-col gap-6">
	<header>
		<h1 class="font-display text-headline-md text-ink">Kelola Kategori</h1>
		<p class="text-on-surface-variant mt-1 text-sm">Kategori dipakai untuk menandai (tag) event.</p>
	</header>

	<form
		method="POST"
		action="?/create"
		use:enhance={() =>
			async ({ update }) => {
				await update();
			}}
		class="grid gap-3 rounded-xl border border-hairline p-4 tablet:grid-cols-[1fr_1fr_auto] tablet:items-end"
	>
		<label class="flex flex-col gap-1">
			<span class={labelSpan}>Nama</span>
			<Input name="name" value={createError?.name ?? ""} required />
		</label>
		<label class="flex flex-col gap-1">
			<span class={labelSpan}>Slug</span>
			<Input name="slug" value={createError?.slug ?? ""} placeholder="mis. workshop" required />
		</label>
		<Button type="submit">Tambah Kategori</Button>
		{#if createError?.message}
			<p class="label-meta text-error tablet:col-span-3" role="alert">{createError.message}</p>
		{/if}
	</form>

	{#if data.categories.length === 0}
		<EmptyState title="Belum ada kategori" description="Tambahkan kategori pertama di atas." />
	{:else}
		<div class="overflow-x-auto rounded-xl border border-hairline">
			<Table.Root>
				<Table.Header class="bg-surface-container-low">
					<Table.Row class="hover:bg-transparent">
						<Table.Head class="text-label-md font-semibold text-on-surface-variant uppercase"
							>Nama</Table.Head
						>
						<Table.Head class="text-label-md font-semibold text-on-surface-variant uppercase"
							>Slug</Table.Head
						>
						<Table.Head
							class="text-label-md font-semibold text-on-surface-variant uppercase text-right"
							>Aksi</Table.Head
						>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.categories as category (category.id)}
						<Table.Row class="border-hairline">
							<Table.Cell class="py-3.5 font-medium text-ink">{category.name}</Table.Cell>
							<Table.Cell class="py-3.5 text-on-surface-variant">{category.slug}</Table.Cell>
							<Table.Cell class="py-3.5">
								<div class="flex justify-end gap-1.5">
									<Button variant="ghost" size="sm" onclick={() => (pendingEdit = category)}>
										Ubah
									</Button>
									<Button
										variant="ghost"
										size="sm"
										class="text-danger hover:text-danger hover:bg-danger/10"
										onclick={() => (pendingDelete = category)}
									>
										Hapus
									</Button>
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</section>

<!-- Edit dialog -->
<Dialog.Root
	open={pendingEdit !== null}
	onOpenChange={(open) => {
		if (!open) pendingEdit = null;
	}}
>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Ubah Kategori</Dialog.Title>
		</Dialog.Header>
		<form
			method="POST"
			action="?/update"
			use:enhance={() =>
				async ({ result, update }) => {
					if (result.type === "redirect" || result.type === "success") pendingEdit = null;
					await update();
				}}
			class="grid gap-4"
		>
			<Input type="hidden" name="id" value={pendingEdit?.id ?? ""} />
			<label class="flex flex-col gap-1">
				<span class={labelSpan}>Nama</span>
				<Input name="name" value={pendingEdit?.name ?? ""} required />
			</label>
			<label class="flex flex-col gap-1">
				<span class={labelSpan}>Slug</span>
				<Input name="slug" value={pendingEdit?.slug ?? ""} required />
			</label>
			{#if form?.action === "update" && form?.message}
				<p class="label-meta text-error" role="alert">{form.message}</p>
			{/if}
			<Dialog.Footer>
				<Button variant="ghost" onclick={() => (pendingEdit = null)}>Batal</Button>
				<Button type="submit">Simpan</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete dialog -->
<Dialog.Root
	open={pendingDelete !== null}
	onOpenChange={(open) => {
		if (!open) pendingDelete = null;
	}}
>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Hapus kategori?</Dialog.Title>
			<Dialog.Description>
				Menghapus <strong>{pendingDelete?.name}</strong> akan melepaskan tag ini dari semua event yang
				memakainya. Event itu sendiri tidak dihapus.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="ghost" onclick={() => (pendingDelete = null)}>Batal</Button>
			<form
				method="POST"
				action="?/delete"
				use:enhance={() =>
					async ({ update }) => {
						pendingDelete = null;
						await update();
						await invalidateAll();
					}}
			>
				<Input type="hidden" name="id" value={pendingDelete?.id ?? ""} />
				<Button type="submit" variant="destructive">Hapus</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
