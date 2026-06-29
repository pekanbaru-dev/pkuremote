<script lang="ts" module>
	import { Check } from "@lucide/svelte";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type StepperStep = {
		id: number;
		title: string;
		description?: string;
		isCompleted?: boolean;
	};

	export type StepperProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		steps: StepperStep[];
		currentStep: number;
		onStepClick?: (stepId: number) => void;
	};
</script>

<script lang="ts">
	let { steps, currentStep, onStepClick, class: className }: StepperProps = $props();
</script>

<div class={cn("flex items-center justify-center", className)}>
	{#each steps as step, index (step.id)}
		{@const isCompleted = step.isCompleted ?? currentStep > step.id}
		{@const isCurrent = currentStep === step.id}
		{@const isPending = !isCompleted && !isCurrent}
		<div class="flex items-center">
			<button
				type="button"
				class={cn(
					"flex cursor-pointer flex-col items-center border-0 bg-transparent p-0 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:hover:opacity-100",
					!onStepClick && "cursor-default"
				)}
				onclick={() => onStepClick?.(step.id)}
				disabled={!onStepClick}
			>
				<div
					class={cn(
						"flex h-10 w-10 items-center justify-center rounded-full border-2 text-[0.875rem] font-medium",
						isCompleted
							? "border-primary bg-primary text-primary-foreground"
							: isPending
								? "border-hairline bg-canvas text-muted-foreground"
								: "border-primary bg-canvas text-primary"
					)}
				>
					{#if isCompleted}
						<Check class="size-4" />
					{:else}
						{step.id}
					{/if}
				</div>
				<div class="mt-2 max-w-24 text-center">
					<p
						class={cn(
							"text-[0.75rem] font-medium",
							isCompleted || isCurrent ? "text-primary" : "text-muted-foreground"
						)}
					>
						{step.title}
					</p>
					{#if step.description}
						<p
							class={cn("mt-1 text-[0.75rem]", isPending ? "text-muted-foreground/60" : "text-ink")}
						>
							{step.description}
						</p>
					{/if}
				</div>
			</button>
			{#if index < steps.length - 1}
				<div class={cn("mx-4 h-0.5 w-16", isCompleted ? "bg-primary" : "bg-hairline")}></div>
			{/if}
		</div>
	{/each}
</div>
