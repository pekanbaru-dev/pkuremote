<script lang="ts" module>
	import type { Event } from "../types.ts";
	import { cn } from "$lib/utils.js";

	export type EventBookingCtaMode = "desktop" | "mobile" | "both";

	export type EventBookingCtaProps = {
		event: Event;
		mode?: EventBookingCtaMode;
		class?: string;
	};

	function buildMailto(event: Event): string {
		const subject = encodeURIComponent(`Booking: ${event.title}`);
		const body = encodeURIComponent(
			`Halo, saya ingin mendaftar untuk event ${event.title} (${event.startsAt} di ${event.location}).\n\nNama:\nNo. HP:\n`
		);
		return `mailto:hello@pkubersua.com?subject=${subject}&body=${body}`;
	}
</script>

<script lang="ts">
	let { event, mode = "both", class: className }: EventBookingCtaProps = $props();

	const isSoldOut = $derived(event.remainingSlots === 0);
	const showDesktop = $derived(mode === "desktop" || mode === "both");
	const showMobile = $derived(mode === "mobile" || mode === "both");
	const mailtoHref = $derived(buildMailto(event));
</script>

{#if showDesktop}
	<div class={cn("hidden table:block flex flex-col gap-2", className)}>
		<a
			href={isSoldOut ? undefined : mailtoHref}
			aria-disabled={isSoldOut}
			class={cn(
				"inline-flex h-11 items-center justify-center rounded-md border border-transparent bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors duration-200",
				isSoldOut
					? "pointer-events-none cursor-not-allowed opacity-50"
					: "hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
			)}
		>
			{isSoldOut ? "Kuota penuh" : "Booking Sekarang"}
		</a>
		<p class="label-meta text-center">
			{isSoldOut
				? "Pendaftaran ditutup karena kuota habis."
				: "Kamu akan diarahkan ke email untuk konfirmasi."}
		</p>
	</div>
{/if}

{#if showMobile}
	<a
		href={isSoldOut ? undefined : mailtoHref}
		aria-disabled={isSoldOut}
		aria-label={isSoldOut ? "Kuota penuh" : "Booking Sekarang"}
		class={cn(
			"fixed right-4 bottom-4 z-50 desktop:hidden inline-flex h-14 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg transition-transform duration-200",
			isSoldOut
				? "pointer-events-none cursor-not-allowed opacity-50"
				: "hover:scale-105 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
			className
		)}
	>
		{isSoldOut ? "Penuh" : "Booking"}
	</a>
{/if}
