<script lang="ts" module>
	import { Tabs as TabsPrimitive } from "bits-ui";
	import { type WithElementRef, type BitsCompatibleHTMLAttributes } from "$lib/utils.js";
	import type { Snippet } from "svelte";

	export type TabsRootProps = WithElementRef<BitsCompatibleHTMLAttributes<HTMLDivElement>> & {
		value?: string;
		onValueChange?: (value: string) => void;
		children?: Snippet;
	};
	export type TabsListProps = WithElementRef<BitsCompatibleHTMLAttributes<HTMLDivElement>> & {
		children?: Snippet;
	};
	export type TabsTriggerProps = WithElementRef<BitsCompatibleHTMLAttributes<HTMLButtonElement>> & {
		value: string;
		children?: Snippet;
	};
	export type TabsContentProps = WithElementRef<BitsCompatibleHTMLAttributes<HTMLDivElement>> & {
		value: string;
		children?: Snippet;
	};
</script>

<script lang="ts">
	let { value = $bindable(""), onValueChange, children }: TabsRootProps = $props();
</script>

<TabsPrimitive.Root
	{value}
	onValueChange={(v) => {
		value = v;
		onValueChange?.(v);
	}}
>
	{@render children?.()}
</TabsPrimitive.Root>
