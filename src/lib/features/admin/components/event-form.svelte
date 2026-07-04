<script lang="ts" module>
	import type { Event, EventCategory, EventCategoryRef } from "$lib/features/events";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea";
	import * as Select from "$lib/components/ui/select";
	import { enhance } from "$app/forms";
	import { untrack } from "svelte";

	export type EventFormValues = Record<string, string | string[]>;

	export type EventFormProps = {
		/** All categories, for the primary + M2M pickers. */
		categories: EventCategoryRef[];
		/** The event being edited; omit for the create form. */
		event?: Event;
		/** Submitted values echoed back after a failed submit (takes precedence
		 *  over `event` so the admin doesn't lose edits). */
		values?: EventFormValues | null;
		/** Field + message of the single validation error to surface, if any. */
		errorField?: string | null;
		errorMessage?: string | null;
		/** Current banner URL (edit), passed through when no new file is chosen. */
		currentBannerUrl?: string | null;
		submitLabel?: string;
	};

	const STATUS_OPTIONS: { value: Event["status"]; label: string }[] = [
		{ value: "upcoming", label: "Akan datang" },
		{ value: "live", label: "Berlangsung" },
		{ value: "past", label: "Selesai" }
	];

	const CATEGORY_OPTIONS: { value: EventCategory; label: string }[] = [
		{ value: "workshop", label: "Workshop" },
		{ value: "talk", label: "Talk" },
		{ value: "meetup", label: "Meetup" },
		{ value: "social", label: "Social" },
		{ value: "other", label: "Lainnya" }
	];

	/** Slug suggestion from a title: lowercase, non-alphanumerics → hyphen. */
	function slugify(input: string): string {
		return input
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
	}

	/** ISO string → `datetime-local` value (`YYYY-MM-DDTHH:mm`). */
	function toLocalInput(iso: string | undefined): string {
		return iso ? iso.slice(0, 16) : "";
	}
</script>

<script lang="ts">
	let {
		categories,
		event,
		values = null,
		errorField = null,
		errorMessage = null,
		currentBannerUrl = null,
		submitLabel = "Simpan"
	}: EventFormProps = $props();

	const str = (key: string, fallback = "") => {
		const v = values?.[key];
		return typeof v === "string" ? v : fallback;
	};
	const fieldError = (field: string) => (errorField === field ? errorMessage : null);

	// Form state is seeded once from props (page-scoped, never re-created), so
	// the initial reads are deliberately non-reactive — `untrack` says so and
	// keeps svelte-check quiet.
	// Title/slug are interactive: the slug is auto-suggested from the title
	// until the admin edits it directly, after which it's left alone.
	let title = $state(untrack(() => str("title", event?.title ?? "")));
	let slug = $state(untrack(() => str("slug", event?.slug ?? "")));
	let slugTouched = $state(untrack(() => Boolean(str("slug", event?.slug ?? ""))));

	function onTitleInput() {
		if (!slugTouched) slug = slugify(title);
	}

	// Selects submit via their `name` (bits-ui renders hidden inputs).
	let status = $state(untrack(() => str("status", event?.status ?? "upcoming")));
	let category = $state(untrack(() => str("category", event?.category ?? "")));
	let categoryIds = $state<string[]>(
		untrack(
			() =>
				(Array.isArray(values?.categoryIds) ? (values?.categoryIds as string[]) : null) ??
				event?.categories.map((c) => c.id) ??
				[]
		)
	);

	const statusLabel = $derived(
		STATUS_OPTIONS.find((o) => o.value === status)?.label ?? "Pilih status"
	);
	const categoryLabel = $derived(
		category === ""
			? "— Tidak ada —"
			: (CATEGORY_OPTIONS.find((o) => o.value === category)?.label ?? "Pilih kategori")
	);
	const categoriesLabel = $derived(
		categoryIds.length === 0
			? "Belum ada kategori dipilih"
			: categories
					.filter((c) => categoryIds.includes(c.id))
					.map((c) => c.name)
					.join(", ")
	);

	const labelSpan = "label-meta text-on-surface-variant";
</script>

<form
	method="POST"
	enctype="multipart/form-data"
	use:enhance
	class="grid max-w-2xl gap-5"
	novalidate
