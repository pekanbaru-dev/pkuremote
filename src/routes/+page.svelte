<script lang="ts">
	import { page } from "$app/state";
	import type { PageData } from "./$types.js";
	import { PUBLIC_SITE_URL } from "$env/static/public"; // baked at build time via Docker ARG
	import { EventCard, buildLandingJsonLd } from "$lib/features/events";
	import { Button, Badge, Input } from "$lib/components/primitives";
	import { Card } from "$lib/components/ui/card";
	import {
		Sheet,
		SheetContent,
		SheetDescription,
		SheetHeader,
		SheetTitle
	} from "$lib/components/ui/sheet";
	import { cn } from "$lib/utils";

	let { data }: { data: PageData } = $props();
	const events = $derived(data.events);
	const pastEvents = $derived(data.pastEvents);
	const pastEventsTotal = $derived(data.pastEventsTotal);
	const tagline = "Kabar terbaru komunitas Pekanbaru dalam satu tempat";
	const description =
		"Kabar terbaru komunitas Pekanbaru dalam satu tempat. Workshop, talks, dan meetup dari berbagai profesi — semua di satu bulletin.";
	const ogImage = `${PUBLIC_SITE_URL}/og-default.png`;
	// `page.data.user` is populated by the root `+layout.server.ts` from
	// `locals.user`. Keep the signed-in CTA in sync with the auth state so
	// returning users land on their profile instead of being sent back
	// through the login flow.
	const user = $derived(page.data.user);
	const accountHref = $derived(user ? "/myprofile" : "/login");
	const accountLabel = $derived(user ? "Profil saya" : "Login/Register");
	const landingJsonLd = buildLandingJsonLd();

	let scrolled = $state(false);
	let mobileMenuOpen = $state(false);
	let ticking = false;

	function onScroll() {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(() => {
			scrolled = window.scrollY > 30;
			ticking = false;
		});
	}
</script>

<svelte:head>
	<title>PKUBersua — {tagline}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href="{PUBLIC_SITE_URL}/" />
	<meta property="og:title" content="PKUBersua — {tagline}" />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="{PUBLIC_SITE_URL}/" />
	<meta property="og:image" content={ogImage} />
	<meta property="og:site_name" content="PKUBersua" />
	<meta property="og:locale" content="id_ID" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="PKUBersua — {tagline}" />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html landingJsonLd}
</svelte:head>

