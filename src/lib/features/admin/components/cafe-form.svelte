<script lang="ts" module>
	import type { Cafe } from "$lib/features/wfc";
	export type CafeFormValues = Record<string, string>;

	export type CafeFormProps = {
		cafe?: Cafe;
		values?: CafeFormValues | null;
		errorMessage?: string | null;
		submitLabel?: string;
	};
</script>

<script lang="ts">
	import { untrack } from "svelte";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea";
	import * as Select from "$lib/components/ui/select";
	import { Checkbox } from "$lib/components/primitives";
	import { WFC_CATEGORY_OPTIONS } from "$lib/features/wfc";

	let {
		cafe,
		values = null,
		errorMessage = null,
		submitLabel = "Simpan kafe"
	}: CafeFormProps = $props();

	const value = (name: string, fallback = "") => values?.[name] ?? fallback;
	const linesValue = (name: string, fallback: readonly string[]) =>
		value(name, fallback.join("\n"));
	const pairsValue = (name: string, fallback: readonly (readonly (string | number)[])[]) =>
		value(name, fallback.map((parts) => parts.join(" | ")).join("\n"));
	let wfcCategory = $state(
		untrack(() => value("wfcCategory", cafe?.wfcCategory ?? "wfc-friendly"))
	);
	const wfcCategoryLabel = $derived(
		WFC_CATEGORY_OPTIONS.find((option) => option.value === wfcCategory)?.label ?? "Pilih kategori"
	);
	const published = $derived(
		values ? values.published === "on" || values.published === "true" : (cafe?.published ?? true)
	);
</script>

