<script lang="ts" module>
	export type PartnersCatProps = {
		showToast: (message: string) => void;
	};
</script>

<script lang="ts">
	let { showToast }: PartnersCatProps = $props();
</script>

<div
	id="partners"
	class="relative my-11 overflow-hidden rounded-[28px] border border-[#32267a] bg-linear-to-r from-[#142a61] to-[#4c188b] px-5 py-7 text-white sm:px-8 sm:py-9"
>
	<div
		class="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#f7b91d]/10 blur-2xl"
	></div>
	<img
		src="/images/hero/rebung.svg"
		alt=""
		aria-hidden="true"
		class="pointer-events-none absolute -right-8 top-[42%] h-77.5 w-77.5 -translate-y-1/2 -rotate-12 object-contain opacity-[0.12]"
	/>
	<div class="relative z-10 grid items-start gap-6 lg:grid-cols-[1fr_auto]">
		<div class="max-w-3xl">
			<p class="text-[10px] font-extrabold tracking-[0.18em] text-[#ffd66f]">
				PARTNERSHIP ECOSYSTEM
			</p>
			<h2 class="mt-2 text-2xl font-black tracking-[-0.035em] sm:text-[30px]">
				Tumbuh bersama partner yang
				<span class="text-[#ffd66f]">percaya pada Pekanbaru.</span>
			</h2>
			<p class="mt-2 max-w-2xl text-sm leading-6 text-white/70">
				Kami membuka kolaborasi untuk brand, komunitas, dan institusi yang ingin menciptakan dampak
				nyata melalui event lokal.
			</p>
		</div>
		<a
			href="#partners"
			class="inline-flex items-center text-sm font-semibold text-[#ffd66f] underline decoration-2 underline-offset-4 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd66f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#32267a]"
			onclick={() => showToast("Kami akan menghubungi kamu")}
		>
			Ingin Jadi Partner?
		</a>
	</div>
	<div class="relative z-10 mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
		{#each ["IDCLOUDHOST", "gojek", "BCA", "OVO", "ruangguru", "wondr"] as partner (partner)}
			<div
				class="grid min-h-14.5 place-items-center rounded-xl border border-white/15 bg-white/95 px-3 text-sm font-bold text-[#24383c] transition hover:-translate-y-0.5 hover:bg-white motion-reduce:transform-none"
			>
				{partner}
			</div>
		{/each}
	</div>
</div>