<!-- Body classes applied via app.html. Cannot use <svelte:body> with children. -->
<!-- Top Navigation Bar -->
<svelte:window onscroll={onScroll} />
<Sheet bind:open={mobileMenuOpen}>
	<header
		class="top-0 inset-x-0 fixed z-50 backdrop-blur motion-safe:transition-colors motion-safe:duration-200 motion-safe:ease-out {scrolled
			? 'bg-canvas/80 border-b border-hairline'
			: ''}"
	>
		<nav
			class="flex justify-between items-center px-margin-mobile tablet:px-margin-desktop w-full max-w-[1280px] mx-auto h-20"
		>
			<div class="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">
				PKUBersua.com
			</div>
			<div class="hidden desktop:flex items-center gap-lg">
				<a
					class="font-label-lg text-label-lg text-primary font-bold border-b-2 border-primary pb-1 transition-transform active:scale-95"
					href="/">Home</a
				>
				<a
					class="font-label-lg text-label-lg text-on-surface-variant dark:text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors duration-200 active:scale-95"
					href="#events">Events</a
				>
				<a
					class="font-label-lg text-label-lg text-on-surface-variant dark:text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors duration-200 active:scale-95"
					href="#blog">Blog</a
				>
				<a
					class="font-label-lg text-label-lg text-on-surface-variant dark:text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors duration-200 active:scale-95"
					href="#partnership">Partnership</a
				>
			</div>
			<div class="flex items-center gap-md">
				<div
					class="hidden desktop:flex items-center bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant"
				>
					<span class="material-symbols-outlined text-on-surface-variant mr-2">search</span>
					<Input
						class="border-none bg-transparent rounded-none p-0 h-auto w-40 text-label-md focus-visible:ring-0 focus-visible:border-transparent outline-none ring-0"
						placeholder="Search community..."
						type="text"
					/>
				</div>
				<div class="hidden tablet:block">
					<Button
						href={accountHref}
						class="h-auto text-base font-normal bg-primary text-white/75 px-lg py-sm rounded-full font-label-lg hover:opacity-90 transition-all active:scale-95"
					>
						{accountLabel}
					</Button>
				</div>
				<Button
					variant="text"
					size="sm"
					class="desktop:hidden text-on-surface-variant cursor-pointer p-2"
					aria-label="Menu navigasi"
					onclick={() => (mobileMenuOpen = true)}
				>
					<span class="material-symbols-outlined">menu</span>
				</Button>
			</div>
		</nav>
	</header>

	<SheetContent side="right" class="w-[300px] bg-surface p-4">
		<SheetHeader>
			<SheetTitle class="font-headline-lg text-headline-lg text-on-surface"
				>Menu Navigasi</SheetTitle
			>
			<SheetDescription class="text-on-surface-variant">
				Pilih halaman yang ingin Anda kunjungi
			</SheetDescription>
		</SheetHeader>
		<nav class="flex flex-col gap-2 mt-2">
			<a
				href="/"
				class="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low px-4 py-2 rounded-lg transition-colors"
				onclick={() => (mobileMenuOpen = false)}
			>
				Home
			</a>
			<a
				href="#events"
				class="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low px-4 py-2 rounded-lg transition-colors"
				onclick={() => (mobileMenuOpen = false)}
			>
				Events
			</a>
			<a
				href="#blog"
				class="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low px-4 py-2 rounded-lg transition-colors"
				onclick={() => (mobileMenuOpen = false)}
			>
				Blog
			</a>
			<a
				href="#partnership"
				class="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low px-4 py-2 rounded-lg transition-colors"
				onclick={() => (mobileMenuOpen = false)}
			>
				Partnership
			</a>
			<hr class="border-outline-variant/30 my-2" />
			<div class="mt-2 tablet:hidden">
				<Button
					href={accountHref}
					class="w-full h-auto text-base font-normal bg-primary text-white px-md py-sm rounded-full font-label-lg hover:opacity-90 transition-all"
					onclick={() => (mobileMenuOpen = false)}
				>
					{accountLabel}
				</Button>
			</div>
		</nav>
	</SheetContent>
</Sheet>

