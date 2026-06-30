<script lang="ts" module>
	import { radioVariants, labelVariants, type RadioProps } from "./radio.style.js";
</script>

<script lang="ts">
	import { cn } from "$lib/utils.js";

	let {
		intent,
		value,
		checked,
		label,
		uppercase = false,
		disabled,
		name,
		id,
		class: className,
		...rest
	}: RadioProps = $props();
</script>

{#if label}
	<label class="inline-flex cursor-pointer items-center gap-2">
		<input
			type="radio"
			class={cn(radioVariants({ intent }), className)}
			{checked}
			{disabled}
			{name}
			{id}
			{value}
			{...rest}
		/>
		<span class={cn(labelVariants({ uppercase, disabled: !!disabled }))}>{label}</span>
	</label>
{:else}
	<input
		type="radio"
		class={cn(radioVariants({ intent }), className)}
		{checked}
		{disabled}
		{name}
		{id}
		{value}
		{...rest}
	/>
{/if}
