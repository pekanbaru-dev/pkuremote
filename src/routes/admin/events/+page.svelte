<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import { enhance } from "$app/forms";
	import * as Table from "$lib/components/ui/table";
	import * as Dialog from "$lib/components/ui/dialog";
	import { EmptyState } from "$lib/components/ui/empty-state";
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/primitives";
	import type { Event } from "$lib/features/events";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();

	let pendingDelete = $state<Event | null>(null);
	const deleteOpen = $derived(pendingDelete !== null);

	const dateFmt = new Intl.DateTimeFormat("id-ID", {
		dateStyle: "medium",
		timeStyle: "short"
	});
	function formatDate(iso: string): string {
		return dateFmt.format(new Date(iso));
	}

	const statusLabel: Record<Event["status"], string> = {
		upcoming: "Akan datang",
		live: "Berlangsung",
		past: "Selesai"
	};
	const statusIntent: Record<Event["status"], "primary" | "success" | "clean"> = {
		upcoming: "primary",
		live: "success",
		past: "clean"
	};

	function quotaLabel(event: Event): string {
		if (event.quota == null) return "Tanpa batas";
		return `${event.remainingSlots ?? event.quota} / ${event.quota}`;
	}
</script>

<svelte:head>
	<title>Kelola Event — Admin PKUBersua</title>
</svelte:head>

<section class="flex flex-col gap-6">
	<header class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h1 class="font-display text-headline-md text-ink">Kelola Event</h1>
			<p class="text-on-surface-variant mt-1 text-sm">Buat, ubah, dan hapus event.</p>
		</div>
		<Button href="/admin/events/new">
			<PlusIcon class="size-4" />
			Event Baru
		</Button>
	</header>

	{#if data.events.length === 0}
		<EmptyState title="Belum ada event" description="Mulai dengan membuat event pertama Anda.">
			<Button href="/admin/events/new" class="mt-2">
				<PlusIcon class="size-4" />
				Event Baru
			</Button>
		</EmptyState>
	{:else}
		<div class="overflow-x-auto rounded-xl border border-hairline">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Judul</Table.Head>
						<Table.Head>Tanggal</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Kuota</Table.Head>
						<Table.Head>Kategori</Table.Head>
						<Table.Head class="text-right">Aksi</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.events as event (event.id)}
						<Table.Row>
							<Table.Cell class="font-medium text-ink">{event.title}</Table.Cell>
							<Table.Cell class="whitespace-nowrap">{formatDate(event.startsAt)}</Table.Cell>
							<Table.Cell>
								<Badge intent={statusIntent[event.status]}>{statusLabel[event.status]}</Badge>
							</Table.Cell>
							<Table.Cell class="whitespace-nowrap">{quotaLabel(event)}</Table.Cell>
							<Table.Cell>
								<span class="text-on-surface-variant text-sm">
									{event.categories.map((c) => c.name).join(", ") || "—"}
								</span>
							</Table.Cell>
							<Table.Cell>
								<div class="flex justify-end gap-2">
									<Button href="/admin/events/{event.id}/edit" variant="ghost" size="sm"
										>Ubah</Button
									>
									<Button
										variant="ghost"
										size="sm"
										class="text-error"
										onclick={() => (pendingDelete = event)}
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
			<Dialog.Title>Hapus event?</Dialog.Title>
			<Dialog.Description>
				Menghapus <strong>{pendingDelete?.title}</strong> juga akan menghapus semua data pendaftaran peserta
				untuk event ini. Tindakan ini tidak dapat dibatalkan.
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
				<Button type="submit" variant="destructive">Hapus Event</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
