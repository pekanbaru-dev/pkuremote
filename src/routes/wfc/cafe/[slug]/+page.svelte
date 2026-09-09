<script lang="ts">
	import { WfcCafeDetail } from "$lib/features/wfc";
	import type { PageData } from "./$types.js";

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.cafe.name} — PKU Bersua WFC</title>
	<meta
		name="description"
		content={`${data.cafe.tagline}. Temukan detail tempat kerja dari PKU Bersua WFC.`}
	/>
</svelte:head>

<WfcCafeDetail cafe={data.cafe} />
