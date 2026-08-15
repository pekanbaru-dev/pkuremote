<script lang="ts" module>
	export type CommunitiesSectionProps = {
		showToast: (message: string) => void;
	};
</script>

<script lang="ts">
	import CalendarDays from "@lucide/svelte/icons/calendar-days";
	import Users from "@lucide/svelte/icons/users";
	import Rocket from "@lucide/svelte/icons/rocket";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";

	let { showToast }: CommunitiesSectionProps = $props();

	const communities = [
		[
			"PKUBersua",
			"1.284 members",
			"Komunitas kolaboratif di Pekanbaru untuk berbagi dan bertumbuh.",
			"PK",
			"amber"
		],
		[
			"Pekanbaru Developer",
			"842 members",
			"Wadah bagi developer untuk belajar, berbagi, dan membuat impact bersama.",
			"PD",
			"violet"
		],
		[
			"Design Pekanbaru",
			"623 members",
			"Tempat berkumpulnya para designer untuk inspirasi dan kolaborasi.",
			"DP",
			"lime"
		],
		[
			"Pekanbaru Startup",
			"512 members",
			"Bangun startup, perluas jaringan, dan wujudkan ide bersama.",
			"SP",
			"orange"
		],
		[
			"Photography ID",
			"436 members",
			"Belajar fotografi, berbagi karya, dan hunting spot di sekitar Riau.",
			"PI",
			"pink"
		]
	] as const;
</script>

<section id="communities" class="pt-11">
	<div class="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
		<div class="max-w-144">
			<h2 class="text-lg font-black tracking-[-0.035em] text-ink sm:text-xl">Komunitas Populer</h2>
			<p class="mt-0.5 text-sm leading-6 text-[#66747a]">
				Temukan circle baru, bertukar ide, dan tumbuh bersama komunitas lokal.
			</p>
		</div>
		<a
			class="inline-flex min-h-11 items-center rounded-lg px-1 text-sm font-bold text-[#0a5350] underline decoration-[#f7b91d] decoration-2 underline-offset-4 transition hover:text-[#073d3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7b91d] focus-visible:ring-offset-4"
			href="#communities"
		>
			Lihat semua komunitas
		</a>
	</div>
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
		{#each communities as [name, , description, avatar] (name)}
			<article
				class="group flex min-h-70 flex-col items-center overflow-hidden rounded-xl border border-slate-200 bg-white p-5 text-center transition duration-200 hover:-translate-y-1 hover:border-[#0a5350]/25 hover:shadow-[0_14px_36px_rgba(7,61,61,0.10)] motion-reduce:transform-none motion-reduce:transition-none"
			>
				<span
					class="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#ffefc5] text-amber-500 transition-colors group-hover:bg-[#f7b91d] group-hover:text-[#073d3d]"
				>
					<span class="text-lg font-black tracking-tight">{avatar}</span>
				</span>
				<h3 class="mt-4 text-[15px] font-bold leading-5 text-ink">{name}</h3>
				<p class="mt-2 max-w-[18rem] text-xs leading-[1.7] text-[#66747a]">{description}</p>
				<Button
					type="button"
					class="mt-auto min-h-9 w-full rounded-xl bg-[#073d3d] px-4 py-2 text-[11px] font-bold text-white transition hover:bg-[#0a5350] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7b91d] focus-visible:ring-offset-2 active:translate-y-px"
					aria-label={`Bergabung dengan ${name}`}
					onclick={() => showToast(`Bergabung dengan ${name}`)}
				>
					Join Community
				</Button>
			</article>
		{/each}
	</div>
	<div
		class="mt-8 grid min-h-34.5 overflow-hidden rounded-2xl border border-[#edf0f4] bg-linear-to-r from-[#f9f8ff] via-white to-[#fffdf3] sm:grid-cols-2 lg:grid-cols-5"
	>
		<div class="p-5 lg:col-span-1 lg:p-6">
			<h3 class="font-black text-[#0a5350]">Kenapa PKUBersua?</h3>
			<p class="mt-1 text-xs leading-5 text-[#66747a]">
				Semua yang kamu butuhkan untuk bertumbuh, belajar, dan bertemu.
			</p>
		</div>
		<div class="min-h-34.5 border-t border-[#edf0f4] p-5 lg:border-l lg:p-6">
			<CalendarDays size={23} class="mb-2 text-amber-500" />
			<h3 class="text-[15px] font-black text-[#0a5350]">Temukan Event</h3>
			<p class="mt-1 text-xs leading-5 text-[#66747a]">Bertemu, belajar, dan berkembang bersama.</p>
		</div>
		<div class="min-h-34.5 border-t border-[#edf0f4] p-5 lg:border-l lg:p-6">
			<Users size={23} class="mb-2 text-amber-500" />
			<h3 class="text-[15px] font-black text-[#0a5350]">Bangun Relasi</h3>
			<p class="mt-1 text-xs leading-5 text-[#66747a]">Bertemu, belajar, dan berkembang bersama.</p>
		</div>
		<div class="min-h-34.5 border-t border-[#edf0f4] p-5 lg:border-l lg:p-6">
			<Users size={23} class="mb-2 text-amber-500" />
			<h3 class="text-[15px] font-black text-[#0a5350]">Ikut Komunitas</h3>
			<p class="mt-1 text-xs leading-5 text-[#66747a]">Bertemu, belajar, dan berkembang bersama.</p>
		</div>
		<div class="min-h-34.5 border-t border-[#edf0f4] p-5 lg:border-l lg:p-6">
			<Rocket size={23} class="mb-2 text-amber-500" />
			<h3 class="text-[15px] font-black text-[#0a5350]">Kembangkan Diri</h3>
			<p class="mt-1 text-xs leading-5 text-[#66747a]">Bertemu, belajar, dan berkembang bersama.</p>
		</div>
	</div>
	<div
		class="relative mt-8 grid gap-6 rounded-2xl border border-slate-100 bg-linear-to-r from-[#142a61] to-[#4c188b] p-6 text-white lg:grid-cols-[1.15fr_1fr] lg:items-center"
	>
		<img
			src="/images/hero/rebung.svg"
			alt=""
			aria-hidden="true"
			class="absolute -left-3 top-2 h-22.5 w-22.5 -rotate-12 object-contain opacity-15"
		/>
		<div class="relative lg:pl-24">
			<h3 class="text-lg font-black">Jangan lewatkan event seru lainnya!</h3>
			<p class="mt-1 text-xs leading-5 text-white/70">
				Dapatkan rekomendasi event dan update komunitas terbaik di Pekanbaru.
			</p>
		</div>
		<form
			class="relative flex flex-col gap-2 rounded-xl bg-white p-2 sm:flex-row"
			onsubmit={(event) => {
				event.preventDefault();
				showToast("Email kamu sudah terdaftar");
			}}
		>
			<Input
				required
				type="email"
				placeholder="Masukkan email kamu"
				class="min-h-11 min-w-0 flex-1 rounded-lg px-3 text-sm text-ink outline-none"
			/><Button
				type="submit"
				class="min-h-11 rounded-lg bg-[#f7b91d] px-6 text-xs font-semibold text-ink"
				>Berlangganan</Button
			>
		</form>
	</div>
</section>
