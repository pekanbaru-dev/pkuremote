<script lang="ts" module>
	import type { ArticleStatus } from "../types.ts";

	export type ArticleStatusBadgeProps = {
		status: ArticleStatus;
		class?: string;
	};

	const STATUS_LABELS: Record<ArticleStatus, string> = {
		draft: "Draft",
		in_review: "Menunggu Review",
		published: "Published",
		archived: "Arsip"
	};

	const STATUS_CLASSES: Record<ArticleStatus, string> = {
		draft: "bg-surface-container text-muted-foreground border-hairline",
		in_review: "bg-primary/10 text-primary border-primary/20",
		published: "bg-green-50 text-green-700 border-green-200",
		archived: "bg-surface-container text-muted-foreground border-hairline opacity-60"
	};
</script>

<script lang="ts">
	let { status, class: className }: ArticleStatusBadgeProps = $props();

	const label = $derived(STATUS_LABELS[status]);
	const cls = $derived(STATUS_CLASSES[status]);
</script>

<span
	class="inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-label font-medium border {cls} {className ??
		''}"
>
	{label}
</span>