>
	{#if event}
		<Input type="hidden" name="currentBannerUrl" value={currentBannerUrl ?? ""} />
	{/if}

	<label class="flex flex-col gap-1">
		<span class={labelSpan}>Judul</span>
		<Input name="title" bind:value={title} oninput={onTitleInput} required />
		{#if fieldError("title")}
			<p class="label-meta text-error" role="alert">{fieldError("title")}</p>
		{/if}
	</label>

	<label class="flex flex-col gap-1">
		<span class={labelSpan}>Slug</span>
		<Input
			name="slug"
			bind:value={slug}
			oninput={() => (slugTouched = true)}
			placeholder="otomatis-dari-judul"
			required
		/>
		{#if fieldError("slug")}
			<p class="label-meta text-error" role="alert">{fieldError("slug")}</p>
		{:else}
			<span class="label-meta text-muted-foreground"
				>URL publik event, mis. /events/{slug || "…"}</span
			>
		{/if}
	</label>

	<div class="grid gap-5 tablet:grid-cols-2">
		<label class="flex flex-col gap-1">
			<span class={labelSpan}>Waktu mulai</span>
			<Input
				type="datetime-local"
				name="startsAt"
				value={str("startsAt", toLocalInput(event?.startsAt))}
				required
			/>
			{#if fieldError("startsAt")}
				<p class="label-meta text-error" role="alert">{fieldError("startsAt")}</p>
			{/if}
		</label>
		<label class="flex flex-col gap-1">
			<span class={labelSpan}>Waktu selesai <span class="opacity-60">(opsional)</span></span>
			<Input
				type="datetime-local"
				name="endsAt"
				value={str("endsAt", toLocalInput(event?.endsAt))}
			/>
			{#if fieldError("endsAt")}
				<p class="label-meta text-error" role="alert">{fieldError("endsAt")}</p>
			{/if}
		</label>
	</div>

	<label class="flex flex-col gap-1">
		<span class={labelSpan}>Lokasi</span>
		<Input name="location" value={str("location", event?.location)} required />
		{#if fieldError("location")}
			<p class="label-meta text-error" role="alert">{fieldError("location")}</p>
		{/if}
	</label>

	<label class="flex flex-col gap-1">
		<span class={labelSpan}>Ringkasan</span>
		<Textarea name="excerpt" rows={2} value={str("excerpt", event?.excerpt)} required></Textarea>
		{#if fieldError("excerpt")}
			<p class="label-meta text-error" role="alert">{fieldError("excerpt")}</p>
		{/if}
	</label>

	<label class="flex flex-col gap-1">
		<span class={labelSpan}>Isi (Markdown)</span>
		<Textarea name="body" rows={8} value={str("body", event?.body)} required></Textarea>
		{#if fieldError("body")}
			<p class="label-meta text-error" role="alert">{fieldError("body")}</p>
		{/if}
	</label>

	<label class="flex flex-col gap-1">
		<span class={labelSpan}>Banner <span class="opacity-60">(PNG/JPEG/WebP, maks 2 MB)</span></span>
		{#if currentBannerUrl}
			<img
				src={currentBannerUrl}
				alt="Banner saat ini"
				class="mb-1 h-32 w-full rounded-lg border border-hairline object-cover"
			/>
		{/if}
		<Input type="file" name="banner" accept="image/png,image/jpeg,image/webp" />
		{#if fieldError("banner")}
			<p class="label-meta text-error" role="alert">{fieldError("banner")}</p>
		{/if}
	</label>

	<div class="grid gap-5 tablet:grid-cols-2">
		<label class="flex flex-col gap-1">
			<span class={labelSpan}>Status</span>
			<Select.Root type="single" name="status" bind:value={status}>
				<Select.Trigger class="w-full">{statusLabel}</Select.Trigger>
				<Select.Content>
					{#each STATUS_OPTIONS as opt (opt.value)}
						<Select.Item value={opt.value} label={opt.label} />
					{/each}
				</Select.Content>
			</Select.Root>
			{#if fieldError("status")}
				<p class="label-meta text-error" role="alert">{fieldError("status")}</p>
			{/if}
		</label>
		<label class="flex flex-col gap-1">
			<span class={labelSpan}>Kategori utama <span class="opacity-60">(opsional)</span></span>
			<Select.Root type="single" name="category" bind:value={category}>
				<Select.Trigger class="w-full">{categoryLabel}</Select.Trigger>
				<Select.Content>
					<Select.Item value="" label="— Tidak ada —" />
					{#each CATEGORY_OPTIONS as opt (opt.value)}
						<Select.Item value={opt.value} label={opt.label} />
					{/each}
				</Select.Content>
			</Select.Root>
			{#if fieldError("category")}
				<p class="label-meta text-error" role="alert">{fieldError("category")}</p>
			{/if}
		</label>
	</div>

	<div class="flex flex-col gap-1">
		<span class={labelSpan}>Kategori (tag)</span>
		<Select.Root type="multiple" name="categoryIds" bind:value={categoryIds}>
			<Select.Trigger class="w-full">{categoriesLabel}</Select.Trigger>
			<Select.Content>
				{#each categories as cat (cat.id)}
					<Select.Item value={cat.id} label={cat.name} />
				{/each}
			</Select.Content>
		</Select.Root>
		<span class="label-meta text-muted-foreground">Bisa pilih lebih dari satu.</span>
	</div>

	<div class="grid gap-5 tablet:grid-cols-3">
		<label class="flex flex-col gap-1">
			<span class={labelSpan}>Kuota <span class="opacity-60">(opsional)</span></span>
			<Input type="number" name="quota" min="1" value={str("quota", event?.quota?.toString())} />
			{#if fieldError("quota")}
				<p class="label-meta text-error" role="alert">{fieldError("quota")}</p>
			{/if}
		</label>
		<label class="flex flex-col gap-1">
			<span class={labelSpan}>Harga normal <span class="opacity-60">(opsional)</span></span>
			<Input
				type="number"
				name="priceNormal"
				min="0"
				value={str("priceNormal", event?.priceNormal?.toString())}
			/>
			{#if fieldError("priceNormal")}
				<p class="label-meta text-error" role="alert">{fieldError("priceNormal")}</p>
			{/if}
		</label>
		<label class="flex flex-col gap-1">
			<span class={labelSpan}>Harga promo <span class="opacity-60">(opsional)</span></span>
			<Input
				type="number"
				name="pricePromo"
				min="0"
				value={str("pricePromo", event?.pricePromo?.toString())}
			/>
			{#if fieldError("pricePromo")}
				<p class="label-meta text-error" role="alert">{fieldError("pricePromo")}</p>
			{/if}
		</label>
	</div>

	<label class="flex flex-col gap-1">
		<span class={labelSpan}
			>Pendaftaran ditutup pada <span class="opacity-60">(opsional)</span></span
		>
		<Input
			type="datetime-local"
			name="registrationClosesAt"
			value={str("registrationClosesAt", toLocalInput(event?.registrationClosesAt))}
		/>
	</label>

	<div class="flex items-center gap-3 pt-2">
		<Button type="submit">{submitLabel}</Button>
		<Button href="/admin/events" variant="ghost">Batal</Button>
	</div>
</form>
