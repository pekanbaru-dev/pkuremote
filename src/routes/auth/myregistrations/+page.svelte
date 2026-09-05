<script lang="ts">
	import type { PageData } from "./$types.js";

	let { data }: { data: PageData } = $props();
	const registrations = $derived(data.registrations);

	type RegStatus = "confirmed" | "cancelled" | "attended" | "no_show";
	type EventStatus = "Akan Datang" | "Selesai";

	function formatRegDate(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleDateString("id-ID", {
			day: "numeric",
			month: "short",
			year: "numeric"
		});
	}

	function eventStatusLabel(eventStart: string): EventStatus {
		const now = Date.now();
		const start = new Date(eventStart).getTime();
		if (now < start) return "Akan Datang";
		return "Selesai";
	}

	function registrationStatusLabel(status: RegStatus): string {
		switch (status) {
			case "confirmed":
				return "Dikonfirmasi";
			case "cancelled":
				return "Dibatalkan";
			case "attended":
				return "Hadir";
			case "no_show":
				return "Tidak Hadir";
		}
	}

	const EVENT_STATUS_CLASSES: Record<EventStatus, string> = {
		"Akan Datang": "bg-primary text-white",
		Selesai: "bg-slate-500 text-white"
	};

	const REG_STATUS_CLASSES: Record<RegStatus, string> = {
		confirmed: "bg-green-600 text-white",
		cancelled: "bg-red-500 text-white",
		attended: "bg-green-600 text-white",
		no_show: "bg-slate-500 text-white"
	};
</script>

<svelte:head>
	<title>Registrasi Saya — PKUBersua</title>
	<meta name="description" content="Daftar event yang telah Anda booking di PKUBersua." />
</svelte:head>

<div class="w-full container-page pt-[clamp(1.25rem,3vw,2rem)] pb-[clamp(3rem,7vw,5rem)]">
	<!-- Header -->
	<div class="flex items-center justify-between mb-6">
		<div class="flex flex-col gap-1">
			<h1
				class="font-title-lg tablet:font-headline-md text-title-lg tablet:text-headline-md text-primary"
			>
				Registrasi Saya
			</h1>
			<p class="text-sm text-on-surface-variant">Daftar event yang telah kamu booking.</p>
		</div>
		<a
			href="/events"
			class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-label-md font-label font-semibold text-on-primary transition-colors hover:bg-primary/90"
		>
			Lihat Semua Event
		</a>
	</div>

	{#if registrations.length === 0}
		<div class="rounded-xl border border-hairline bg-surface-container-lowest p-12 text-center">
			<p class="text-body-md text-muted-foreground mb-4">Kamu belum memiliki registrasi event.</p>
			<a
				href="/events"
				class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-label-md font-label font-semibold text-on-primary transition-colors hover:bg-primary/90"
			>
				Lihat semua event
			</a>
		</div>
	{:else}
		<div
			class="grid gap-5 mobile:grid-cols-2 desktop:grid-cols-3"
			data-testid="myregistrations-list"
		>
			{#each registrations as reg (reg.id)}
				<div
					class="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface-container-lowest transition-all hover:-translate-y-1 hover:shadow-sm"
				>
					<!-- Banner -->
					<a href="/events/{reg.event.slug}" aria-label={reg.event.title} class="block">
						<div class="h-44 overflow-hidden bg-surface-container">
							{#if reg.event.bannerUrl}
								<img
									src={reg.event.bannerUrl}
									alt=""
									loading="eager"
									decoding="async"
									width="1200"
									height="630"
									class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
								/>
							{:else}
								<div class="w-full h-full bg-surface-container flex items-center justify-center">
									<span
										class="font-label text-[0.75rem] uppercase tracking-wide text-muted-foreground"
										>Event</span
									>
								</div>
							{/if}
						</div>
					</a>

					<!-- Content -->
					<div class="flex flex-1 flex-col gap-2 p-4">
						<div class="flex items-start justify-between gap-2">
							<a
								href="/events/{reg.event.slug}"
								class="font-display text-headline-sm font-semibold leading-tight text-ink line-clamp-3 hover:text-primary flex-1"
							>
								{reg.event.title}
							</a>
							<div class="flex flex-col gap-1 items-end shrink-0">
								<span
									class="inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-semibold leading-none {EVENT_STATUS_CLASSES[
										eventStatusLabel(reg.event.startsAt)
									]}"
								>
									{eventStatusLabel(reg.event.startsAt)}
								</span>
								<span
									class="inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-semibold leading-none {REG_STATUS_CLASSES[
										reg.status
									]}"
								>
									{registrationStatusLabel(reg.status)}
								</span>
							</div>
						</div>
						<p class="text-on-surface-variant text-body-sm line-clamp-2">
							{formatRegDate(reg.event.startsAt)} · {reg.event.location}
						</p>
						<p class="text-label-sm text-muted-foreground font-label">
							No. <span class="font-bold text-ink">{reg.registrationNumber}</span>
						</p>
					</div>

					<!-- Footer -->
					<div
						class="flex items-center justify-end px-4 pb-4 pt-2 border-t border-hairline mt-auto"
					>
						<a
							href="/events/{reg.event.slug}/ticket/{reg.registrationNumber}"
							class="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary transition-colors hover:bg-primary/90"
						>
							Lihat tiket
						</a>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
