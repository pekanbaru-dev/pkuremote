<script lang="ts">
	import { page } from "$app/state";
	import { NAV_ITEMS, isNavItemActive } from "../nav";

	// `onNavigate` lets the mobile sheet close itself when an item is selected.
	let { onNavigate }: { onNavigate?: () => void } = $props();
</script>

<nav class="flex flex-col gap-1" aria-label="Navigasi admin">
	{#each NAV_ITEMS as item (item.href)}
		{@const Icon = item.icon}
		{@const active = isNavItemActive(page.url.pathname, item.href)}
		<a
			href={item.href}
			aria-current={active ? "page" : undefined}
			onclick={onNavigate}
			class={[
				"text-label-lg flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
				active
					? "bg-primary-container text-on-primary-container font-semibold"
					: "text-on-surface-variant hover:bg-muted"
			]}
		>
			<Icon class="size-5" aria-hidden="true" />
			{item.label}
		</a>
	{/each}
</nav>
