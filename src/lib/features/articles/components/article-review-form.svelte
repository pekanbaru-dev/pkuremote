<script lang="ts" module>
	export type ArticleReviewFormProps = {
		articleId: string;
		isAdmin?: boolean;
	};
</script>

<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea/index.js";

	let { articleId, isAdmin = false }: ArticleReviewFormProps = $props();

	let reviewNote = $state("");
</script>

<div class="flex flex-col gap-4 rounded-xl border border-hairline bg-surface-container-lowest p-6">
	<h2 class="font-display text-title-md font-semibold text-ink">Keputusan Review</h2>

	<div class="flex flex-col gap-2">
		<label for="review-note-{articleId}" class="mb-1 block text-sm font-medium text-ink">
			Catatan (wajib saat menolak, opsional saat menyetujui)
		</label>
		<Textarea
			id="review-note-{articleId}"
			name="reviewNote"
			rows={4}
			bind:value={reviewNote}
			placeholder="Tulis catatan untuk penulis..."
		/>
	</div>

	<div class="flex gap-3 flex-wrap">
		<!-- Approve -->
		<form method="POST" action="?/approve" class="contents">
			<Input type="hidden" name="id" value={articleId} />
			<Input type="hidden" name="reviewNote" value={reviewNote} />
			<Button type="submit">Setujui &amp; Publish</Button>
		</form>

		<!-- Reject -->
		<form method="POST" action="?/reject" class="contents">
			<Input type="hidden" name="id" value={articleId} />
			<Input type="hidden" name="reviewNote" value={reviewNote} />
			<Button type="submit" variant="outline">Tolak</Button>
		</form>

		<!-- Archive (admin only) -->
		{#if isAdmin}
			<form method="POST" action="?/archive" class="contents">
				<Input type="hidden" name="id" value={articleId} />
				<Button type="submit" variant="outline">Arsipkan</Button>
			</form>
		{/if}
	</div>
</div>
