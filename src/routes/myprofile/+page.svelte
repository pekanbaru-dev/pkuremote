<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();

	const displayName = $derived(data.profile?.displayName ?? data.user.email ?? 'Pengguna');
	const email = $derived(data.user.email);
	const avatarUrl = $derived(data.profile?.avatarUrl ?? null);
	const monogram = $derived(displayName.charAt(0).toUpperCase());
</script>

<svelte:head>
	<title>Profil saya — PKU Remote</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="container-page py-16">
	<header class="measure-prose mb-12">
		<p class="label-meta mb-3">Profil</p>
		<h1 class="font-display text-headline tracking-tight text-ink">Profil saya</h1>
	</header>

	<section class="measure-prose">
		<div class="flex items-start gap-6 border-t border-hairline pt-8">
			{#if avatarUrl}
				<img
					src={avatarUrl}
					alt=""
					referrerpolicy="no-referrer"
					class="h-20 w-20 rounded-full border border-hairline object-cover"
				/>
			{:else}
				<div
					aria-hidden="true"
					class="flex h-20 w-20 items-center justify-center rounded-full border border-hairline bg-surface font-display text-display text-muted-foreground"
				>
					{monogram}
				</div>
			{/if}

			<div class="flex-1">
				<h2 class="font-display text-title text-ink">{displayName}</h2>
				{#if email}
					<p class="mt-1 text-body text-muted-foreground">{email}</p>
				{/if}
			</div>
		</div>

		{#if !data.profile}
			<p class="mt-8 border border-hairline bg-surface px-4 py-3 text-body text-muted-foreground">
				Profil belum tersedia. Coba segarkan halaman sebentar lagi.
			</p>
		{/if}

		<form method="POST" action="?/signOut" use:enhance class="mt-12 border-t border-hairline pt-8">
			<button
				type="submit"
				class="rounded-md border border-hairline bg-canvas px-5 py-2.5 text-body text-ink transition hover:border-destructive hover:text-destructive focus-visible:border-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
			>
				Sign out
			</button>
		</form>
	</section>
</main>
