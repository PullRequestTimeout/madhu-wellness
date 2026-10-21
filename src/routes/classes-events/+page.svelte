<script lang="ts">
	import ArrowRightIcon from "phosphor-svelte/lib/ArrowRightIcon";
	import SeoHead from "$lib/components/SeoHead.svelte";
	import PageHero from "$lib/components/PageHero.svelte";
	import { heroImages } from "$lib/data/heroImages";
	import Newsletter from "$lib/components/Newsletter.svelte";
	import SpanifyText from "$lib/components/SpanifyText.svelte";
	import { isIntersecting } from "$lib/utils/isIntersecting";
	import EventCalendar from "$lib/components/EventCalendar.svelte";
	import LogoutButton from "$lib/auth/LogoutButton.svelte";
	import { authStore } from "$lib/auth/auth.svelte";

	// Admin UI only once auth has settled, so it never flashes on a hard refresh (and never renders on the server)
	const isAdmin = $derived(authStore.ready && authStore.isAdmin);
	// The admin's own read-only/editing switch; off by default so they see the calendar as visitors do
	let editMode = $state(false);

	// Logging out switches editing off, so it starts off again on the next sign-in
	$effect(() => {
		if (!isAdmin) editMode = false;
	});

	// TODO: real copy for the last three, and booking links for all four once the calendar provider is chosen.
	// Until then every card points at the calendar below.
	const events = [
		{
			title: "Yoga Teacher Training",
			text: "Join Danielle starting in October as she guides you through an immersive yoga teacher training designed to deepen your practice, expand your knowledge and prepare you to share yoga with others.",
			cta: "Book YTT",
			href: "#calendar",
			img: "/assets/images/event-yoga-teacher-training.jpg"
		},
		{
			title: "Drop-in Community Yoga",
			text: "An all-levels class out on the grass, open to everyone. Bring a mat, come as you are and move alongside your neighbours.",
			cta: "See dates",
			href: "#calendar",
			img: "/assets/images/event-community-yoga.webp"
		},
		{
			title: "Winter Dance Nights",
			text: "Shake off the cold with an evening of music and movement. No partner or experience needed, just a willingness to join in.",
			cta: "See dates",
			href: "#calendar",
			img: "/assets/images/event-dance-nights.jpg"
		},
		{
			title: "Films for Thought and Heart",
			text: "Screenings and conversation under the stars, with films chosen to spark reflection, connection and a little wonder.",
			cta: "See dates",
			href: "#calendar",
			img: "/assets/images/event-films.jpg"
		}
	];

	// Paired into rows, so a hovered card only ever takes width from the card beside it
	const eventRows = [events.slice(0, 2), events.slice(2, 4)];
</script>

<SeoHead
	title="Classes & Events | Madhu Wellness Collective"
	description="Browse upcoming classes, workshops, trainings and community events at Madhu Wellness Collective in Rossland."
/>

