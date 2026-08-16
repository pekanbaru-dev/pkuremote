<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import { Badge, FileUpload } from "$lib/components/primitives";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import type { PageData, ActionData } from "./$types";

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const isImage = (ext: string) => ["png", "jpg", "jpeg", "webp", "gif"].includes(ext);

	async function getPresignedUrl({
		filename,
		contentType
	}: {
		filename: string;
		contentType: string;
	}) {
		const res = await fetch("/admin/settings/presign", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ filename, contentType })
		});
		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			throw new Error(data.error ?? "Gagal membuat presigned URL.");
		}
		return res.json();
	}

	// After a successful FileUpload upload, reload the server list of `test/*`
	// objects so the newly uploaded file appears immediately.
	async function handleUpload(url: string) {
		if (url) await invalidateAll();
	}
</script>

<svelte:head>
	<title>Pengaturan — Admin PKUBersua</title>
</svelte:head>

<section class="flex flex-col gap-6">
	<header>
		<h1 class="font-display text-headline-md text-ink">Pengaturan</h1>
		<p class="text-on-surface-variant mt-1 text-sm">
			Status penyimpanan Cloudflare R2 dan uji coba upload.
		</p>
	</header>

	<div class="flex flex-col gap-6">
		<!-- Config status (read-only) -->
		<div class="rounded-lg border border-outline-variant p-5">
			<h2 class="label-meta mb-3 text-on-surface-variant">Konfigurasi R2</h2>
			{#if data.config.ready}
				<Badge intent="success" variant="solid" size="sm">Siap</Badge>
			{:else}
				<Badge intent="danger" variant="solid" size="sm">Tidak lengkap</Badge>
			{/if}
			<ul class="mt-4 flex flex-col gap-2 text-sm">
				{#each data.config.fields as field (field.key)}
					<li class="flex items-center justify-between">
						<span class="text-on-surface-variant">{field.label}</span>
						<span class="flex items-center gap-2">
							<code class="text-ink">{field.key}</code>
							<Badge intent={field.set ? "success" : "danger"} variant="outline" size="sm">
								{field.set ? "ter-set" : "belum"}
							</Badge>
						</span>
					</li>
				{/each}
			</ul>
			{#if data.config.endpoint}
				<p class="label-meta mt-4 text-on-surface-variant">
					Endpoint: <code class="text-ink">{data.config.endpoint}</code>
				</p>
			{/if}
		</div>

		<!-- Presigned test upload -->
		<div class="rounded-lg border border-outline-variant p-5">
			<h2 class="label-meta mb-3 text-on-surface-variant">Uji Upload (presigned PUT)</h2>
			<FileUpload
				{getPresignedUrl}
				onChange={handleUpload}
				accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
				label="Drag & drop file untuk uji coba, atau klik untuk memilih"
			/>
		</div>

		<!-- List & preview test objects -->
		<div class="rounded-lg border border-outline-variant p-5">
			<h2 class="label-meta mb-3 text-on-surface-variant">File Uji (test/*)</h2>
			{#if data.objects.length === 0}
				<p class="text-on-surface-variant text-sm">Belum ada file uji.</p>
			{:else}
				<ul class="flex flex-col gap-3">
					{#each data.objects as obj (obj.key)}
						<li class="flex items-center gap-4">
							{#if isImage(obj.ext)}
								<img
									src={obj.url}
									alt={obj.key}
									class="h-14 w-14 rounded object-cover"
									loading="lazy"
								/>
							{:else}
								<div
									class="flex h-14 w-14 items-center justify-center rounded bg-surface-container-high text-xs text-on-surface-variant"
								>
									{obj.ext}
								</div>
							{/if}
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-medium text-ink">{obj.key}</p>
								<a
									href={obj.url}
									target="_blank"
									rel="noopener"
									class="link-quiet break-all text-xs">{obj.url}</a
								>
							</div>
							<form method="POST" action="?/delete">
								<Input type="hidden" name="key" value={obj.key} />
								<Button type="submit" variant="destructive" size="sm">Hapus</Button>
							</form>
						</li>
					{/each}
				</ul>
			{/if}
			{#if form?.action === "delete" && form.error}
				<p class="label-meta mt-3 text-error" role="alert">{form.error}</p>
			{/if}
		</div>
	</div>
</section>
