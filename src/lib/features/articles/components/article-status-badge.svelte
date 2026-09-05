<script lang="ts" module>
	import type { ArticleStatus } from "../types.ts";

	export type ArticleStatusBadgeProps = {
		status: ArticleStatus;
		class?: string;
	};

	const STATUS_LABELS: Record<ArticleStatus, string> = {
		draft: "Draft",
		in_review: "On Review",
		published: "Published",
		archived: "Trash",
		rejected: "Ditolak"
	};

	const STATUS_CLASSES: Record<ArticleStatus, string> = {
		draft: "bg-slate-500 text-white",
		in_review: "bg-amber-500 text-white",
		published: "bg-green-600 text-white",
		archived: "bg-red-500 text-white",
		rejected: "bg-rose-700 text-white"
	};
</script>

<script lang="ts">
	let { status, class: className }: ArticleStatusBadgeProps = $props();

	const label = $derived(STATUS_LABELS[status]);
	const cls = $derived(STATUS_CLASSES[status]);
</script>

<span
	class="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold {cls} {className ??
		''}"
>
	{label}
</span>
