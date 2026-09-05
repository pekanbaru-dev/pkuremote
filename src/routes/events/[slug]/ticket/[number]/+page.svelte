<script lang="ts">
	import type { PageData } from "./$types.js";
	import { PUBLIC_SITE_URL } from "$env/static/public";

	let { data }: { data: PageData } = $props();
	const { registration, event, qrSvg } = $derived(data);

	const isCancelled = $derived(registration.status === "cancelled");

	const canonical = $derived(
		`${PUBLIC_SITE_URL}/events/${event.slug}/ticket/${registration.registrationNumber}`
	);

	function formatDateLong(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleString("id-ID", {
			weekday: "long",
			day: "numeric",
			month: "long",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		});
	}
</script>

<svelte:head>
	<title>Tiket {registration.registrationNumber} — PKUBersua</title>
	<meta name="description" content={`Tiket untuk event ${event.title}`} />
	<link rel="canonical" href={canonical} />
	<meta property="og:title" content={`Tiket — ${event.title}`} />
	<meta property="og:description" content={event.excerpt} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={canonical} />
	{#if event.bannerUrl}
		<meta property="og:image" content={event.bannerUrl} />
	{/if}
	<meta property="og:site_name" content="PKUBersua" />
</svelte:head>

<header class="sticky top-0 z-10 border-b border-hairline bg-canvas/90 backdrop-blur">
	<div class="container-page flex items-center justify-between py-4">
		<a
			href="/"
			class="font-display text-lg font-bold tracking-tight text-ink"
			aria-label="PKUBersua — beranda"
		>
			PKUBersua
		</a>
		<a class="link-quiet text-label-lg text-on-surface-variant" href="/auth/myregistrations"
			>← Registrasi Saya</a
		>
	</div>
</header>

<main class="container-page py-[clamp(3rem,7vw,5rem)]">
	<article class="mx-auto max-w-2xl flex flex-col gap-8">
		<header class="flex flex-col gap-2 text-center">
			<p class="label-meta text-primary uppercase tracking-wider">Tiket Event</p>
			<h1
				class="font-headline-md tablet:font-headline-lg text-headline-md tablet:text-headline-lg text-ink"
			>
				{event.title}
			</h1>
		</header>

		{#if event.bannerUrl}
			<img
				src={event.bannerUrl}
				alt=""
				class="h-48 w-full rounded-xl object-cover"
				loading="eager"
			/>
		{/if}

		<section
			class="rounded-xl border border-hairline bg-surface-container-lowest p-lg flex flex-col gap-4"
			aria-label="Detail tiket"
		>
			<div>
				<p class="label-meta text-on-surface-variant">Nama Peserta</p>
				<p class="font-headline-md text-headline-md text-ink">{registration.attendeeName}</p>
			</div>
			<div>
				<p class="label-meta text-on-surface-variant">No. HP</p>
				<p class="font-label-lg text-label-lg text-ink">{registration.attendeePhone}</p>
			</div>
			<div>
				<p class="label-meta text-on-surface-variant">Tanggal & Waktu</p>
				<p class="font-label-lg text-label-lg text-ink">{formatDateLong(event.startsAt)} WIB</p>
			</div>
			<div>
				<p class="label-meta text-on-surface-variant">Lokasi</p>
				<p class="font-label-lg text-label-lg text-ink">{event.location}</p>
			</div>
			<div>
				<p class="label-meta text-on-surface-variant">Nomor Registrasi</p>
				<p
					class="font-label-lg text-label-lg font-bold text-primary tracking-wider"
					data-testid="registration-number"
				>
					{registration.registrationNumber}
				</p>
			</div>
		</section>

		{#if isCancelled}
			<section
				class="rounded-xl border border-error bg-error-container/10 p-lg text-center"
				role="alert"
				data-testid="cancelled-notice"
			>
				<p class="font-headline-md text-headline-md text-error">Registrasi ini telah dibatalkan</p>
				<p class="text-on-surface-variant mt-2">
					Tiket ini sudah tidak berlaku. Hubungi kami untuk informasi lebih lanjut.
				</p>
			</section>
		{:else}
			<section
				class="rounded-xl border border-hairline bg-canvas p-lg flex flex-col items-center gap-3"
			>
				<p class="label-meta text-on-surface-variant uppercase tracking-wider">QR Code Check-in</p>
				<div data-testid="ticket-qr" aria-label="QR code tiket">
					{#if qrSvg}
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html qrSvg}
					{/if}
				</div>
				<p class="text-[0.8125rem] text-on-surface-variant text-center">
					Tunjukkan QR ini di pintu masuk event untuk proses check-in.
				</p>
			</section>
		{/if}
	</article>
</main>

<footer class="container-page py-12">
	<p class="label-meta">© 2026 PKUBersua</p>
</footer>
