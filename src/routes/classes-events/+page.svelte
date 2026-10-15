<script lang="ts">
	import ArrowRightIcon from "phosphor-svelte/lib/ArrowRightIcon";
	import SeoHead from "$lib/components/SeoHead.svelte";
	import PageHero from "$lib/components/PageHero.svelte";
	import Newsletter from "$lib/components/Newsletter.svelte";
	import SpanifyText from "$lib/components/SpanifyText.svelte";
	import { isIntersecting } from "$lib/utils/isIntersecting";

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
			img: "/assets/images/event-community-yoga.jpg"
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
</script>

<SeoHead
	title="Classes & Events | Madhu Wellness Collective"
	description="Browse upcoming classes, workshops, trainings and community events at Madhu Wellness Collective in Rossland."
/>

<main>
	<PageHero title="Classes & Events." image="/assets/images/space-rental.jpg" />

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
	</section>

	<!-- Placeholder: the design has an empty "CALENDAR" frame here.
	     TODO: replace div.calendar-embed's contents with the external calendar/booking embed -->
	<section class="calendar" id="calendar" aria-label="Class and event calendar">
		<div class="calendar-embed"><p>CALENDAR</p></div>
	</section>

	<section class="upcoming bg-tan">
		<div class="upcoming-intro">
			<div class="heading-wrap">
				<p class="eyebrow" aria-hidden="true">Upcoming</p>
				<h2 class="section-heading heading-fade-in" use:isIntersecting>
					<SpanifyText text="Some more upcoming events." />
				</h2>
			</div>
			<p class="body-large">There’s always something new to experience at Madhu.</p>
		</div>
		<!-- From 1024px on hover screens, the grid's tracks grow towards the hovered (or focused) card, which opens to show its details -->
		<div class="event-cards group-stagger-fade" use:isIntersecting>
			{#each events as event, i}
				<!-- Named by its title and described by its text, rather than reading out the whole card -->
				<a class="event-card" href={event.href} aria-labelledby="event-{i}-title" aria-describedby="event-{i}-text">
					<img class="event-image" src={event.img} alt="" loading="lazy" />
					<div class="event-text">
						<h3 class="event-title" id="event-{i}-title">{event.title}</h3>
						<div class="event-details">
							<div class="event-details-inner">
								<p id="event-{i}-text">{event.text}</p>
								<span class="event-cta">{event.cta} <span class="event-arrow"><ArrowRightIcon aria-hidden="true" /></span></span>
							</div>
						</div>
					</div>
				</a>
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

	/* Calendar placeholder, full bleed */
	section.calendar {
		padding: 0;
	}

	div.calendar-embed {
		display: grid;
		place-items: center;
		height: calc(var(--vh, 1vh) * 70);
		min-height: 400px;
		max-height: 753px;
		background-color: #d9d9d9;
		font-size: clamp(48px, 10vw, 144px);
	}

	/* Upcoming */
	div.upcoming-intro {
		max-width: 538px;
	}

	div.event-cards {
		display: grid;
		gap: var(--spacing-m);
	}

	a.event-card {
		position: relative;
		display: flex;
		align-items: flex-end;
		/* A floor rather than a fixed ratio, so long text or zoomed type grows the card instead of being clipped */
		min-height: 440px;
		padding: var(--spacing-l);
		border-radius: 10px;
		box-shadow: var(--shadow);
		overflow: hidden;
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
	a.event-card::before,
	a.event-card::after {
		content: "";
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	a.event-card::before {
		background: linear-gradient(
			to top,
			color-mix(in srgb, var(--color-brown) 90%, transparent) 0%,
			color-mix(in srgb, var(--color-brown) 40%, transparent) 35%,
			color-mix(in srgb, var(--color-brown) 0%, transparent) 60%
		);
	}

	a.event-card::after {
		background-color: color-mix(in srgb, var(--color-brown) 76%, transparent); /* Keeps the 16px white text at 4.5:1 even over pale sky */
	}

	div.event-text {
		position: relative;
		z-index: 1;
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
		div.event-cards {
			gap: var(--spacing-l);
		}

		a.event-card {
			min-height: 480px;
		}
	}

	/* 2×2, square overall like the 1312×1312 design */
	@media screen and (min-width: 1024px) {
		div.event-cards {
			grid-template-columns: 1fr 1fr;
			grid-template-rows: 1fr 1fr;
			aspect-ratio: 1;
		}

		/* The grid sets the size from here; overflow: hidden lets the tracks shrink below the content */
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

	/* The expand (Relume's Layout 423, in two dimensions). The active card's column and row grow to 1.3fr while the
	   others give way to 0.7fr, so the grid's outer size never changes; its tint fades in and its details open below
	   the title. Hover screens only, so touch users always see the details, and keyboard focus does the same */
	@media screen and (min-width: 1024px) and (hover: hover) and (prefers-reduced-motion: no-preference) {
		div.event-cards {
			transition:
				grid-template-columns 0.5s cubic-bezier(0.22, 1, 0.36, 1),
				grid-template-rows 0.5s cubic-bezier(0.22, 1, 0.36, 1);
		}

		/* Each card sets both axes at once, hover first and keyboard focus after, so when a parked pointer and focus
		   disagree, focus takes the whole grid rather than the two mixing axes. (Avoids :not(:has()), which Chrome
		   doesn't re-check on hover) */
		div.event-cards:has(> a.event-card:nth-child(1):hover) {
			grid-template-columns: 1.3fr 0.7fr;
			grid-template-rows: 1.3fr 0.7fr;
		}

		div.event-cards:has(> a.event-card:nth-child(2):hover) {
			grid-template-columns: 0.7fr 1.3fr;
			grid-template-rows: 1.3fr 0.7fr;
		}

		div.event-cards:has(> a.event-card:nth-child(3):hover) {
			grid-template-columns: 1.3fr 0.7fr;
			grid-template-rows: 0.7fr 1.3fr;
		}

		div.event-cards:has(> a.event-card:nth-child(4):hover) {
			grid-template-columns: 0.7fr 1.3fr;
			grid-template-rows: 0.7fr 1.3fr;
		}

		div.event-cards:has(> a.event-card:nth-child(1):focus-visible) {
			grid-template-columns: 1.3fr 0.7fr;
			grid-template-rows: 1.3fr 0.7fr;
		}

		div.event-cards:has(> a.event-card:nth-child(2):focus-visible) {
			grid-template-columns: 0.7fr 1.3fr;
			grid-template-rows: 1.3fr 0.7fr;
		}

		div.event-cards:has(> a.event-card:nth-child(3):focus-visible) {
			grid-template-columns: 1.3fr 0.7fr;
			grid-template-rows: 0.7fr 1.3fr;
		}

		div.event-cards:has(> a.event-card:nth-child(4):focus-visible) {
			grid-template-columns: 0.7fr 1.3fr;
			grid-template-rows: 0.7fr 1.3fr;
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
		div.event-cards:has(> a.event-card:focus-visible) > a.event-card:hover:not(:focus-visible)::after {
			opacity: 0;
		}

		div.event-cards:has(> a.event-card:focus-visible) > a.event-card:hover:not(:focus-visible) div.event-details {
			grid-template-rows: 0fr;
			opacity: 0;
		}

		div.event-cards:has(> a.event-card:focus-visible) > a.event-card:hover:not(:focus-visible) span.event-arrow {
			translate: 0 0;
		}
	}
</style>
