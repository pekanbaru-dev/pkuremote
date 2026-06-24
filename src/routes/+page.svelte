<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';

	type Announcement = {
		date: string;
		headline: string;
		excerpt: string;
	};

	type Post = {
		title: string;
		author: string;
		date: string;
		readingTime: string;
		excerpt: string;
		href: string;
	};

	const user = $derived(page.data.user);

	const featuredEvent = {
		date: 'Thu 11 Jul',
		title: 'Coffee & Code — July Meetup',
		location: 'Kopi Senja, Jalan Gajah',
		time: '18:30–21:00',
		excerpt:
			'Bring whatever you are working on — a side project, a client brief, a tricky PR — and work alongside other remote folks from the city. We wrap with a round of show-and-tell at twenty past eight.',
		rsvpHref: '#events'
	};

	const announcements: Announcement[] = [
		{
			date: 'Jul 02',
			headline: 'New community Discord is live',
			excerpt: 'We moved off the old WhatsApp group. Grab an invite in the footer.'
		},
		{
			date: 'Jun 24',
			headline: 'Call for talk proposals — August meetup',
			excerpt: 'Ten-minute lightning talks on anything you ship. Proposals open until 4 August.'
		},
		{
			date: 'Jun 18',
			headline: 'Venue partnership with Kopi Senja extended through October',
			excerpt: 'Same room, same coffee, four more months of quiet evenings.'
		}
	];

	const posts: Post[] = [
		{
			title: 'How we run a remote standup without standing up',
			author: 'Dewi Anggraini',
			date: '28 Jun 2026',
			readingTime: '6 min',
			excerpt:
				'Async by default, sync on Fridays, and one rule we stole from Basecamp: no status updates, only blockers. Three months in, here is what stuck and what we dropped.',
			href: '#posts'
		},
		{
			title: 'The Pekanbaru coffee shop index, ranked by outlet count',
			author: 'Rizky Pratama',
			date: '14 Jun 2026',
			readingTime: '4 min',
			excerpt:
				'A working spreadsheet of thirty-two cafes across the city, scored on three things that actually matter when you work from a table all day: power outlets, Wi-Fi stability, and how long a single kopi tubruk buys you.',
			href: '#posts'
		},
		{
			title: 'Why we stopped calling it a "networking event"',
			author: 'Siti Rahmah',
			date: '02 Jun 2026',
			readingTime: '3 min',
			excerpt:
				'The word networking makes remote workers tense. We renamed the monthly meetup, rewrote the invite, and watched RSVPs climb. The framing was the whole problem.',
			href: '#posts'
		}
	];

	const navLinks = [
		{ label: 'Events', href: '#events' },
		{ label: 'Announcements', href: '#announcements' },
		{ label: 'Posts', href: '#posts' }
	];
</script>

