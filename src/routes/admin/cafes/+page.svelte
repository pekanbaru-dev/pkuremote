<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import { enhance } from "$app/forms";
	import * as Dialog from "$lib/components/ui/dialog";
	import * as Table from "$lib/components/ui/table";
	import { EmptyState } from "$lib/components/ui/empty-state";
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/primitives";
	import type { Cafe } from "$lib/features/wfc";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
	let pendingDelete = $state<Cafe | null>(null);
	const deleteOpen = $derived(pendingDelete !== null);
</script>

<svelte:head>
	<title>Kelola Kafe WFC — Admin PKUBersua</title>
</svelte:head>

<section class="flex flex-col gap-6">
	<header class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h1 class="font-display text-headline-md text-ink">Kelola Kafe WFC</h1>
			<p class="mt-1 text-sm text-on-surface-variant">
				Atur tempat kerja yang tampil di halaman WFC.
			</p>
		</div>
		<Button href="/admin/cafes/new"><PlusIcon class="size-4" />Kafe Baru</Button>
	</header>

	{#if data.cafes.length === 0}
		<EmptyState title="Belum ada kafe" description="Mulai dengan membuat tempat kerja pertama." />
	{:else}
		<div class="overflow-x-auto rounded-xl border border-hairline">
			<Table.Root>
				<Table.Header class="bg-surface-container-low">
					<Table.Row class="hover:bg-transparent">
						<Table.Head>Nama</Table.Head>
						<Table.Head>Skor</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Kesesuaian</Table.Head>
						<Table.Head class="text-right">Aksi</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.cafes as cafe (cafe.id)}
						<Table.Row class="border-hairline">
							<Table.Cell class="py-3.5 font-medium text-ink">{cafe.name}</Table.Cell>
							<Table.Cell class="py-3.5 text-on-surface-variant">{cafe.score}</Table.Cell>
							<Table.Cell class="py-3.5">
								<Badge variant="soft" intent={cafe.published ? "success" : "clean"}>
									{cafe.published ? "Tampil" : "Draft"}
								</Badge>
							</Table.Cell>
							<Table.Cell class="max-w-sm py-3.5 text-sm text-on-surface-variant"
								>{cafe.fit}</Table.Cell
							>
							<Table.Cell class="py-3.5">
								<div class="flex justify-end gap-1.5">
									{#if cafe.published}
										<Button href="/wfc/cafe/{cafe.slug}" variant="ghost" size="sm">Lihat</Button>
									{/if}
									<Button href="/admin/cafes/{cafe.id}/edit" variant="ghost" size="sm">Ubah</Button>
									<Button
										variant="ghost"
										size="sm"
										class="text-danger hover:bg-danger/10 hover:text-danger"
										onclick={() => (pendingDelete = cafe)}
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

<Dialog.Root
	open={deleteOpen}
	onOpenChange={(open) => {
		if (!open) pendingDelete = null;
	}}
>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Hapus kafe?</Dialog.Title>
			<Dialog.Description>
				Menghapus <strong>{pendingDelete?.name}</strong> akan menghilangkannya dari daftar WFC. Tindakan
				ini tidak dapat dibatalkan.
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
				<Button type="submit" variant="destructive">Hapus Kafe</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
