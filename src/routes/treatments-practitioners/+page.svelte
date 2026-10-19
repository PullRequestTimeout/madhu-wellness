<script lang="ts">
	import { onMount } from "svelte";
	import CaretDownIcon from "phosphor-svelte/lib/CaretDownIcon";
	import SeoHead from "$lib/components/SeoHead.svelte";
	import PageHero from "$lib/components/PageHero.svelte";
	import Newsletter from "$lib/components/Newsletter.svelte";
	import PrimaryButton from "$lib/components/PrimaryButton.svelte";
	import SpanifyText from "$lib/components/SpanifyText.svelte";
	import { isIntersecting } from "$lib/utils/isIntersecting";
	import { followPointer } from "$lib/utils/followPointer";
	import { slideOpen } from "$lib/utils/slideOpen";
	import { scrollProgress } from "$lib/utils/scrollProgress";

	// TODO: real bios. Each one starts with the design's teaser; the rest is placeholder.
	// TODO: headshots for the hover photo (add an img field and swap the initials block for it)
	const practitioners = [
		{
			name: "Nadine Klawitter",
			role: "Registered Massage Therapist",
			bio: "Nadine has been a registered massage therapist for many years. Full bio coming soon: this placeholder stands in for her background, training and approach to care."
		},
		{
			name: "Clare Kearney",
			role: "Owner / Yoga Instructor / Registered Massage Therapist",
			bio: "Clare is registered with the College of Massage Therapists of British Columbia. Full bio coming soon: this placeholder stands in for her background, training and approach to care."
		},
		{
			name: "Michelle Coish",
			role: "Osteopathic Manual Practitioner / Lactation Consultant",
			bio: "Starting her career as a maternity and pediatric practitioner, Michelle now offers osteopathic care and lactation support. Full bio coming soon: this placeholder stands in for her background and approach."
		},
		{
			name: "Danielle Hachey",
			role: "Owner / Yoga Teacher Trainer",
			bio: "Danielle is a long-time yoga instructor. Full bio coming soon: this placeholder stands in for her background, training and approach to teaching."
		},
		{
			name: "Jineya Naicker",
			role: "Canadian Certified Counsellor",
			bio: "With over 17 years of work experience in the field of mental health, Jineya brings depth and care to her counselling practice. Full bio coming soon: this placeholder stands in for her background and approach."
		},
		{
			name: "Keith Robine",
			role: "Registered Clinical Counsellor",
			bio: "Keith is a registered clinical counsellor. Full bio coming soon: this placeholder stands in for his background, training and approach to care."
		}
	];

	const initials = (name: string) =>
		name
			.split(" ")
			.map((part) => part[0])
			.join("");

	// One bio open at a time
	let openBio = $state<number | null>(null);
	// Whose photo follows the pointer
	let hovered = $state<number | null>(null);

	// TODO: point each CTA at its booking page once booking is set up. Until then they go where the nav's Book Now does.
	const bookingHref = "/classes-events";

	const treatments = [
		{
			eyebrow: "Restore",
			title: "Registered Massage Therapy",
			text: "Thoughtful, hands-on care to ease tension, support recovery and help you feel more comfortable and at home in your body.",
			cta: "Book Massage",
			img: "/assets/images/space-treatment.jpg",
			bg: "var(--color-background-peach)"
		},
		{
			eyebrow: "Reflect",
			title: "Clinical Counselling",
			text: "A supportive, compassionate space to explore what you’re experiencing, develop new perspectives and work towards meaningful change.",
			cta: "Book Counselling",
			img: "/assets/images/space-counselling.jpg",
			bg: "var(--color-background-tan)"
		},
		{
			eyebrow: "Balance",
			title: "Osteopathic Manual Therapy",
			text: "A whole-body approach that works with the body’s structure and function to support mobility, ease discomfort and encourage natural balance.",
			cta: "Book Osteopathy",
			img: "/assets/images/space-massage.jpg",
			bg: "var(--color-background-peach)"
		},
		{
			eyebrow: "Move",
			title: "Private Therapeutic Yoga",
			text: "One-on-one yoga sessions tailored to your body, needs and goals, creating space to build strength, mobility, awareness and ease.",
			cta: "Book Yoga",
			img: "/assets/images/space-meditation.jpg",
			bg: "var(--color-background-tan)"
		}
	];

	// The treatment on show while the track is pinned (it's only read by the pinned-mode CSS)
	let activeTreatment = $state(0);
	let treatmentsTrack: HTMLElement;
	// Pinning only switches on once the scroll tracking is live, so without JS the treatments stay readable as bands
	let pinned = $state(false);
	onMount(() => (pinned = true));

	// Pinned, the inactive treatments are see-through, so tabbing into one scrolls to its step first
	function showTreatment(index: number) {
		if (index === activeTreatment || getComputedStyle(treatmentsTrack.firstElementChild as HTMLElement).position !== "sticky") return;
		const step = (treatmentsTrack.offsetHeight - window.innerHeight) / treatments.length;
		const top = treatmentsTrack.getBoundingClientRect().top + window.scrollY;
		window.scrollTo({ top: top + step * (index + 0.5), behavior: "instant" });
	}
