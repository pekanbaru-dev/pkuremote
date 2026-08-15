<script lang="ts">
	const articles = [
		"5 Cara Memaksimalkan Networking di Event",
		"Manfaat Bergabung di Komunitas Lokal",
		"Recap: UI/UX Workshop Juli 2026",
		"Bangun Kebiasaan Positif Lewat Komunitas"
	];
</script>

<section id="articles" class="pt-11">
	<div class="mb-5 flex items-end justify-between">
		<div>
			<h2 class="text-lg font-black tracking-[-0.035em] text-ink sm:text-xl">
				Artikel & Blog Terbaru
			</h2>
			<p class="mt-0.5 text-sm leading-6 text-[#66747a]">
				Insight dan cerita dari komunitas Pekanbaru.
			</p>
		</div>
		<a
			class="inline-flex min-h-11 items-center rounded-lg px-1 text-sm font-bold text-[#0a5350] underline decoration-[#f7b91d] decoration-2 underline-offset-4 transition hover:text-[#073d3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7b91d] focus-visible:ring-offset-4"
			href="#articles"
		>
			Lihat semua artikel
		</a>
	</div>
	<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
		{#each articles as article (article)}
			<article class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
				<div class="h-40 bg-linear-to-br from-[#2e3230] to-[#315c53]"></div>
				<div class="flex min-h-34.5 flex-col p-4">
					<div class="flex items-center justify-between gap-3">
						<span
							class="rounded-md bg-violet-100 px-2 py-1 text-[10px] font-semibold text-violet-700"
							>Komunitas</span
						>
						<span class="text-xs leading-5 text-[#66747a]">12 Agu 2026</span>
					</div>
					<h3 class="mt-3 text-[15px] font-black leading-5">{article}</h3>
					<div class="mt-auto flex items-center gap-2 text-xs leading-5 text-[#66747a]">
						<span
							class="grid h-6 w-6 place-items-center rounded-full bg-violet-700 text-[8px] font-black text-white"
							aria-hidden="true">PK</span
						>
						<span>PKUBersua · 5 min read</span>
					</div>
				</div>
			</article>
		{/each}
	</div>
</section>
