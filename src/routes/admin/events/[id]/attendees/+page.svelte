<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import { enhance } from "$app/forms";
	import * as Table from "$lib/components/ui/table";
	import { EmptyState } from "$lib/components/ui/empty-state";
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/primitives";
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import DownloadIcon from "@lucide/svelte/icons/download";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();

	type RegStatus = "confirmed" | "attended" | "no_show" | "cancelled";

	let showCancelled = $state(false);
	const rows = $derived(
		showCancelled ? data.registrations : data.registrations.filter((r) => r.status !== "cancelled")
	);

	const statusLabel: Record<RegStatus, string> = {
		confirmed: "Terkonfirmasi",
		attended: "Hadir",
		no_show: "Tidak Hadir",
		cancelled: "Dibatalkan"
	};
	const statusIntent: Record<RegStatus, "primary" | "success" | "warning" | "clean"> = {
		confirmed: "primary",
		attended: "success",
		no_show: "warning",
		cancelled: "clean"
	};

	const dateFmt = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });

	// The two check-in states a non-cancelled row is NOT currently in.
	const CHECKIN: RegStatus[] = ["confirmed", "attended", "no_show"];
	function otherStatuses(current: RegStatus): RegStatus[] {
		return CHECKIN.filter((s) => s !== current);
	}
</script>

<svelte:head>
	<title>Peserta — {data.event.title} — Admin PKUBersua</title>
</svelte:head>

<section class="flex flex-col gap-6">
	<header class="flex flex-wrap items-start justify-between gap-3">
		<div>
			<a href="/admin/events" class="link-quiet text-label-md inline-flex items-center gap-1">
				<ArrowLeftIcon class="size-3.5" /> Kembali ke daftar event
			</a>
			<h1 class="font-display text-headline-md text-ink mt-1">Peserta</h1>
			<p class="text-on-surface-variant mt-1 text-sm">{data.event.title}</p>
		</div>
		<Button href="/admin/events/{data.event.id}/attendees/export" variant="ghost">
			<DownloadIcon class="size-4" />
			Download CSV
		</Button>
	</header>

	<div class="flex flex-wrap gap-2">
		<Badge variant="soft" intent="clean">Total: {data.counts.total}</Badge>
		<Badge variant="soft" intent="primary">Terkonfirmasi: {data.counts.confirmed}</Badge>
		<Badge variant="soft" intent="success">Hadir: {data.counts.attended}</Badge>
		<Badge variant="soft" intent="warning">Tidak Hadir: {data.counts.no_show}</Badge>
		<Badge variant="soft" intent="clean">Dibatalkan: {data.counts.cancelled}</Badge>
	</div>

	{#if data.counts.total === 0}
		<EmptyState
			title="Belum ada pendaftar"
			description="Pendaftaran peserta untuk event ini akan tampil di sini."
		/>
	{:else}
		{#if data.counts.cancelled > 0}
			<div>
				<Button variant="ghost" size="sm" onclick={() => (showCancelled = !showCancelled)}>
					{showCancelled ? "Sembunyikan" : "Tampilkan"} yang dibatalkan ({data.counts.cancelled})
				</Button>
			</div>
		{/if}

		<div class="overflow-x-auto rounded-xl border border-hairline">
			<Table.Root>
				<Table.Header class="bg-surface-container-low">
					<Table.Row class="hover:bg-transparent">
						<Table.Head class="text-label-md font-semibold text-on-surface-variant uppercase"
							>Nama</Table.Head
						>
						<Table.Head class="text-label-md font-semibold text-on-surface-variant uppercase"
							>No. HP</Table.Head
						>
						<Table.Head class="text-label-md font-semibold text-on-surface-variant uppercase"
							>Status</Table.Head
						>
						<Table.Head class="text-label-md font-semibold text-on-surface-variant uppercase"
							>No. Registrasi</Table.Head
						>
						<Table.Head class="text-label-md font-semibold text-on-surface-variant uppercase"
							>Tanggal</Table.Head
						>
						<Table.Head
							class="text-label-md font-semibold text-on-surface-variant uppercase text-right"
							>Check-in</Table.Head
						>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each rows as reg (reg.id)}
						<Table.Row
							class={reg.status === "cancelled" ? "border-hairline opacity-60" : "border-hairline"}
						>
							<Table.Cell class="py-3.5 font-medium text-ink">{reg.attendeeName}</Table.Cell>
							<Table.Cell class="py-3.5 whitespace-nowrap text-on-surface-variant"
								>{reg.attendeePhone}</Table.Cell
							>
							<Table.Cell class="py-3.5">
								<Badge variant="soft" intent={statusIntent[reg.status]}>
									{statusLabel[reg.status]}
								</Badge>
							</Table.Cell>
							<Table.Cell
								class="py-3.5 font-mono text-xs whitespace-nowrap text-on-surface-variant"
							>
								{reg.registrationNumber}
							</Table.Cell>
							<Table.Cell class="py-3.5 whitespace-nowrap text-on-surface-variant">
								{dateFmt.format(new Date(reg.createdAt))}
							</Table.Cell>
							<Table.Cell class="py-3.5">
								<div class="flex justify-end gap-1.5">
									{#if reg.status === "cancelled"}
										<span class="text-on-surface-variant text-xs">—</span>
									{:else}
										{#each otherStatuses(reg.status) as target (target)}
											<form
												method="POST"
												action="?/setStatus"
												use:enhance={() =>
													async ({ update }) => {
														await update();
														await invalidateAll();
													}}
											>
												<Input type="hidden" name="id" value={reg.id} />
												<Input type="hidden" name="status" value={target} />
												<Button type="submit" variant="outline" size="sm">
													Tandai {statusLabel[target]}
												</Button>
											</form>
										{/each}
									{/if}
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</section>