</script>

<SeoHead
	title="Practitioners & Treatments | Madhu Wellness Collective"
	description="Meet the practitioners of Madhu Wellness Collective and explore massage therapy, counselling, osteopathy and private yoga in Rossland."
/>

<main>
	<PageHero title="Practitioners & Treatments." image="/assets/images/hero-treatments-practitioners.jpg" />

	<section class="practitioners" id="practitioners" use:followPointer>
		<div class="practitioners-intro">
			<div class="heading-wrap">
				<p class="eyebrow" aria-hidden="true">Our team</p>
				<h2 class="section-heading heading-fade-in" use:isIntersecting>
					<SpanifyText text="Meet the people behind your wellbeing" />
				</h2>
			</div>
			<p class="body-large">
				Our practitioners bring their own expertise, experience and approach to help you feel more balanced, supported and at home in your body.
			</p>
		</div>

		<ul class="practitioner-list group-stagger-fade" use:isIntersecting>
			{#each practitioners as person, i}
				{@const open = openBio === i}
				<li class="practitioner" onpointerenter={() => (hovered = i)} onpointerleave={() => (hovered = null)}>
					<h3 class="practitioner-name">{person.name}</h3>
					<p class="practitioner-role">{person.role}</p>
					<div class="practitioner-bio" class:open>
						<!-- Starts collapsed (all bios do), so the server render is clamped too; from then on slideOpen owns the class -->
						<p id="bio-{i}" class="collapsed" use:slideOpen={open}>{person.bio}</p>
						<button
							type="button"
							class="practitioner-toggle"
							aria-expanded={open}
							aria-controls="bio-{i}"
							onclick={() => (openBio = open ? null : i)}
						>
							See {open ? "less" : "more"}<span class="visually-hidden"> about {person.name}</span>
							<span class="practitioner-caret"><CaretDownIcon aria-hidden="true" /></span>
						</button>
					</div>
				</li>
			{/each}
		</ul>

		<!-- Relume's Portfolio 20: the hovered practitioner's photo follows the pointer, easing after it, beneath the list's
		     text. Outside the list on purpose, since the stagger's transform would trap position: fixed -->
		<div class="practitioner-photos" class:visible={hovered !== null} aria-hidden="true">
			{#each practitioners as person, i}
				<span class="practitioner-photo" class:active={hovered === i}>{initials(person.name)}</span>
			{/each}
		</div>
	</section>

	<section class="collective">
		<div class="collective-card scroll-fade-up" use:isIntersecting>
			<div class="collective-text">
				<h2 class="section-heading">A growing collective</h2>
				<p class="body-large">
					Our community continues to evolve, building on the many practitioners and practices that have found a home here over the years.
				</p>
			</div>
			<div class="collective-past">
				<p class="collective-label">Previous team members:</p>
				<!-- TODO: photos and names of previous team members (give each a visually-hidden name) -->
				<ul class="collective-people">
					{#each Array(9) as _}
						<li class="collective-person" aria-hidden="true"></li>
					{/each}
				</ul>
			</div>
		</div>
	</section>

	<section class="explore">
		<div class="explore-intro">
			<div class="heading-wrap">
				<p class="eyebrow" aria-hidden="true">Explore</p>
				<h2 class="section-heading heading-fade-in" use:isIntersecting>
					<SpanifyText text="Find the care that’s right for you." />
				</h2>
			</div>
			<p class="body-large">
				Explore the treatments offered by our practitioners, or book an appointment to begin your next step towards feeling your best.
			</p>
		</div>
		<div class="explore-buttons">
			<PrimaryButton href={bookingHref} text="Book An Appointment" />
			<PrimaryButton href="#treatments" text="Explore Treatments" primary={false} />
		</div>
	</section>

	<!-- Relume's Layout 349, with the text pinned as well as the image. From 1024px the stage sticks for four screens of
	     scrolling while the treatments crossfade and the background follows them; otherwise they stack as bands -->
	<section class="treatments" id="treatments" aria-label="Treatments">
		<div
			class="treatments-track"
			class:pinned
			bind:this={treatmentsTrack}
			use:scrollProgress={{ onProgress: (progress) => (activeTreatment = Math.min(treatments.length - 1, Math.floor(progress * treatments.length))) }}
		>
			<div class="treatments-stage" style:--active-bg={treatments[activeTreatment].bg}>
				{#each treatments as treatment, i}
					<!-- As bands, the text and image fade up as each scrolls in; pinned, the crossfade takes over -->
					<article
						class="treatment group-stagger-fade"
						class:active={activeTreatment === i}
						style:--treatment-bg={treatment.bg}
						onfocusin={() => showTreatment(i)}
						use:isIntersecting
					>
						<div class="treatment-text">
							<div class="heading-wrap">
								<p class="eyebrow" aria-hidden="true">{treatment.eyebrow}</p>
								<h2 class="treatment-title">{treatment.title}</h2>
							</div>
							<p class="body-large">{treatment.text}</p>
							<PrimaryButton href={bookingHref} text={treatment.cta} />
						</div>
						<img class="treatment-image" src={treatment.img} alt="" loading="lazy" />
					</article>
				{/each}
			</div>
		</div>
	</section>

	<Newsletter />
</main>

<style>
	section.practitioners,
	section.explore {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-l);
		color: var(--color-text);
	}

	div.practitioners-intro,
	div.explore-intro {
		position: relative;
		display: grid;
		gap: var(--spacing-m);
	}

	/* Practitioners */
	div.practitioners-intro {
		max-width: 690px;
	}

	ul.practitioner-list,
	ul.collective-people {
		padding: 0;
		list-style: none;
	}

	/* Positioned above the follow photo, so the text and toggles always read over it */
	ul.practitioner-list {
		position: relative;
		z-index: 1;
		border-bottom: 1px solid var(--color-text);
	}

	li.practitioner {
		display: grid;
		gap: var(--spacing-xs);
		padding-block: var(--spacing-l);
		border-top: 1px solid var(--color-text);
	}

	h3.practitioner-name {
		font-family: var(--font-body);
		font-size: 36px;
		font-weight: 600;
		line-height: 1.1;
	}

	p.practitioner-role {
		font-size: var(--font-body-m);
		font-weight: 600;
	}

	/* Collapsed (slideOpen's class), the bio is one clamped line; open, it shows in full. The toggle keeps one place
	   either way, under the bio on phones and beside it from 768px, so only the bio's height moves as slideOpen slides it */
	div.practitioner-bio {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--spacing-xs);
	}

	div.practitioner-bio p {
		max-width: 880px;
		min-width: 0;
		overflow: hidden;
		font-size: var(--font-body-m);
		letter-spacing: 0.05em;
		line-height: 1.4;
	}

	div.practitioner-bio p.collapsed {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
		line-clamp: 1;
	}

	button.practitioner-toggle {
		display: inline-flex;
		flex: none;
		align-items: center;
		gap: 4px;
		/* A 44px tap target, pulled back out of the layout so the row keeps the design's spacing */
		min-height: 44px;
		margin-block: -12px;
		/* Fits "See more", so swapping to the shorter "See less" doesn't nudge the bio's width */
		min-width: 6.25em;
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		font-size: 16px;
		font-weight: 500;
		white-space: nowrap;
		cursor: pointer;
	}

	button.practitioner-toggle:hover {
		text-decoration: underline;
	}

	/* The icon is 1em in currentColor */
	span.practitioner-caret {
		display: flex;
		font-size: 18px;
	}

	div.practitioner-bio.open span.practitioner-caret {
		rotate: 180deg;
	}

	/* Only shown where the follow effect runs */
	div.practitioner-photos {
		display: none;
	}

	/* Collective */
	div.collective-card {
		display: grid;
		gap: var(--spacing-l);
		padding: var(--spacing-l);
		border-radius: 20px;
		background-color: var(--color-tan-dark);
		box-shadow: var(--shadow);
		color: var(--color-white);
	}

	div.collective-text {
		display: grid;
		gap: var(--spacing-m);
		max-width: 593px;
	}

	div.collective-past {
		display: grid;
		gap: var(--spacing-m);
	}

	/* White on the tan-dark card is about 3:1, which passes AA only as large text: 24px, or 18.66px bold */
	div.collective-text p.body-large {
		font-size: 24px;
	}

	p.collective-label {
		font-size: 20px;
		font-weight: 600;
	}

	ul.collective-people {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-m);
	}

	li.collective-person {
		width: 72px;
		aspect-ratio: 1;
		border-radius: 50%;
		background-color: var(--color-cream);
		opacity: 0.85;
	}

	/* Explore */
	section.explore {
		align-items: center;
		text-align: center;
	}

	div.explore-intro {
		justify-items: center;
		max-width: 819px;
	}

	div.explore-buttons {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-m) var(--spacing-l);
	}

	/* Treatments: stacked bands by default */
	section.treatments {
		padding: 0;
	}

	article.treatment {
		display: grid;
		gap: var(--spacing-l);
		align-items: center;
		padding: var(--padding-block) var(--padding-inline);
		background-color: var(--treatment-bg);
		color: var(--color-text);
	}

	div.treatment-text {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--spacing-m);
		max-width: 640px;
	}

	div.treatment-text p.body-large {
		max-width: 538px;
	}

	/* Space under the paragraph before the button, as in the design */
	div.treatment-text :global(a.primary) {
		margin-top: calc(var(--spacing-l) - var(--spacing-m));
	}

	h2.treatment-title {
		position: relative;
		font-family: var(--font-body);
		font-size: 36px;
		font-weight: 600;
		line-height: 1.1;
	}

	img.treatment-image {
		width: 100%;
		aspect-ratio: 3 / 2;
		object-fit: cover;
		border-radius: 10px;
		box-shadow: var(--shadow);
	}

	@media screen and (min-width: 768px) {
		/* The bio shrinks to leave the toggle room, so it's the same width collapsed or open */
		div.practitioner-bio {
			flex-direction: row;
			align-items: baseline;
			gap: var(--spacing-m);
		}

		div.collective-card {
			padding: var(--spacing-xl);
		}

		li.collective-person {
			width: 100px;
		}

		article.treatment {
			grid-template-columns: 1fr 1fr;
			gap: var(--spacing-xl);
		}

		img.treatment-image {
			aspect-ratio: 640 / 471;
		}
	}

	@media screen and (min-width: 1280px) {
		h3.practitioner-name,
		h2.treatment-title {
			font-size: 56px;
		}
	}

	/* The follow photo: hover-and-mouse screens only. The tracked pointer sets the position, and the translate
	   transition makes the photo ease after it */
	@media screen and (min-width: 1024px) and (hover: hover) and (pointer: fine) {
		div.practitioner-photos {
			position: fixed;
			z-index: 0; /* Under the list (z-index 1) and the header */
			top: 0;
			left: 0;
			display: grid;
			--photo-width: clamp(240px, 22vw, 340px);
			width: var(--photo-width);
			aspect-ratio: 4 / 5;
			/* Just right of the pointer, centred on it vertically */
			translate: calc(var(--pointer-x, 0) * 1px + var(--spacing-l)) calc(var(--pointer-y, 0) * 1px - 50%);
			pointer-events: none;
			opacity: 0;
			transition: opacity 0.3s ease;
		}

		/* ...unless it would run off the right edge, when it swaps to the left of the pointer (the swap eases too).
		   sign() turns "would it overflow?" into 0 or 1, with a --spacing-l margin to clear a classic scrollbar (100vw includes it).
		   Browsers without sign() keep the photo on the right */
		@supports (width: calc(sign(1px) * 1px)) {
			div.practitioner-photos {
				--photo-flip: max(0, sign(var(--pointer-x, 0) * 1px + var(--spacing-l) + var(--photo-width) + var(--spacing-l) - 100vw));
				translate: calc(var(--pointer-x, 0) * 1px + var(--spacing-l) - (var(--photo-width) + var(--spacing-l) * 2) * var(--photo-flip))
					calc(var(--pointer-y, 0) * 1px - 50%);
			}
		}

		div.practitioner-photos.visible {
			opacity: 1;
		}

		span.practitioner-photo {
			grid-area: 1 / 1;
			display: grid;
			place-items: center;
			border-radius: 10px;
			background-color: var(--color-tan);
			box-shadow: var(--shadow);
			color: var(--color-text);
			font-size: 64px;
			font-weight: 600;
			opacity: 0;
		}

		span.practitioner-photo.active {
			opacity: 1;
		}
	}

	@media screen and (min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
		div.practitioner-photos {
			transition:
				translate 0.6s cubic-bezier(0.22, 1, 0.36, 1),
				opacity 0.3s ease;
		}

		span.practitioner-photo {
			scale: 0.9;
			transition:
				opacity 0.3s ease,
				scale 0.4s cubic-bezier(0.22, 1, 0.36, 1);
		}

		span.practitioner-photo.active {
			scale: 1;
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		span.practitioner-caret {
			transition: rotate 0.3s ease;
		}
	}

	/* Pinned: the stage sticks for four screens of scrolling, the treatments stack in one cell and crossfade, and the
	   background follows the active one. Needs room for the content under the header, motion, and JS (.pinned is set
	   once hydrated, so without it the treatments stay readable as bands) */
	@media screen and (min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference) {
		div.treatments-track.pinned {
			height: calc(var(--vh, 1vh) * 100 * 4);
		}

		div.treatments-track.pinned div.treatments-stage {
			position: sticky;
			top: 0;
			display: grid;
			height: calc(var(--vh, 1vh) * 100);
			padding-top: var(--header-height);
			background-color: var(--active-bg);
			transition: background-color 0.6s ease;
		}

		div.treatments-track.pinned article.treatment {
			grid-area: 1 / 1;
			background: none;
			pointer-events: none;
		}

		div.treatments-track.pinned article.treatment.active {
			pointer-events: auto;
		}

		/* Switch off the bands' group-stagger-fade entrance: its transform and per-child delays would fight the crossfade */
		div.treatments-track.pinned article.treatment > * {
			transform: none;
			transition-delay: 0s;
		}

		div.treatments-track.pinned div.treatment-text,
		div.treatments-track.pinned img.treatment-image {
			opacity: 0;
			transition:
				opacity 0.5s ease,
				translate 0.5s cubic-bezier(0.22, 1, 0.36, 1);
		}

		div.treatments-track.pinned div.treatment-text {
			translate: 0 1rem;
		}

		div.treatments-track.pinned article.treatment.active div.treatment-text,
		div.treatments-track.pinned article.treatment.active img.treatment-image {
			opacity: 1;
			translate: 0 0;
		}

		/* Fade the outgoing one first, so the two never read on top of each other */
		div.treatments-track.pinned article.treatment.active div.treatment-text {
			transition-delay: 0.15s;
		}
	}
</style>
