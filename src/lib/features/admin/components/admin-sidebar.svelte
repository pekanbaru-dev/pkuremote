<script lang="ts">
	import { page } from "$app/state";
	import { NAV_ITEMS, isNavItemActive } from "../nav";

	// `onNavigate` lets the mobile sheet close itself when an item is selected.
	// `collapsed` puts the desktop sidebar into icon-only mode (labels hidden,
	// tooltip shown on hover).
	let { onNavigate, collapsed = false }: { onNavigate?: () => void; collapsed?: boolean } =
		$props();
</script>

<nav class="flex flex-col gap-1" aria-label="Navigasi admin" class:items-center={collapsed}>
	{#if !collapsed}
		<p class="label-meta px-3 pb-1 pt-1 text-on-surface-variant">Menu</p>
	{/if}
	{#each NAV_ITEMS as item (item.href)}
		{@const Icon = item.icon}
		{@const active = isNavItemActive(page.url.pathname, item.href)}
		<a
			href={item.href}
			aria-current={active ? "page" : undefined}
			title={collapsed ? item.label : undefined}
			onclick={onNavigate}
			class={[
				"text-label-md flex items-center gap-2.5 rounded-md font-medium transition-colors",
				collapsed ? "justify-center px-2 py-2" : "px-3 py-2",
				active
					? "bg-primary-container/40 text-on-primary-container"
					: "text-on-surface-variant hover:bg-surface-container-high hover:text-ink"
			]}
		>
			<Icon class="size-4.5 shrink-0" aria-hidden="true" />
			{#if !collapsed}
				{item.label}
			{:else}
				<span class="sr-only">{item.label}</span>
			{/if}
		</a>
	{/each}
</nav>