<form method="POST" class="space-y-8">
	{#if errorMessage}
		<p
			class="rounded-md border border-error/30 bg-error-container px-4 py-3 text-sm text-on-error-container"
		>
			{errorMessage}
		</p>
	{/if}

	<section class="grid gap-5 desktop:grid-cols-2">
		<label class="space-y-2 text-sm font-semibold text-ink">
			<span>Nama kafe</span>
			<Input name="name" required value={value("name", cafe?.name)} />
		</label>
		<label class="space-y-2 text-sm font-semibold text-ink">
			<span>Slug</span>
			<Input
				name="slug"
				required
				pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
				value={value("slug", cafe?.slug)}
			/>
		</label>
		<label class="space-y-2 text-sm font-semibold text-ink">
			<span>Skor</span>
			<Input
				name="score"
				required
				type="number"
				min="0"
				max="100"
				value={value("score", String(cafe?.score ?? 80))}
			/>
		</label>
		<label class="space-y-2 text-sm font-semibold text-ink">
			<span>Status</span>
			<Input name="liveStatus" required value={value("liveStatus", cafe?.liveStatus)} />
		</label>
		<label class="space-y-2 text-sm font-semibold text-ink">
			<span>Catatan status</span>
			<Input name="liveNote" required value={value("liveNote", cafe?.liveNote)} />
		</label>
		<label class="space-y-2 text-sm font-semibold text-ink">
			<span>Jam tutup</span>
			<Input name="closing" required value={value("closing", cafe?.closing)} />
		</label>
		<label class="space-y-2 text-sm font-semibold text-ink">
			<span>Jarak</span>
			<Input name="distance" required value={value("distance", cafe?.distance)} />
		</label>
		<label class="space-y-2 text-sm font-semibold text-ink">
			<span>Kisaran harga</span>
			<Input name="price" required value={value("price", cafe?.price)} />
		</label>
		<label class="space-y-2 text-sm font-semibold text-ink">
			<span>Wi-Fi</span>
			<Input name="wifi" required value={value("wifi", cafe?.wifi)} />
		</label>
		<label class="space-y-2 text-sm font-semibold text-ink">
			<span>Colokan</span>
			<Input name="outlets" required value={value("outlets", cafe?.outlets)} />
		</label>
		<label class="space-y-2 text-sm font-semibold text-ink">
			<span>Suasana</span>
			<Input name="atmosphere" required value={value("atmosphere", cafe?.atmosphere)} />
		</label>
		<label class="space-y-2 text-sm font-semibold text-ink">
			<span>Durasi ideal</span>
			<Input name="duration" required value={value("duration", cafe?.duration)} />
		</label>
		<label class="space-y-2 text-sm font-semibold text-ink desktop:col-span-2">
			<span>URL gambar</span>
			<Input name="imageUrl" type="url" value={value("imageUrl", cafe?.imageUrl ?? "")} />
		</label>
		<label class="space-y-2 text-sm font-semibold text-ink desktop:col-span-2">
			<span>Alamat</span>
			<Input name="address" required value={value("address", cafe?.address)} />
		</label>
		<label class="space-y-2 text-sm font-semibold text-ink">
			<span>Latitude</span>
			<Input
				name="latitude"
				required
				type="number"
				step="any"
				value={value("latitude", String(cafe?.latitude ?? -0.5))}
			/>
		</label>
		<label class="space-y-2 text-sm font-semibold text-ink">
			<span>Longitude</span>
			<Input
				name="longitude"
				required
				type="number"
				step="any"
				value={value("longitude", String(cafe?.longitude ?? 101.45))}
			/>
		</label>
		<label class="space-y-2 text-sm font-semibold text-ink desktop:col-span-2">
			<span>Tagline</span>
			<Input name="tagline" required value={value("tagline", cafe?.tagline)} />
		</label>
		<label class="space-y-2 text-sm font-semibold text-ink desktop:col-span-2">
			<span>Kesesuaian</span>
			<Textarea name="fit" required rows={3} value={value("fit", cafe?.fit)} />
		</label>
		<label class="space-y-2 text-sm font-semibold text-ink desktop:col-span-2">
			<span>Kategori WFC</span>
			<Select.Root type="single" name="wfcCategory" bind:value={wfcCategory}>
				<Select.Trigger class="w-full">{wfcCategoryLabel}</Select.Trigger>
				<Select.Content>
					{#each WFC_CATEGORY_OPTIONS as option (option.value)}
						<Select.Item value={option.value} label={option.label} />
					{/each}
				</Select.Content>
			</Select.Root>
			<small class="block font-normal text-on-surface-variant">
				{WFC_CATEGORY_OPTIONS.find((option) => option.value === wfcCategory)?.description}
			</small>
		</label>
	</section>

	<section class="grid gap-5 desktop:grid-cols-2">
		<label class="space-y-2 text-sm font-semibold text-ink">
			<span>Tags</span>
			<small class="block font-normal text-on-surface-variant"
				>Satu tag per baris. Wajib sertakan tag Nongkrong.</small
			>
			<Textarea name="tags" rows={8} value={linesValue("tags", cafe?.tags ?? [])} />
		</label>
		<label class="space-y-2 text-sm font-semibold text-ink">
			<span>Skor detail</span>
			<small class="block font-normal text-on-surface-variant"
				>Satu baris: label | skor 0-100.</small
			>
			<Textarea
				name="scoreDetails"
				rows={8}
				value={pairsValue("scoreDetails", cafe?.scoreDetails ?? [])}
			/>
		</label>
		<label class="space-y-2 text-sm font-semibold text-ink">
			<span>Jam terbaik</span>
			<small class="block font-normal text-on-surface-variant">Satu baris: label | waktu.</small>
			<Textarea name="bestHours" rows={8} value={pairsValue("bestHours", cafe?.bestHours ?? [])} />
		</label>
		<label class="space-y-2 text-sm font-semibold text-ink">
			<span>Amenitas</span>
			<small class="block font-normal text-on-surface-variant">Satu baris: label | nilai.</small>
			<Textarea name="amenities" rows={8} value={pairsValue("amenities", cafe?.amenities ?? [])} />
		</label>
		<label class="space-y-2 text-sm font-semibold text-ink">
			<span>Kebijakan</span>
			<small class="block font-normal text-on-surface-variant"
				>Satu baris: label | nilai | ok/warn.</small
			>
			<Textarea name="policies" rows={8} value={pairsValue("policies", cafe?.policies ?? [])} />
		</label>
		<label class="space-y-2 text-sm font-semibold text-ink desktop:col-span-2">
			<span>Review</span>
			<small class="block font-normal text-on-surface-variant"
				>Satu baris: nama | tanggal | kutipan.</small
			>
			<Textarea name="reviews" rows={8} value={pairsValue("reviews", cafe?.reviews ?? [])} />
		</label>
	</section>

	<div class="flex items-center justify-between gap-4 border-t border-hairline pt-5">
		<Checkbox name="published" label="Tampilkan di halaman WFC" value="true" checked={published} />
		<Button type="submit">{submitLabel}</Button>
	</div>
</form>
