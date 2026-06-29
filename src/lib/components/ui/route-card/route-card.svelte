<script lang="ts" module>
	import { ChevronDown, ChevronUp, Clock, MapPin, Ship, Truck } from "@lucide/svelte";
	import { PanelCard } from "$lib/components/ui/panel-card";
	import { ActionsDropdown } from "$lib/components/ui/actions-dropdown";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type LocationType = "WAREHOUSE" | "PORT" | "DISTRIBUTION_CENTER" | "CUSTOM_LOCATION";
	export type TransportMode = "TRUCK" | "SHIP" | "PLANE" | "RAIL";

	export type RouteStop = {
		id: string;
		locationName: string;
		locationType: LocationType;
		address?: string;
		sequence: number;
	};

	export type Route = {
		name: string;
		description?: string;
		distance: number;
		estimatedDuration: number;
		isActive: boolean;
		transportMode: TransportMode;
	};

	export type RouteCardProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		route: Route;
		isExpanded?: boolean;
		onToggleExpand?: () => void;
		onEdit?: () => void;
		onDelete?: () => void;
	};

	function getTransportIcon(mode: TransportMode) {
		switch (mode) {
			case "SHIP":
				return Ship;
			default:
				return Truck;
		}
	}

	function formatDuration(minutes: number) {
		if (!minutes) return "-";
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		if (hours >= 24) {
			const days = Math.floor(hours / 24);
			return `${days}d ${hours % 24}h`;
		}
		return `${hours}h${mins > 0 ? ` ${mins}m` : ""}`;
	}
</script>

<script lang="ts">
	let {
		route,
		isExpanded = false,
		onToggleExpand,
		onEdit,
		onDelete,
		class: className
	}: RouteCardProps = $props();

	const TransportIcon = $derived(getTransportIcon(route.transportMode));
</script>

<PanelCard class={cn("group", isExpanded && "ring-1 ring-primary/20", className)}>
	<div class="mb-6 flex items-start justify-between">
		<div class="flex items-center gap-4">
			<div
				class={cn(
					"flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
					route.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
				)}
			>
				<TransportIcon class="size-6" />
			</div>
			<div>
				<div class="flex items-center gap-2">
					<h3 class="text-[1.125rem] font-bold text-ink transition-colors group-hover:text-primary">
						{route.name}
					</h3>
					{#if !route.isActive}
						<span
							class="rounded bg-muted px-2 py-0.5 text-[0.625rem] font-bold tracking-wide text-muted-foreground uppercase"
						>
							Inactive
						</span>
					{/if}
				</div>
				{#if route.description}
					<p class="mt-1 text-[0.75rem] text-muted-foreground">{route.description}</p>
				{/if}
				<div class="mt-1 flex items-center gap-3 text-[0.75rem] text-muted-foreground">
					<span class="flex items-center gap-1">
						<MapPin class="size-3" />
						{route.distance.toLocaleString()} km
					</span>
					<span class="h-1 w-1 rounded-full bg-hairline"></span>
					<span class="flex items-center gap-1">
						<Clock class="size-3" />
						{formatDuration(route.estimatedDuration)}
					</span>
				</div>
			</div>
		</div>
		<div class="opacity-0 transition-opacity group-hover:opacity-100">
			<ActionsDropdown
				actions={[
					...(onEdit ? [{ label: "Edit", onClick: onEdit }] : []),
					...(onDelete ? [{ label: "Delete", onClick: onDelete, destructive: true }] : [])
				]}
			/>
		</div>
	</div>
	{#if onToggleExpand}
		<div class="mt-4 flex justify-center">
			<button
				type="button"
				onclick={onToggleExpand}
				class="flex items-center gap-1 rounded-full px-3 py-1 text-[0.75rem] font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
			>
				{#if isExpanded}
					Collapse <ChevronUp class="size-3" />
				{:else}
					View Details <ChevronDown class="size-3" />
				{/if}
			</button>
		</div>
	{/if}
</PanelCard>
