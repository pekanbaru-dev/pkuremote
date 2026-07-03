<script lang="ts" module>
	import type { Event } from "../types.ts";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { cn } from "$lib/utils.js";

	export type EventBookingCtaMode = "desktop" | "mobile" | "both";

	export type EventBookingCtaProps = {
		event: Event;
		authenticated: boolean;
		bookingError?: string | null;
		formState?: { attendeeName?: string; attendeePhone?: string } | null;
		mode?: EventBookingCtaMode;
		class?: string;
	};
</script>

<script lang="ts">
	let {
		event,
		authenticated,
		bookingError = null,
		formState = null,
		mode = "both",
		class: className
	}: EventBookingCtaProps = $props();

	const isPast = $derived(event.status !== "upcoming");
	const isSoldOut = $derived(event.remainingSlots === 0);
	const isClosed = $derived(
		event.registrationClosesAt !== undefined &&
			new Date(event.registrationClosesAt).getTime() <= Date.now()
	);
	const isDisabled = $derived(isPast || isSoldOut || isClosed);

	const disabledLabel = $derived(
		isPast ? "Event telah berlalu" : isSoldOut ? "Kuota penuh" : "Pendaftaran ditutup"
	);

	const showDesktop = $derived(mode === "desktop" || mode === "both");
	const showMobile = $derived(mode === "mobile" || mode === "both");

	const loginHref = $derived(`/login?redirect=${encodeURIComponent(`/events/${event.slug}`)}`);
</script>

{#if showDesktop}
	<div class={cn("hidden tablet:flex tablet:flex-col tablet:gap-3", className)}>
		{#if !authenticated}
			<Button href={loginHref} class="h-11 w-full">Login dulu untuk booking</Button>
		{:else if isDisabled}
			<Button disabled class="h-11 w-full">{disabledLabel}</Button>
		{:else}
			<form method="POST" action="?/book" class="flex flex-col gap-3">
				<label class="flex flex-col gap-1">
					<span class="label-meta text-on-surface-variant">Nama Peserta</span>
					<Input
						name="attendeeName"
						autocomplete="name"
						value={formState?.attendeeName ?? ""}
						placeholder="Nama yang akan tampil di tiket"
					/>
				</label>
				<label class="flex flex-col gap-1">
					<span class="label-meta text-on-surface-variant">No. HP</span>
					<Input
						name="attendeePhone"
						type="tel"
						autocomplete="tel"
						value={formState?.attendeePhone ?? ""}
						placeholder="cth. 081234567890"
					/>
				</label>
				<Button type="submit" class="h-11 w-full">Booking Sekarang</Button>
			</form>
		{/if}
		{#if bookingError}
			<p class="label-meta text-center text-error" role="alert">
				{bookingError}
			</p>
		{/if}
	</div>
{/if}

{#if showMobile}
	<div class="fixed right-4 bottom-4 z-50 desktop:hidden {className ?? ''}">
		{#if !authenticated}
			<Button href={loginHref} aria-label="Login dulu untuk booking" class="h-14 rounded-full">
				Login
			</Button>
		{:else if isDisabled}
			<Button disabled aria-label={disabledLabel} class="h-14 rounded-full">
				{isSoldOut ? "Penuh" : isPast ? "Selesai" : "Ditutup"}
			</Button>
		{:else}
			<form method="POST" action="?/book" class="contents">
				<Input type="hidden" name="attendeeName" value={formState?.attendeeName ?? ""} />
				<Input type="hidden" name="attendeePhone" value={formState?.attendeePhone ?? ""} />
				<Button type="submit" aria-label="Booking Sekarang" class="h-14 rounded-full">
					Booking
				</Button>
			</form>
		{/if}
	</div>
{/if}
