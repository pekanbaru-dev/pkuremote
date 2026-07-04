<script lang="ts">
	import { Card, CardContent } from "$lib/components/ui/card";
	import CalendarDaysIcon from "@lucide/svelte/icons/calendar-days";
	import CalendarClockIcon from "@lucide/svelte/icons/calendar-clock";
	import UsersIcon from "@lucide/svelte/icons/users";
	import GaugeIcon from "@lucide/svelte/icons/gauge";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
	const m = $derived(data.metrics);

	const dateFmt = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });
	const dayFmt = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });

	const tiles = $derived([
		{ label: "Total Event", value: String(m.totalEvents), icon: CalendarDaysIcon },
		{ label: "Akan Datang", value: String(m.upcomingEvents), icon: CalendarClockIcon },
		{ label: "Pendaftaran Aktif", value: String(m.activeRegistrations), icon: UsersIcon },
		{
			label: "Tingkat Keterisian",
			value: m.capacityFill === null ? "—" : `${m.capacityFill}%`,
			icon: GaugeIcon
		}
	]);
</script>

<svelte:head>
	<title>Dashboard — Admin PKUBersua</title>
</svelte:head>

<section class="flex flex-col gap-6">
	<header>
		<h1 class="font-display text-headline-md text-ink">Dashboard</h1>
		<p class="text-on-surface-variant mt-1 text-sm">Ringkasan aktivitas komunitas.</p>
	</header>

	<div class="grid grid-cols-2 gap-4 desktop:grid-cols-4">
		{#each tiles as tile (tile.label)}
			{@const Icon = tile.icon}
			<Card>
				<CardContent class="flex flex-col gap-2">
					<div class="text-on-surface-variant flex items-center gap-2">
						<Icon class="size-4" />
						<span class="text-label-md">{tile.label}</span>
					</div>
					<span class="font-display text-headline-md text-ink">{tile.value}</span>
				</CardContent>
			</Card>
		{/each}
	</div>

	<div class="grid gap-4 tablet:grid-cols-2">
		<Card>
			<CardContent class="flex flex-col gap-3">
				<div class="flex items-center justify-between">
					<h2 class="text-label-lg font-medium text-ink">Pendaftaran Terbaru</h2>
					<a href="/admin/events" class="link-quiet text-label-md">Kelola event</a>
				</div>
				{#if m.recentRegistrations.length === 0}
					<p class="text-on-surface-variant text-sm">Belum ada pendaftaran.</p>
				{:else}
					<ul class="flex flex-col divide-y divide-hairline">
						{#each m.recentRegistrations as reg (reg.id)}
							<li class="flex items-center justify-between gap-3 py-2">
								<div class="min-w-0">
									<p class="truncate font-medium text-ink">{reg.attendeeName}</p>
									<a
										href="/admin/events/{reg.eventId}/edit"
										class="link-quiet block truncate text-sm text-on-surface-variant"
									>
										{reg.eventTitle}
									</a>
								</div>
								<span class="text-on-surface-variant shrink-0 text-xs whitespace-nowrap">
									{dateFmt.format(new Date(reg.createdAt))}
								</span>
							</li>
						{/each}
					</ul>
				{/if}
			</CardContent>
		</Card>

		<Card>
			<CardContent class="flex flex-col gap-3">
				<div class="flex items-center justify-between">
					<h2 class="text-label-lg font-medium text-ink">Event Akan Datang</h2>
					<a href="/admin/events/new" class="link-quiet text-label-md">Event baru</a>
				</div>
				{#if m.upcomingList.length === 0}
					<p class="text-on-surface-variant text-sm">Belum ada event akan datang.</p>
				{:else}
					<ul class="flex flex-col divide-y divide-hairline">
						{#each m.upcomingList as event (event.id)}
							<li class="flex items-center justify-between gap-3 py-2">
								<a
									href="/admin/events/{event.id}/edit"
									class="link-quiet min-w-0 truncate font-medium text-ink"
								>
									{event.title}
								</a>
								<span class="text-on-surface-variant shrink-0 text-xs whitespace-nowrap">
									{dayFmt.format(new Date(event.startsAt))}
								</span>
							</li>
						{/each}
					</ul>
				{/if}
			</CardContent>
		</Card>
	</div>
</section>
