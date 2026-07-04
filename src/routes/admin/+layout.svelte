<script lang="ts">
	import { AdminShell } from "$lib/features/admin";
	import type { LayoutServerData } from "./$types";

	let { data, children }: { data: LayoutServerData; children: import("svelte").Snippet } = $props();
</script>

<AdminShell user={data.user}>
	{@render children()}
</AdminShell>