<main>
	<!-- Hero Section -->
	<section
		class="relative w-full h-auto min-h-[712px] tablet:h-[870px] bg-surface overflow-hidden flex items-center hero-clip"
	>
		<div class="absolute inset-0 z-0 opacity-[0.07] pointer-events-none hero-pattern">&nbsp;</div>
		<div class="absolute inset-0 z-0">
			<img
				src="/images/hero/header.png"
				alt="Pekanbaru heritage scene featuring traditional Riau architecture and batik motifs"
				class="w-full h-full object-cover opacity-40"
				width="512"
				height="512"
				loading="eager"
				fetchpriority="high"
				decoding="async"
			/>
			<div class="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-transparent">
				&nbsp;
			</div>
		</div>
		<div
			class="relative z-10 px-margin-mobile tablet:px-margin-desktop max-w-[1280px] mx-auto w-full"
		>
			<div class="max-w-2xl pt-4 tablet:pt-0">
				<Badge
					class="h-auto text-base font-normal border-0 inline-block bg-secondary-container text-on-secondary-container rounded-full font-label-lg px-4 py-1 mb-md"
					>Pekanbaru Heritage &amp; Culture</Badge
				>
				<h1
					class="font-headline-lg tablet:font-headline-xl text-headline-lg tablet:text-headline-xl text-primary mb-md leading-tight"
				>
					Celebrating the Heart of <br />
					<span class="text-secondary">Riau's Local Heritage</span>
				</h1>
				<p
					class="font-body-md tablet:font-body-lg text-body-md tablet:text-body-lg text-on-surface-variant mb-lg"
				>
					Inspired by the layered sweetness of Talam Durian, our community brings together the rich
					traditions and modern aspirations of Pekanbaru residents.
				</p>
				<div class="flex flex-col tablet:flex-row gap-md">
					<Button
						href="#events"
						class="h-auto text-base font-normal bg-primary-container hover:bg-primary-container/70 text-on-primary-container px-xl py-md rounded-lg font-headline-md shadow-sm hover:shadow-md transition-all active:scale-95 w-full tablet:w-auto"
						>Explore Events</Button
					>
					<Button
						variant="outline"
						class="h-auto text-base font-normal border-2 border-primary text-primary px-xl py-md rounded-lg font-headline-md hover:bg-primary/5 transition-all active:scale-95 w-full tablet:w-auto"
						>Learn History</Button
					>
				</div>
			</div>
		</div>
	</section>

	<!-- Featured Events Section -->
	<section
		class="scroll-mt-20 py-md tablet:py-xl px-margin-mobile tablet:px-margin-desktop max-w-[1280px] mx-auto"
		id="events"
	>
		<div class="flex justify-between items-start mb-md tablet:mb-xl">
			<div>
				<h2
					class="font-headline-md tablet:font-headline-lg text-headline-md tablet:text-headline-lg text-primary"
				>
					Upcoming Community Gatherings
				</h2>
				<p class="text-on-surface-variant mt-2">
					Join us for cultural workshops, food festivals, and local meetups.
				</p>
			</div>
			<Button
				variant="text"
				class="hidden desktop:flex h-auto text-base font-normal text-primary font-label-lg items-center gap-xs hover:underline"
			>
				View All Events <span class="material-symbols-outlined">arrow_forward</span>
			</Button>
		</div>
		<div class="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-gutter">
			{#each events as event (event.id)}
				<EventCard {event} />
			{/each}
		</div>
		<Button
			variant="text"
			class="hidden tablet:flex desktop:hidden h-auto text-base font-normal text-primary font-label-lg items-center gap-xs hover:underline mt-md"
		>
			View All Events <span class="material-symbols-outlined">arrow_forward</span>
		</Button>
		<Button
			class="tablet:hidden w-full h-auto text-base font-normal bg-primary text-white px-xl py-md rounded-lg font-headline-md hover:bg-primary-hover transition-all active:scale-95 mt-md"
		>
			View All Events
		</Button>
	</section>

	<!-- Past Events Section -->
	{#if pastEventsTotal > 0}
		<section
			class="scroll-mt-20 py-md tablet:py-xl px-margin-mobile tablet:px-margin-desktop max-w-[1280px] mx-auto"
			id="past-events"
		>
			<div class="flex justify-between items-start mb-md tablet:mb-xl">
				<div>
					<h2
						class="font-headline-md tablet:font-headline-lg text-headline-md tablet:text-headline-lg text-primary"
					>
						Event Sebelumnya
					</h2>
					<p class="text-on-surface-variant mt-2">
						Lihat apa yang sudah kita selenggarakan — dan bergabung di event berikutnya.
					</p>
				</div>
			</div>
			<div class="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-gutter">
				{#each pastEvents as event (event.id)}
					<EventCard {event} />
				{/each}
			</div>
			{#if pastEventsTotal > 6}
				<div class="mt-md flex justify-center">
					<a class="link-quiet text-label-lg text-primary" href="/events">Lihat semua</a>
				</div>
			{/if}
		</section>
	{/if}

	<!-- Bento Grid: News & Blog -->
	<section class="scroll-mt-20 py-md tablet:py-xl bg-surface-container-low" id="blog">
		<div class="px-margin-mobile tablet:px-margin-desktop max-w-[1280px] mx-auto">
			<div class="mb-md tablet:mb-xl text-left">
				<h2
					class="font-headline-md tablet:font-headline-lg text-headline-md tablet:text-headline-lg text-primary"
				>
					Latest News &amp; Stories
				</h2>
				<p class="text-on-surface-variant mt-2">Insights from the heart of our community.</p>
			</div>
			<div
				class="grid grid-cols-1 tablet:grid-cols-2 tablet:auto-flow-dense desktop:grid-cols-4 desktop:grid-rows-2 gap-gutter h-auto desktop:h-[600px]"
			>
				<!-- Large Feature -->
				<Card
					class="bg-surface-container-lowest rounded-xl talam-shadow ring-0 tablet:col-span-2 tablet:row-span-1 desktop:col-span-2 desktop:row-span-2 p-4 tablet:p-lg flex flex-col justify-between group cursor-pointer relative overflow-hidden"
				>
					<div class="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
						<img
							class="w-full h-full object-cover"
							alt="Songket pattern, traditional handwoven textile of Pekanbaru, Riau"
							src="/images/bento/songket.png"
							width="512"
							height="512"
							loading="lazy"
							decoding="async"
						/>
					</div>
					<div class="relative z-10">
						<span class="text-primary font-label-lg uppercase tracking-wider mb-2 block">
							Community Feature
						</span>
						<h3
							class="font-headline-lg text-headline-lg tablet:font-headline-md tablet:text-headline-md desktop:font-headline-xl desktop:text-headline-xl text-on-surface mb-md"
						>
							The Evolution of Pekanbaru's Modern Identity
						</h3>
						<p class="text-on-surface-variant text-body-md tablet:text-body-lg">
							How local youth are redefining traditional heritage through digital innovation and
							creative arts.
						</p>
					</div>
					<div class="relative z-10 flex items-center gap-sm mt-md tablet:mt-xl">
						<div class="w-12 h-12 rounded-full bg-secondary-container">&nbsp;</div>
						<div>
							<p class="font-bold text-on-surface">Admin Team</p>
							<p class="text-label-md text-on-surface-variant">5 min read • Oct 18</p>
						</div>
					</div>
				</Card>
				<!-- Small Story 1 -->
				<Card
					class="bg-surface-container-lowest rounded-xl talam-shadow ring-0 tablet:col-span-1 tablet:row-span-2 desktop:col-span-2 desktop:row-span-1 p-md tablet:p-md flex flex-col desktop:flex-row gap-md desktop:items-center group cursor-pointer"
				>
					<div class="w-full desktop:w-1/3 h-48 desktop:h-full rounded-lg overflow-hidden">
						<img
							class="w-full h-full object-cover"
							alt="Local market stall with tropical fruits in Senapelan, Pekanbaru"
							src="/images/bento/senapelan-culinary-market.jpg"
							width="512"
							height="512"
							loading="lazy"
							decoding="async"
						/>
					</div>
					<div class="desktop:w-2/3">
						<span class="text-secondary font-label-md block mb-1">Local Guide</span>
						<h4 class="font-headline-md text-headline-md leading-tight mb-2">
							5 Hidden Culinary Gems in Senapelan
						</h4>
						<p class="text-on-surface-variant text-label-md line-clamp-2">
							Discover the authentic flavors of old Pekanbaru through these family-owned stalls.
						</p>
					</div>
				</Card>
				<!-- Small Story 2 -->
				<Card
					class="bg-surface-container-lowest rounded-xl talam-shadow ring-0 tablet:col-span-1 desktop:col-span-1 p-md flex flex-col justify-between group cursor-pointer"
				>
					<h4 class="font-headline-md text-headline-md leading-tight mb-2">
						Sponsorship Goal Reached!
					</h4>
					<div class="space-y-2">
						<div class="flex justify-between text-label-md">
							<span>Cultural Center Fund</span>
							<span class="font-bold text-primary">100%</span>
						</div>
						<div class="h-3 bg-secondary-fixed rounded-full overflow-hidden">
							<div class="h-full bg-primary w-full">&nbsp;</div>
						</div>
						<p class="text-label-md text-on-surface-variant mt-2">
							Thank you to our 45 local partners.
						</p>
					</div>
				</Card>
				<!-- Small Story 3 -->
				<Card
					class={cn([
						"bg-primary text-on-primary rounded-xl ring-0",
						"text-white/80 tablet:col-span-1 desktop:col-span-1 p-md flex flex-col justify-center items-center text-center",
						"group cursor-pointer hover:bg-primary/90 transition-colors"
					])}
				>
					<span class="material-symbols-outlined text-4xl mb-2">campaign</span>
					<h4 class="font-headline-md text-headline-md leading-tight mb-1">Join the Team</h4>
					<p class="text-on-primary/80 text-label-md">
						Volunteer for the upcoming Heritage Festival.
					</p>
				</Card>
			</div>
		</div>
	</section>

	<!-- CTA Section: Partnership -->
	<section
		class="scroll-mt-20 py-md tablet:py-xl px-margin-mobile tablet:px-margin-desktop mb-md tablet:mb-lg"
		id="partnership"
	>
		<div
			class="max-w-[1280px] mx-auto bg-primary-container rounded-3xl p-md tablet:p-md desktop:p-xl flex flex-col tablet:flex-row items-start justify-between gap-md desktop:gap-lg relative overflow-hidden"
		>
			<div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32">
				&nbsp;
			</div>
			<div class="tablet:w-3/5 relative z-10">
				<h2
					class="font-headline-md tablet:font-headline-lg text-headline-md tablet:text-headline-lg text-on-primary-container mb-md"
				>
					Empower Your Business Through Community
				</h2>
				<p class="font-body-lg text-body-lg text-on-primary-container/90 mb-md tablet:mb-xl">
					Partner with Pekanbaru Community to reach a highly engaged local audience. From event
					sponsorship to cultural collaborations, let's grow together.
				</p>
				<div class="flex flex-col tablet:flex-row gap-md">
					<Button
						class="h-auto text-base font-normal bg-on-primary-container text-white px-xl py-md rounded-full font-headline-md hover:opacity-90 transition-all active:scale-95 w-full tablet:w-auto whitespace-nowrap"
						>Become a Partner</Button
					>
					<Button
						class="h-auto text-base font-normal bg-white/20 text-on-primary-container px-xl py-md rounded-full font-headline-md border border-on-primary-container/30 hover:bg-white/30 transition-all active:scale-95 w-full tablet:w-auto whitespace-nowrap"
						>Sponsorship Kit</Button
					>
				</div>
			</div>
			<div class="tablet:w-2/5 relative z-10 w-full">
				<Card
					class="bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 talam-shadow ring-0 p-3 tablet:p-5 desktop:p-8"
				>
					<div class="flex items-center gap-md mb-md">
						<div class="p-2 bg-on-primary-container text-white rounded-lg">
							<span class="material-symbols-outlined">trending_up</span>
						</div>
						<div>
							<h4 class="font-bold text-on-primary-container">Community Impact</h4>
							<p class="text-label-md text-on-primary-container/80">
								Growth metrics from last quarter
							</p>
						</div>
					</div>
					<div class="space-y-md">
						<div class="flex justify-between items-center">
							<span class="text-on-primary-container">New Members</span>
							<span class="font-bold text-on-primary-container">+1,240</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-on-primary-container">Event Attendees</span>
							<span class="font-bold text-on-primary-container">5,800+</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-on-primary-container">Partner Visibility</span>
							<span class="font-bold text-on-primary-container">150k Reach</span>
						</div>
					</div>
				</Card>
			</div>
		</div>
	</section>
</main>

<!-- Partners Section -->
<section
	class="py-md tablet:py-xl px-margin-mobile tablet:px-margin-desktop bg-surface"
	id="partners"
>
	<div class="max-w-[1280px] mx-auto">
		<div class="mb-md tablet:mb-xl">
			<h2
				class="font-headline-md tablet:font-headline-lg text-headline-md tablet:text-headline-lg text-primary mb-2"
			>
				Trusted by Local &amp; Global Partners
			</h2>
			<p class="text-on-surface-variant">
				Collaborating with industry leaders to preserve and promote our heritage.
			</p>
		</div>
		<div class="grid grid-cols-1 gap-gutter items-center">
			<div class="grid grid-cols-2 mobile:grid-cols-4 gap-lg">
				<div
					class="flex items-center justify-center p-md grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
				>
					<img
						alt="Pekanbaru City Logo"
						class="h-12 tablet:h-16 w-auto object-contain"
						src="/partners/logo-1.svg"
						loading="lazy"
						decoding="async"
						width="200"
						height="60"
					/>
				</div>
				<div
					class="flex items-center justify-center p-md grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
				>
					<img
						alt="Bank Riau Logo"
						class="h-12 tablet:h-16 w-auto object-contain"
						src="/partners/logo-2.svg"
						loading="lazy"
						decoding="async"
						width="200"
						height="60"
					/>
				</div>
				<div
					class="flex items-center justify-center p-md grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
				>
					<img
						alt="Visit Riau Logo"
						class="h-12 tablet:h-16 w-auto object-contain"
						src="/partners/logo-3.svg"
						loading="lazy"
						decoding="async"
						width="200"
						height="60"
					/>
				</div>
				<div
					class="flex items-center justify-center p-md grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
				>
					<img
						alt="Wonderful Indonesia Logo"
						class="h-12 tablet:h-16 w-auto object-contain"
						src="/partners/logo-4.svg"
						loading="lazy"
						decoding="async"
						width="200"
						height="60"
					/>
				</div>
			</div>
		</div>
	</div>
</section>

<footer
	class="bg-surface-container-highest dark:bg-surface-container-low border-t border-secondary-fixed py-md tablet:py-xl"
>
	<div
		class="max-w-[1280px] mx-auto px-margin-mobile tablet:px-margin-desktop grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-gutter"
	>
		<div class="tablet:col-span-1">
			<div class="font-headline-md text-headline-md text-primary mb-md">PKUBersua</div>
			<p class="font-body-md text-body-md text-on-surface-variant mb-md">
				Cultivating connection through Riau's rich cultural tapestry.
			</p>
			<div class="flex gap-md">
				<span class="text-primary hover:opacity-70 transition-all">
					<span class="material-symbols-outlined">public</span>
				</span>
				<a class="text-primary hover:opacity-70 transition-all" href="mailto:hello@pkubersua.com">
					<span class="material-symbols-outlined">alternate_email</span>
				</a>
				<span class="text-primary hover:opacity-70 transition-all">
					<span class="material-symbols-outlined">share</span>
				</span>
			</div>
		</div>

		<div class="space-y-md">
			<h4 class="font-bold text-primary">The Community</h4>
			<nav class="flex flex-col gap-sm" aria-label="The Community">
				<span class="text-on-surface-variant hover:text-primary transition-colors">About Us</span>
				<span class="text-on-surface-variant hover:text-primary transition-colors"
					>Local Culture</span
				>
				<a class="text-on-surface-variant hover:text-primary transition-colors" href="/events"
					>Events Calendar</a
				>
				<span class="text-on-surface-variant hover:text-primary transition-colors">Our Blog</span>
			</nav>
		</div>

		<div class="space-y-md">
			<h4 class="font-bold text-primary">Support &amp; Partnership</h4>
			<nav class="flex flex-col gap-sm" aria-label="Support and Partnership">
				<span class="text-on-surface-variant hover:text-primary transition-colors">Sponsorship</span
				>
				<span class="text-on-surface-variant hover:text-primary transition-colors"
					>Partner Directory</span
				>
				<a
					class="text-on-surface-variant hover:text-primary transition-colors"
					href="mailto:hello@pkubersua.com">Contact</a
				>
				<span class="text-on-surface-variant hover:text-primary transition-colors"
					>Terms of Service</span
				>
			</nav>
		</div>

		<div class="space-y-md">
			<h4 class="font-bold text-primary">Stay Connected</h4>
			<p class="text-on-surface-variant text-label-md">
				Join our monthly digest of local stories and events.
			</p>
			<form
				class="flex bg-surface-container rounded-lg overflow-hidden border border-outline-variant w-full"
				onsubmit={(e) => e.preventDefault()}
			>
				<Input
					class="border-none flex-1 bg-transparent rounded-none p-0 h-auto w-full text-label-md px-4 py-2 focus-visible:ring-0 focus-visible:border-transparent outline-none ring-0"
					placeholder="Your email"
					type="email"
				/>
				<Button
					class="flex-1 h-auto text-base font-normal bg-primary text-white/75 px-4 py-2 hover:opacity-90"
					type="submit">Join</Button
				>
			</form>
		</div>
	</div>
	<div
		class="max-w-[1280px] mx-auto px-margin-mobile tablet:px-margin-desktop mt-xl pt-lg border-t border-outline-variant/30 text-center text-label-md text-on-surface-variant"
	>
		© 2024 pkubersua.com Inspired by the heritage of Talam Durian.
	</div>
</footer>
