<script lang="ts" module>
	import { inputVariants, type InputProps } from "./input.style.js";
</script>

<script lang="ts">
	import { cn } from "$lib/utils.js";

	let {
		intent,
		size,
		rounded,
		hasError = false,
		leftIcon,
		rightIcon,
		id,
		label,
		error,
		hint,
		disabled,
		class: className,
		...rest
	}: InputProps = $props();

	// `$props.id()` (Svelte >= 5.20) returns a per-instance, SSR-stable id
	// that matches between the server-rendered HTML and the client-hydrated
	// component. Prefer it over a module-scoped counter or `crypto.randomUUID()`,
	// both of which drift between server and client and cause hydration churn.
	const autoId = $props.id();
	const inputId = $derived(id ?? `${autoId}-input`);
	const msgId = $derived(`${inputId}-msg`);
	const describedBy = $derived((error ?? hint) ? msgId : undefined);
</script>

{#if label}
	<label for={inputId} class="mb-1 block text-sm font-medium text-ink">{label}</label>
{/if}
<div class="relative">
	{#if leftIcon}
		<span
			class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground"
		>
			{@render leftIcon()}
		</span>
	{/if}
	<input
		id={inputId}
		class={cn(
			inputVariants({
				intent,
				size,
				rounded,
				hasError,
				hasLeftIcon: !!leftIcon,
				hasRightIcon: !!rightIcon
			}),
			className
		)}
		aria-invalid={hasError || undefined}
		aria-describedby={describedBy}
		{disabled}
		{...rest}
	/>
	{#if rightIcon}
		<span
			class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground"
		>
			{@render rightIcon()}
		</span>
	{/if}
</div>
{#if error}
	<p id={msgId} class="mt-1 text-xs text-danger">{error}</p>
{:else if hint}
	<p id={msgId} class="mt-1 text-xs text-muted-foreground">{hint}</p>
{/if}
