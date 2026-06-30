<script lang="ts" module>
	import { checkboxVariants, labelVariants, type CheckboxProps } from "./checkbox.style.js";
</script>

<script lang="ts">
	import { cn } from "$lib/utils.js";

	let {
		intent,
		size,
		checked,
		indeterminate = false,
		label,
		disabled,
		name,
		id,
		value,
		class: className,
		...rest
	}: CheckboxProps = $props();

	let el: HTMLInputElement | null = $state(null);

	$effect(() => {
		if (el) el.indeterminate = indeterminate;
	});
</script>

{#if label}
	<label class="inline-flex cursor-pointer items-center gap-2">
		<input
			bind:this={el}
			type="checkbox"
			class={cn(checkboxVariants({ intent, size }), className)}
			{checked}
			{disabled}
			{name}
			{id}
			{value}
			{...rest}
		/>
		<span class={cn(labelVariants({ disabled: !!disabled }))}>{label}</span>
	</label>
{:else}
	<input
		bind:this={el}
		type="checkbox"
		class={cn(checkboxVariants({ intent, size }), className)}
		{checked}
		{disabled}
		{name}
		{id}
		{value}
		{...rest}
	/>
{/if}
