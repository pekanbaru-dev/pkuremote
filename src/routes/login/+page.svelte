<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';

	let { data, form } = $props();

	const errorMessage = $derived(data.errorMessage ?? form?.message ?? null);
</script>

<svelte:head>
	<title>Sign in — PKU Remote</title>
	<meta name="description" content="Sign in or register with your Google account." />
</svelte:head>

<main class="container-page flex min-h-[80vh] flex-col items-center justify-center py-16">
	<header class="measure-prose mb-10 text-center">
		<p class="label-meta mb-3">Authentication</p>
		<h1 class="font-display text-headline tracking-tight text-ink">Sign in or register</h1>
		<p class="text-muted-foreground mt-3 text-body">
			We use your Google account to sign you in. New here? An account is created the first time you
			continue — no separate registration step.
		</p>
	</header>

	{#if errorMessage}
		<p
			role="alert"
			class="measure-prose mb-6 border border-hairline bg-surface px-4 py-3 text-body text-destructive"
		>
			{errorMessage}
		</p>
	{/if}

	<form method="POST" use:enhance class="measure-prose w-full">
		<input type="hidden" name="redirect" value={data.redirectTo} />
		<button
			type="submit"
			class="w-full rounded-md border border-hairline bg-canvas px-6 py-3 text-body text-ink transition hover:border-primary hover:text-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
		>
			Continue with Google
		</button>
	</form>

	<p class="measure-prose mt-6 text-center text-label text-muted-foreground">
		{#if page.url.searchParams.get('redirect')}
			You'll be returned to <code class="text-ink">{data.redirectTo}</code> after sign-in.
		{:else}
			You'll land on your profile after sign-in.
		{/if}
	</p>
</main>
