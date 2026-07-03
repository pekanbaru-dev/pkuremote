<script lang="ts" module>
	import { positionVariants, legendVariants, type RadioGroupProps } from "./radio-group.style.js";
</script>

<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Radio } from "../radio/index.js";

	let {
		data,
		value,
		position,
		labelColor,
		intent,
		label,
		hint,
		error,
		required = false,
		name,
		disabled = false,
		class: className,
		onchange,
		...rest
	}: RadioGroupProps = $props();

	// `$props.id()` (Svelte >= 5.20) is a per-instance, SSR-stable id, so the
	// same group id is rendered on the server and the client during hydration.
	const groupId = $props.id();
	const msgId = `${groupId}-msg`;
	const describedBy = $derived((error ?? hint) ? msgId : undefined);
</script>

<fieldset
	class={cn("flex flex-col gap-1.5 text-sm", className)}
	aria-describedby={describedBy}
	{...rest}
>
	{#if label}
		<legend class={cn(legendVariants({ labelColor }))}>
			{label}
			{#if required}<span class="text-danger" aria-hidden="true">*</span>{/if}
		</legend>
	{/if}
	<div class="space-y-1">
		<ul
			class={cn(positionVariants({ position }))}
			role="radiogroup"
			aria-required={required || undefined}
		>
			{#each data as item, i (item.value ?? i)}
				<li>
					<Radio
						{intent}
						{name}
						value={item.value}
						checked={value === item.value}
						disabled={disabled || item.disabled}
						label={item.label}
						required={required && !item.disabled}
						onchange={() => onchange?.(item.value)}
					/>
				</li>
			{/each}
		</ul>
		{#if error}
			<p id={msgId} class="text-xs text-danger">{error}</p>
		{:else if hint}
			<p id={msgId} class="text-xs text-muted-foreground">{hint}</p>
		{/if}
	</div>
</fieldset>