<header class="sticky top-0 z-10 bg-canvas border-b border-hairline">
	<div class="container-page flex items-center justify-between py-4">
		<a href="/" class="font-display text-lg font-medium tracking-tight text-ink">PKU Remote</a>
		<nav class="hidden sm:block" aria-label="Primary">
			<ul class="flex items-center gap-6 text-[0.9375rem]">
				{#each navLinks as link (link.href)}
					<li>
						<a
							href={link.href}
							class="border-b border-transparent transition-colors duration-200 hover:border-primary hover:text-primary"
						>
							{link.label}
						</a>
					</li>
				{/each}
				<li>
					{#if user}
						<a
							href="/myprofile"
							class="rounded-pill border border-hairline px-4 py-1.5 text-ink transition-colors duration-200 hover:border-primary hover:text-primary"
						>
							My profile
						</a>
					{:else}
						<a
							href="/login"
							class="rounded-pill border border-hairline px-4 py-1.5 text-ink transition-colors duration-200 hover:border-primary hover:text-primary"
						>
							Sign in
						</a>
					{/if}
				</li>
			</ul>
		</nav>
		<details class="sm:hidden">
			<summary class="cursor-pointer list-none text-[0.9375rem] text-ink">Menu</summary>
			<nav aria-label="Mobile" class="mt-2 flex flex-col gap-2">
				{#each navLinks as link (link.href)}
					<a
						href={link.href}
						class="border-b border-transparent py-1 transition-colors duration-200 hover:border-primary hover:text-primary"
					>
						{link.label}
					</a>
				{/each}
				{#if user}
					<a
						href="/myprofile"
						class="mt-2 inline-block rounded-pill border border-hairline px-4 py-1.5 text-center text-ink transition-colors duration-200 hover:border-primary hover:text-primary"
					>
						My profile
					</a>
				{:else}
					<a
						href="/login"
						class="mt-2 inline-block rounded-pill border border-hairline px-4 py-1.5 text-center text-ink transition-colors duration-200 hover:border-primary hover:text-primary"
					>
						Sign in
					</a>
				{/if}
			</nav>
		</details>
	</div>
</header>

<main>
	<section class="container-page py-[clamp(4rem,10vw,7rem)]" aria-labelledby="hero-heading">
		<h1
			id="hero-heading"
			class="animate-fade-up measure-prose font-display font-medium text-[var(--text-display)] leading-[1.05] tracking-[-0.02em] text-ink"
		>
			A quiet bulletin for Pekanbaru&rsquo;s remote workers.
		</h1>
		<p class="measure-prose mt-6 max-w-[70ch] text-[1.125rem] text-muted">
			Events, announcements, and writing from a community that works from home and meets in the
			city.
		</p>
		<div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
			<Button
				href="#events"
				variant="default"
				class="rounded-full px-6 py-3 text-[0.9375rem] font-semibold [a]:hover:bg-[var(--color-primary-hover)]"
				>See next event</Button
			>
			<a href="#posts" class="link-quiet text-[0.9375rem] pb-0.5">Read the blog &rarr;</a>
		</div>
	</section>

	<section
		id="events"
		class="container-page py-[clamp(3rem,7vw,5rem)]"
		aria-labelledby="events-heading"
	>
		<Separator orientation="horizontal" class="mb-[clamp(3rem,7vw,5rem)]" />
		<div class="flex flex-col gap-6 sm:flex-row sm:gap-12">
			<div class="sm:w-32 sm:shrink-0">
				<p class="font-body text-[1.5rem] font-semibold tabular-nums text-primary">
					{featuredEvent.date}
				</p>
			</div>
			<div class="flex-1">
				<h2
					id="events-heading"
					class="font-display font-medium text-[var(--text-headline)] text-ink"
				>
					{featuredEvent.title}
				</h2>
				<p class="label-meta mt-3">{featuredEvent.location} &middot; {featuredEvent.time}</p>
				<p class="measure-prose mt-4 text-ink">{featuredEvent.excerpt}</p>
				<a
					href={featuredEvent.rsvpHref}
					class="link-quiet mt-5 inline-block pb-0.5 text-[0.9375rem]">Reserve a seat &rarr;</a
				>
			</div>
		</div>
	</section>

	<section
		id="announcements"
		class="container-page py-[clamp(3rem,7vw,5rem)]"
		aria-labelledby="announcements-heading"
	>
		<Separator orientation="horizontal" class="mb-[clamp(3rem,7vw,5rem)]" />
		<h2
			id="announcements-heading"
			class="font-display font-medium text-[var(--text-headline)] text-ink"
		>
			Announcements
		</h2>
		<ul class="mt-8">
			{#each announcements as item, i (item.headline)}
				<li class="py-5">
					{#if i > 0}
						<Separator orientation="horizontal" class="-mt-5" />
					{/if}
					<div class="flex flex-col gap-1 pt-5 sm:flex-row sm:gap-8">
						<div class="sm:w-32 sm:shrink-0">
							<span class="label-meta">{item.date}</span>
						</div>
						<div class="flex-1">
							<h3 class="text-[1.0625rem] font-semibold text-ink">{item.headline}</h3>
							<p class="mt-1 text-muted">{item.excerpt}</p>
						</div>
					</div>
				</li>
			{/each}
		</ul>
	</section>

	<section
		id="posts"
		class="container-page py-[clamp(3rem,7vw,5rem)]"
		aria-labelledby="posts-heading"
	>
		<Separator orientation="horizontal" class="mb-[clamp(3rem,7vw,5rem)]" />
		<h2 id="posts-heading" class="font-display font-medium text-[var(--text-headline)] text-ink">
			Recent writing
		</h2>
		<ul class="mt-8">
			{#each posts as post, i (post.title)}
				<li class="py-7">
					{#if i > 0}
						<Separator orientation="horizontal" class="-mt-7" />
					{/if}
					<div class="pt-7">
						<a
							href={post.href}
							class="link-quiet inline-block pb-0.5 font-display text-[1.375rem] font-medium text-ink hover:text-primary"
						>
							{post.title}
						</a>
						<p class="label-meta mt-2">
							{post.author} &middot; {post.date} &middot; {post.readingTime}
						</p>
						<p class="measure-prose mt-3 text-ink">{post.excerpt}</p>
						<a href={post.href} class="link-quiet mt-3 inline-block pb-0.5 text-[0.9375rem]"
							>Read &rarr;</a
						>
					</div>
				</li>
			{/each}
		</ul>
	</section>

	<section class="container-page py-[clamp(3rem,7vw,5rem)]" aria-labelledby="about-heading">
		<Separator orientation="horizontal" class="mb-[clamp(3rem,7vw,5rem)]" />
		<h2 id="about-heading" class="font-display font-medium text-[var(--text-headline)] text-ink">
			About the club
		</h2>
		<p class="measure-prose mt-6 text-ink">
			PKU Remote is a community of people who work from Pekanbaru and work from home. We meet once a
			month at Kopi Senja to work alongside each other for an evening, trade notes on the tools and
			the clients and the coffee, and show what we shipped. Membership is open and free; the only
			requirement is that you show up with something you are working on.
		</p>
		<a href="#about" class="link-quiet mt-6 inline-block pb-0.5 text-[0.9375rem]"
			>Read the full about &rarr;</a
		>
	</section>
</main>

<footer class="container-page py-12">
	<Separator orientation="horizontal" class="mb-12" />
	<div class="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
		<div>
			<p class="font-display text-lg font-medium text-ink">PKU Remote</p>
			<nav aria-label="Footer" class="mt-3">
				<ul class="flex flex-wrap gap-x-5 gap-y-1 text-[0.9375rem]">
					{#each [...navLinks, { label: 'About', href: '#about' }] as link (link.href)}
						<li>
							<a
								href={link.href}
								class="border-b border-transparent transition-colors duration-200 hover:border-primary hover:text-primary"
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		</div>
		<div>
			<p class="label-meta">Community</p>
			<ul class="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.9375rem]">
				<li><a href="https://discord.gg/pkuremote" class="link-quiet pb-0.5">Discord</a></li>
				<li><a href="https://t.me/pkuremote" class="link-quiet pb-0.5">Telegram</a></li>
				<li><a href="mailto:hello@pkuremote.id" class="link-quiet pb-0.5">Email</a></li>
			</ul>
		</div>
	</div>
	<p class="label-meta mt-10">&copy; 2026 PKU Remote</p>
</footer>
