<script lang="ts">
	import { onMount } from "svelte";

	/**
	 * Site-wide footer. Lives in `src/lib/components/` alongside
	 * `site-header.svelte` — both are domain-agnostic, shared across routes.
	 */
	const EMAIL_CODES = [
		99, 111, 110, 116, 97, 99, 116, 64, 112, 107, 117, 98, 101, 114, 115, 117, 97, 46, 99, 111, 109
	];
	const EMAIL_PLACEHOLDER = "[email protected]";

	function decodeEmail(): string {
		return String.fromCharCode(...EMAIL_CODES);
	}

	let email = $state(EMAIL_PLACEHOLDER);

	onMount(() => {
		email = decodeEmail();
	});
</script>

<footer class="bg-[#032f2f] pb-5 pt-9 text-white">
	<div
		class="mx-auto grid w-full max-w-[1180px] gap-8 px-3 sm:grid-cols-2 lg:grid-cols-[1.55fr_repeat(4,1fr)] lg:px-4"
	>
		<div class="sm:col-span-2 lg:col-span-1">
			<a href="#home" class="font-extrabold">PKUBersua</a>
			<p class="mt-4 w-full max-w-none text-xs leading-5 text-white/65">
				Platform komunitas dan event terbaik di Pekanbaru untuk bertemu, belajar, dan bertumbuh
				bersama.
			</p>
			<a
				href={email === EMAIL_PLACEHOLDER ? "#" : `mailto:${email}`}
				onclick={(event) => {
					if (email === EMAIL_PLACEHOLDER) event.preventDefault();
				}}
				class="mt-4 inline-flex text-xs font-semibold text-[#ffd66f] underline decoration-white/30 underline-offset-4 transition hover:text-white focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#f7b91d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#032f2f]"
			>
				{email}
			</a>
		</div>
		{#each [["Jelajahi", "Event · Community · Blog"], ["Untuk Organizer", "Buat Event · Kelola Event · Bantuan"], ["Perusahaan", "Tentang Kami · Mitra · Kontak"], ["Legal", "Syarat & Ketentuan · Privasi"]] as column (column[0])}
			<div>
				<h4 class="text-sm font-black">{column[0]}</h4>
				<p class="mt-3 text-xs leading-6 text-white/65">{column[1]}</p>
			</div>
		{/each}
	</div>
	<div
		class="mx-auto mt-7 flex w-full max-w-[1180px] flex-col justify-between gap-3 border-t border-white/10 px-3 pt-5 text-[11px] text-white/50 sm:flex-row sm:px-4"
	>
		© 2026 PKUBersua. All rights reserved.<span>Dibuat di Pekanbaru, untuk Indonesia. 🇮🇩 💛</span>
	</div>
</footer>
