<script lang="ts" module>
	import { DatePicker as DatePickerPrimitive } from "bits-ui";
	import { tv, type VariantProps } from "tailwind-variants";

	export const datePickerVariants = tv({
		base: "flex w-full items-center rounded-md border border-hairline bg-canvas px-3 text-ink outline-none transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-within:ring-destructive/30",
		variants: {
			size: {
				sm: "h-8 text-[0.8125rem]",
				default: "h-9 text-[0.9375rem]",
				lg: "h-11 text-[1rem]"
			},
			intent: {
				primary: "",
				destructive:
					"aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-within:ring-destructive/30"
			}
		},
		defaultVariants: {
			size: "default",
			intent: "primary"
		}
	});

	export const datePickerCalendarVariants = tv({
		base: "rounded-lg border border-hairline bg-canvas p-4 shadow-md"
	});

	export const datePickerDayVariants = tv({
		base: "inline-flex size-9 items-center justify-center rounded-md text-[0.875rem] text-ink transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[unavailable]:text-muted-foreground data-[unavailable]:line-through"
	});

	export const datePickerHeaderVariants = tv({
		base: "flex items-center justify-between border-b border-hairline pb-2 mb-3"
	});

	export type DatePickerSize = VariantProps<typeof datePickerVariants>["size"];
	export type DatePickerIntent = VariantProps<typeof datePickerVariants>["intent"];

	export type DatePickerProps = Omit<
		DatePickerPrimitive.RootProps,
		"value" | "onValueChange" | "placeholder" | "onPlaceholderChange" | "class" | "id"
	> & {
		value?: DatePickerPrimitive.RootProps["value"];
		onValueChange?: DatePickerPrimitive.RootProps["onValueChange"];
		placeholder?: DatePickerPrimitive.RootProps["placeholder"];
		onPlaceholderChange?: DatePickerPrimitive.RootProps["onPlaceholderChange"];
		size?: DatePickerSize;
		intent?: DatePickerIntent;
		label?: string;
		hint?: string;
		error?: string;
		required?: boolean;
		class?: string;
		id?: string;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils.js";

	let {
		size = "default",
		intent = "primary",
		label,
		hint,
		error,
		required = false,
		class: className,
		placeholder = $bindable(),
		value = $bindable(),
		...restProps
	}: DatePickerProps = $props();

	const hasError = $derived(!!error);
	const inputId = $derived(
		typeof restProps.id === "string"
			? restProps.id
			: `datepicker-${Math.random().toString(36).slice(2, 9)}`
	);
</script>

<div class={cn("flex w-full flex-col gap-1.5", className)}>
	{#if label}
		<label for={inputId} class="block text-[0.8125rem] font-medium text-ink">
			{label}{#if required}<span class="ml-0.5 text-destructive">*</span>{/if}
		</label>
	{/if}
	<DatePickerPrimitive.Root bind:value bind:placeholder {...restProps}>
		<div
			class={cn(
				datePickerVariants({ size, intent }),
				hasError && "border-destructive focus-within:ring-destructive/30"
			)}
		>
			<DatePickerPrimitive.Input id={inputId} aria-label={label ?? "Pick a date"} />
		</div>
		<DatePickerPrimitive.Content class="z-50 mt-1" sideOffset={4}>
			<DatePickerPrimitive.Calendar class={cn(datePickerCalendarVariants())}>
				{#snippet children({ months, weekdays })}
					<DatePickerPrimitive.Header class={cn(datePickerHeaderVariants())}>
						<DatePickerPrimitive.PrevButton
							class="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
						>
							‹
						</DatePickerPrimitive.PrevButton>
						<DatePickerPrimitive.Heading class="text-[0.9375rem] font-medium text-ink" />
						<DatePickerPrimitive.NextButton
							class="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
						>
							›
						</DatePickerPrimitive.NextButton>
					</DatePickerPrimitive.Header>
					<div class="grid grid-cols-7 gap-y-1">
						{#each weekdays as day (day)}
							<DatePickerPrimitive.HeadCell
								class="text-[0.75rem] font-medium text-muted-foreground text-center py-1"
							>
								{day.slice(0, 2)}
							</DatePickerPrimitive.HeadCell>
						{/each}
					</div>
					{#each months as month (month.value.toString())}
						<DatePickerPrimitive.Grid class="mt-2">
							<DatePickerPrimitive.GridBody>
								{#each month.weeks as weekDates, i (i)}
									<DatePickerPrimitive.GridRow class="grid grid-cols-7 gap-1">
										{#each weekDates as date (date.toString())}
											<DatePickerPrimitive.Cell
												{date}
												month={month.value}
												class={cn(datePickerDayVariants())}
											/>
										{/each}
									</DatePickerPrimitive.GridRow>
								{/each}
							</DatePickerPrimitive.GridBody>
						</DatePickerPrimitive.Grid>
					{/each}
				{/snippet}
			</DatePickerPrimitive.Calendar>
		</DatePickerPrimitive.Content>
	</DatePickerPrimitive.Root>
	{#if error}
		<p class="text-[0.75rem] text-destructive">{error}</p>
	{:else if hint}
		<p class="text-[0.75rem] text-muted-foreground">{hint}</p>
	{/if}
</div>