<main>
	<PageHero title="Classes & Events." image={heroImages["/classes-events"]} />

	<section class="gather">
		<div class="gather-intro">
			<div class="heading-wrap">
				<p class="eyebrow" aria-hidden="true">Gather</p>
				<h2 class="section-heading heading-fade-in" use:isIntersecting>
					<SpanifyText text="Something to move, learn or connect with" />
				</h2>
			</div>
			<p class="body-large">
				Browse upcoming classes, workshops, trainings and community events, with new opportunities to learn, move and connect throughout the year.
			</p>
		</div>

		<!-- The month calendar, read-only for visitors. A signed-in admin gets a bar above it to switch on editing -->
		<!-- A labelled region rather than another heading: the calendar's own month title is its heading -->
		<div class="calendar scroll-fade-up" id="calendar" role="region" aria-label="Class and event calendar" use:isIntersecting>
			{#if isAdmin}
				<div class="calendar-admin-bar">
					<label class="calendar-edit-toggle">
						<input type="checkbox" role="switch" bind:checked={editMode} />
						<span>Edit mode</span>
					</label>
					<p class="calendar-admin-hint">
						{editMode ? "Click a day to add an event, or an event to edit it." : "Switch on to add, move or change events."}
					</p>
					<LogoutButton class="calendar-logout" />
				</div>
			{/if}
			<EventCalendar canEdit={isAdmin && editMode} />
		</div>
	</section>

	<section class="upcoming bg-tan" id="upcoming">
		<div class="upcoming-intro">
			<div class="heading-wrap">
				<p class="eyebrow" aria-hidden="true">Upcoming</p>
				<h2 class="section-heading heading-fade-in" use:isIntersecting>
					<SpanifyText text="Some more upcoming events." />
				</h2>
			</div>
			<p class="body-large">There’s always something new to experience at Madhu.</p>
		</div>
		<!-- Two rows of two. From 1024px on hover screens, the hovered (or focused) card widens within its own row,
		     taking width from its neighbour, and opens to show its details -->
		<div class="event-cards">
			{#each eventRows as row, r}
				<div class="event-row group-stagger-fade" use:isIntersecting>
					{#each row as event, c}
						{@const id = `event-${r * 2 + c}`}
						<!-- Named by its title and described by its text, rather than reading out the whole card -->
						<a class="event-card" href={event.href} aria-labelledby="{id}-title" aria-describedby="{id}-text">
							<img class="event-image" src={event.img} alt="" loading="lazy" />
							<div class="event-text">
								<h3 class="event-title" id="{id}-title">{event.title}</h3>
								<div class="event-details">
									<div class="event-details-inner">
										<p id="{id}-text">{event.text}</p>
										<span class="event-cta">{event.cta} <span class="event-arrow"><ArrowRightIcon aria-hidden="true" /></span></span>
									</div>
								</div>
							</div>
						</a>
					{/each}
				</div>
			{/each}
		</div>
	</section>

	<Newsletter />
</main>

<style>
	section.gather,
	section.upcoming {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-l);
		color: var(--color-text);
	}

	div.gather-intro,
	div.upcoming-intro {
		position: relative;
		display: grid;
		gap: var(--spacing-m);
	}

	/* Gather */
	div.gather-intro {
		justify-items: center;
		text-align: center;
	}

	section.gather p.body-large {
		max-width: 819px;
	}

	/* Calendar, under the Gather intro. Links to #calendar clear the fixed header through html's scroll-padding-top */
	div.calendar {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-m);
	}

	/* Arriving from another page, the jump happens before the fade-up, while the calendar still sits 2rem low.
	   This adds the 2rem back so it settles clear of the header too */
	@media (prefers-reduced-motion: no-preference) {
		div.calendar.scroll-fade-up:not(:global(.show)) {
			scroll-margin-top: 2rem;
		}
	}

	/* Ends on no transform at all rather than translateY(0): any transform would become the containing block for the
	   calendar's fixed-position editor modal and popups, trapping them inside it */
	div.calendar.scroll-fade-up:global(.show) {
		transform: none;
	}

	/* Admin only: the edit switch, a hint and Log out */
	div.calendar-admin-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--spacing-s) var(--spacing-m);
		padding: var(--spacing-s) var(--spacing-m);
		border-radius: 10px;
		background-color: var(--color-peach);
		font-size: 16px;
	}

	label.calendar-edit-toggle {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-s);
		min-height: 32px;
		font-weight: 600;
		cursor: pointer;
	}

	/* A pill switch drawn on the native checkbox, so it keeps the checkbox's keyboard and screen reader support */
	label.calendar-edit-toggle input {
		position: relative;
		width: 44px;
		height: 24px;
		margin: 0;
		border-radius: var(--border-radius-pill);
		border: var(--border-width) solid var(--color-brown-mid);
		background-color: var(--color-cream);
		appearance: none;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	label.calendar-edit-toggle input::after {
		content: "";
		position: absolute;
		top: 3px;
		left: 3px;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background-color: var(--color-brown-mid);
		transition: translate 0.2s ease;
	}

	/* Off: an outlined track with a brown thumb. On: a filled brown track with a white thumb to the right */
	label.calendar-edit-toggle input:checked {
		border-color: var(--color-primary);
		background-color: var(--color-primary);
	}

	label.calendar-edit-toggle input:checked::after {
		translate: 20px 0;
		background-color: var(--color-white);
	}

	@media (prefers-reduced-motion: reduce) {
		label.calendar-edit-toggle input,
		label.calendar-edit-toggle input::after {
			transition: none;
		}
	}

	/* High-contrast mode drops backgrounds, so the switch keeps an outline and a visible thumb */
	@media (forced-colors: active) {
		label.calendar-edit-toggle input {
			border: 1px solid CanvasText;
		}

		label.calendar-edit-toggle input::after {
			background-color: CanvasText;
		}
	}

	p.calendar-admin-hint {
		flex: 1 1 14rem;
		font-size: 14px;
	}

	div.calendar-admin-bar :global(button.calendar-logout) {
		min-height: 32px;
		padding: 0;
		border: 0;
		background: none;
		color: var(--color-primary);
		font: inherit;
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	/* Upcoming */
	div.upcoming-intro {
		max-width: 538px;
	}

	div.event-cards,
	div.event-row {
		display: grid;
		gap: var(--spacing-m);
	}

	/* The cards' width, for their min-height below */
	div.event-cards {
		container-type: inline-size;
	}

	a.event-card {
		position: relative;
		display: flex;
		align-items: flex-end;
		/* At least landscape (3:2 of the full-width card), growing to fit the details that always show on phones.
		   A min-height rather than aspect-ratio: WebKit (every iOS browser) won't grow an aspect-ratio box past its
		   ratio when overflow is clipped, so the bottom-aligned text was cut off at the top */
		min-height: calc(100cqi * 2 / 3);
		min-width: 0;
		padding: var(--spacing-l);
		border-radius: 10px;
		box-shadow: var(--shadow);
		overflow: clip;
		color: var(--color-white);
	}

	/* Keep the global focus halo alongside the card's own shadow */
	a.event-card:focus-visible {
		box-shadow:
			0 0 0 var(--border-width) var(--color-focus-halo),
			var(--shadow);
	}

	img.event-image {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Brown rises from the bottom behind the title, and an even tint darkens the whole card while its details show */
	/* Raised above the photo, which as a later positioned sibling would otherwise paint over ::before */
	a.event-card::before,
	a.event-card::after {
		content: "";
		position: absolute;
		z-index: 1;
		inset: 0;
		pointer-events: none;
	}

	a.event-card::before {
		background: linear-gradient(
			to top,
			color-mix(in srgb, var(--color-brown) 90%, transparent) 0%,
			color-mix(in srgb, var(--color-brown) 60%, transparent) 40%,
			color-mix(in srgb, var(--color-brown) 0%, transparent) 85%
		);
	}

	a.event-card::after {
		background-color: color-mix(in srgb, var(--color-brown) 76%, transparent); /* Keeps the 16px white text at 4.5:1 even over pale sky */
	}

	div.event-text {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		max-width: 560px;
	}

	h3.event-title {
		font-family: var(--font-body);
		font-size: 32px;
		font-weight: 600;
		line-height: 1.05;
	}

	/* Open by default; collapsed only where the hover expand runs. The inner wrapper clips the text as the row closes */
	div.event-details {
		display: grid;
		grid-template-rows: 1fr;
	}

	div.event-details-inner {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--spacing-m);
		min-height: 0;
		overflow: hidden;
	}

	/* Spaced from the title inside the clipped wrapper, so the collapsed row is truly 0 tall */
	div.event-details p {
		margin-top: var(--spacing-m);
		font-size: 16px;
		letter-spacing: 0.05em;
		line-height: 1.4;
	}

	span.event-cta {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: 16px;
		font-weight: 500;
	}

	/* The icon is 1em in currentColor */
	span.event-arrow {
		display: flex;
		transition: translate 0.25s ease-out;
	}

	@media screen and (min-width: 768px) {
		div.event-cards,
		div.event-row {
			gap: var(--spacing-l);
		}
	}

	/* Each row splits into two landscape cards (about 600×385 at 1440px), and the row's height stays fixed while
	   the cards trade width */
	@media screen and (min-width: 1024px) {
		div.event-row {
			grid-template-columns: 1fr 1fr;
			aspect-ratio: 16 / 5;
		}

		/* The row sets the size from here, and a narrowing card may shrink below its content */
		a.event-card {
			min-height: 0;
		}
	}

	@media screen and (min-width: 1280px) {
		h3.event-title {
			font-size: 48px;
		}

		div.event-details p {
			font-size: var(--font-body-m);
		}
	}

	/* The expand (Relume's Layout 423). The active card widens to 1.3fr as its neighbour gives way to 0.7fr, so the
	   row's size never changes and the other row stays put; its tint fades in and its details open below the title.
	   Hover screens only, so touch users always see the details, and keyboard focus does the same */
	@media screen and (min-width: 1024px) and (hover: hover) and (prefers-reduced-motion: no-preference) {
		div.event-row {
			transition: grid-template-columns 0.5s cubic-bezier(0.22, 1, 0.36, 1);
		}

		/* Hover first and keyboard focus after, so focus wins when a parked pointer and focus disagree within a row.
		   (Avoids :not(:has()), which Chrome doesn't re-check on hover) */
		div.event-row:has(> a.event-card:first-child:hover) {
			grid-template-columns: 1.3fr 0.7fr;
		}

		div.event-row:has(> a.event-card:last-child:hover) {
			grid-template-columns: 0.7fr 1.3fr;
		}

		div.event-row:has(> a.event-card:first-child:focus-visible) {
			grid-template-columns: 1.3fr 0.7fr;
		}

		div.event-row:has(> a.event-card:last-child:focus-visible) {
			grid-template-columns: 0.7fr 1.3fr;
		}

		/* While a card in one row has focus, the other row ignores hover (its hovered card stays closed, below).
		   Focus changes are re-checked reliably, unlike hover, so :not(:has()) is safe here */
		div.event-cards:has(a.event-card:focus-visible) div.event-row:not(:has(a.event-card:focus-visible)) {
			grid-template-columns: 1fr 1fr;
		}

		a.event-card::after {
			opacity: 0;
			transition: opacity 0.5s ease;
		}

		div.event-details {
			grid-template-rows: 0fr;
			opacity: 0;
			transition:
				grid-template-rows 0.5s cubic-bezier(0.22, 1, 0.36, 1),
				opacity 0.3s ease;
		}

		a.event-card:is(:hover, :focus-visible)::after {
			opacity: 1;
		}

		a.event-card:is(:hover, :focus-visible) div.event-details {
			grid-template-rows: 1fr;
			opacity: 1;
			transition:
				grid-template-rows 0.5s cubic-bezier(0.22, 1, 0.36, 1),
				opacity 0.4s ease 0.15s;
		}

		a.event-card:is(:hover, :focus-visible) span.event-arrow {
			translate: 4px 0;
		}

		/* While another card has keyboard focus, a merely hovered card stays closed */
		div.event-cards:has(a.event-card:focus-visible) a.event-card:hover:not(:focus-visible)::after {
			opacity: 0;
		}

		div.event-cards:has(a.event-card:focus-visible) a.event-card:hover:not(:focus-visible) div.event-details {
			grid-template-rows: 0fr;
			opacity: 0;
		}

		div.event-cards:has(a.event-card:focus-visible) a.event-card:hover:not(:focus-visible) span.event-arrow {
			translate: 0 0;
		}
	}
</style>
