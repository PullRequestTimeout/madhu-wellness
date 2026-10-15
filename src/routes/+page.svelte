<script lang="ts">
	import SeoHead from "$lib/components/SeoHead.svelte";
	import PrimaryButton from "$lib/components/PrimaryButton.svelte";
	import Newsletter from "$lib/components/Newsletter.svelte";
	import SpanifyText from "$lib/components/SpanifyText.svelte";
	import { isIntersecting } from "$lib/utils/isIntersecting";
	import { scrollProgress } from "$lib/utils/scrollProgress";
	import { enterProgress } from "$lib/utils/enterProgress";

	// Split around the <em> words, each part carrying on the letter stagger from the last
	const tagline = [
		{ text: "A welcoming space for " },
		{ text: "movement", em: true },
		{ text: ", " },
		{ text: "healing", em: true },
		{ text: " and " },
		{ text: "community", em: true },
		{ text: "." }
	].map((part, i, parts) => ({ ...part, offset: parts.slice(0, i).reduce((n, p) => n + p.text.length, 0) }));

	// The rest of the hero starts fading in 1s before the tagline's last letter has (SpanifyText staggers letters 25ms apart)
	const letterFadeMs = 1500;
	const taglineLength = tagline.reduce((n, p) => n + p.text.length, 0);
	const heroRevealDelayMs = (taglineLength - 1) * 25 + letterFadeMs - 1000;

	// Spread the badge text to exactly one lap of its r=66 circle. Chrome ignores textLength on
	// <textPath>, so measure it and set letter-spacing instead. It can only be measured while shown
	// (from 1024px), and needs the real font loaded.
	let badgeText = $state<SVGTextPathElement>();
	let badgeRing = $state<SVGSVGElement>();

	// The centre icon shows the word that most recently passed the top of the spinning ring
	const badgeWords = ["Connect", "Move", "Breathe"];
	let activeWord = $state(0);

	// Below 1024px the card rows spread just far enough to clear the quote, whose height depends on the screen width
	let quoteHeight = $state(0);

	$effect(() => {
		const circumference = 2 * Math.PI * 66;
		const wide = window.matchMedia("(min-width: 1024px)");
		// Each word's angle on the unrotated ring, in degrees clockwise from 3 o'clock
		let wordAngles: number[] = [];

		const fit = () => {
			// Nothing to measure while the badge is hidden (it's dropped entirely under reduced motion)
			if (!badgeText || !wide.matches || !badgeText.getNumberOfChars()) return;
			badgeText.style.letterSpacing = "0";
			const spacing = (circumference - badgeText.getComputedTextLength()) / badgeText.getNumberOfChars();
			badgeText.style.letterSpacing = `${spacing}px`;

			// The midpoint of a word's first and last glyph points at its centre
			const text = badgeText.textContent ?? "";
			wordAngles = badgeWords.map((word) => {
				const first = text.indexOf(word);
				const start = badgeText!.getStartPositionOfChar(first);
				const end = badgeText!.getEndPositionOfChar(first + word.length - 1);
				return (Math.atan2((start.y + end.y) / 2 - 100, (start.x + end.x) / 2 - 100) * 180) / Math.PI;
			});
		};

		// Follows the CSS spin (-40deg to 320deg), so it stays in sync whatever its duration.
		// With reduced motion there's no animation and the ring rests at -40deg.
		let frame = requestAnimationFrame(function track() {
			frame = requestAnimationFrame(track);
			if (!wordAngles.length) return;
			const progress = badgeRing?.getAnimations()[0]?.effect?.getComputedTiming().progress ?? 0;
			const rotation = -40 + 360 * progress;
			// How far each word has travelled past 12 o'clock (-90deg)
			const past = wordAngles.map((angle) => (((angle + rotation + 90) % 360) + 360) % 360);
			const latest = past.indexOf(Math.min(...past));
			if (latest !== activeWord) activeWord = latest;
		});

		document.fonts.ready.then(fit);
		wide.addEventListener("change", fit);
		return () => {
			cancelAnimationFrame(frame);
			wide.removeEventListener("change", fit);
		};
	});

	const offerings = [
		{ text: "Yoga Classes", href: "/classes-events", img: "/assets/images/card-yoga.jpg" },
		{ text: "Restorative Treatments", href: "/treatments-practitioners", img: "/assets/images/card-treatments.jpg" },
		{ text: "Practitioners", href: "/treatments-practitioners", img: "/assets/images/card-practitioners.webp" },
		{ text: "Events Schedule", href: "/classes-events", img: "/assets/images/card-events.jpg" }
	];
</script>

<SeoHead />

<main>
	<section class="hero">
		<img class="hero-image" src="/assets/images/hero-home.webp" alt="" width="1024" height="683" />
		<div class="hero-content" style="--letter-fade: {letterFadeMs}ms; --reveal-delay: {heroRevealDelayMs}ms">
			<hgroup>
				<h1 class="eyebrow light">Madhu Collective</h1>
				<p class="tagline heading-fade-in" use:isIntersecting>
					{#each tagline as part}{#if part.em}<em><SpanifyText text={part.text} offset={part.offset} /></em>{:else}<SpanifyText
								text={part.text}
								offset={part.offset}
							/>{/if}{/each}
				</p>
			</hgroup>
			<p class="subheading">Find your flow in downtown Rossland.</p>
			<div class="hero-buttons">
				<PrimaryButton href="/treatments-practitioners" text="Book An Appointment" light />
				<PrimaryButton href="/classes-events" text="Explore Classes" primary={false} light />
			</div>
		</div>
		<div class="hero-badge" aria-hidden="true">
			<svg class="badge-ring" bind:this={badgeRing} viewBox="0 0 200 200">
				<path id="badge-circle" d="M 100,100 m -66,0 a 66,66 0 1,1 132,0 a 66,66 0 1,1 -132,0" fill="none" />
				<text>
					<!-- Spaced to fill the circle in the script. The trailing nbsp spaces the last dot from the first letter like the others. -->
					<textPath bind:this={badgeText} href="#badge-circle">Connect • Move • Breathe •&nbsp;</textPath>
				</text>
			</svg>
			{#each badgeWords as word, i}
				<img class="badge-icon" class:active={activeWord === i} src="/assets/svgs/{word.toLowerCase()}.svg" alt="" width="72" height="72" />
			{/each}
		</div>
	</section>

	<section class="offerings">
		<div class="offerings-intro">
			<div class="heading-wrap">
				<p class="eyebrow" aria-hidden="true">Our Offerings</p>
				<h2 class="heading-fade-in" use:isIntersecting>
					<SpanifyText text="A place to care for yourself and connect with others." />
				</h2>
			</div>
			<p class="body-large">
				We are a diverse community of practitioners, teachers and facilitators offering space to move, heal, learn and connect.
			</p>
		</div>
		<!-- The stage pins mid-screen while the track scrolls past, and the cards (a row from 1024px, a 2×2 grid below) spread apart to uncover the quote stacked beneath them -->
		<div class="offerings-track" use:scrollProgress style:--quote-height="{quoteHeight}px">
			<div class="offerings-stage">
				<div class="offering-cards group-stagger-fade" use:isIntersecting>
					{#each offerings as offering}
						<a class="offering-card" href={offering.href}>
							<img class="card-image" src={offering.img} alt="" loading="lazy" />
							<span class="card-label">
								{offering.text}
								<img class="card-arrow" src="/assets/svgs/arrow-right.svg" alt="" width="24" height="24" />
							</span>
						</a>
					{/each}
				</div>
				<figure class="testimonial" bind:clientHeight={quoteHeight}>
					<blockquote>
						<p>
							An amazing space with such welcoming people. There are a variety of offerings from healing modalities and yoga to workshops for inner
							growth. A special community with a rich past and a bright future. I’ll never fall out of love with this place.
						</p>
					</blockquote>
					<figcaption>— <span class="testimonial-author">Joe</span></figcaption>
				</figure>
			</div>
		</div>
	</section>

	<!-- Placeholder: the design has an empty "VIDEO" frame here. It widens in over a flipped copy of the offerings texture -->
	<section class="video" use:enterProgress={{ end: 0.3 }}>
		<div class="video-frame"><p>VIDEO</p></div>
	</section>

	<Newsletter />
</main>

<style>
	/* Sit above the eyebrows */
	h2,
	p.tagline {
		position: relative;
		font-family: var(--font-body);
		font-weight: 600;
		text-wrap: wrap;
	}

	.body-large {
		font-size: 20px;
		letter-spacing: 0.05em;
	}

	/* Hero */
	section.hero {
		height: calc(var(--vh, 1vh) * 100);
		min-height: 560px;
	}

	img.hero-image {
		object-position: bottom;
	}

	section.hero::after {
		content: "";
		position: absolute;
		inset: 0;
		background-color: var(--color-overlay-hero);
	}

	div.hero-content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--spacing-m);
		width: 100%;
		max-width: 887px;
	}

	p.tagline {
		color: var(--color-white);
		font-size: 40px;
		line-height: 0.95;
	}

	/* Slower than the scroll-in headings: each letter fades over 1.5s rather than 0.5s */
	p.tagline :global(span) {
		transition-duration: var(--letter-fade);
	}

	/* Once the tagline has animated in, the rest of the hero fades in */
	div.hero-content h1,
	div.hero-content p.subheading,
	div.hero-buttons {
		opacity: 0;
		transition: opacity 1.5s ease-out var(--reveal-delay);
	}

	div.hero-content:has(:global(p.tagline.show)) :is(h1, p.subheading, div.hero-buttons) {
		opacity: 1;
	}

	div.hero-content p.subheading {
		color: var(--color-white);
		font-size: 18px;
		letter-spacing: 0.05em;
	}

	div.hero-buttons {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		/* Tighter when the buttons wrap onto two rows */
		gap: var(--spacing-m) var(--spacing-l);
		/* Tops up the content's spacing-m gap to spacing-l, setting the buttons apart from the text */
		margin-top: calc(var(--spacing-l) - var(--spacing-m));
	}

	div.hero-badge {
		display: none;
		position: absolute;
		z-index: 1;
		right: 58px;
		width: 191px;
		height: 191px;
	}

	svg.badge-ring {
		width: 100%;
		height: 100%;
		overflow: visible;
		fill: var(--color-white);
		font-size: 24px;
		transform: rotate(-40deg);
		animation: badge-spin 20s linear infinite;
	}

	@keyframes badge-spin {
		from {
			transform: rotate(-40deg);
		}
		to {
			transform: rotate(320deg);
		}
	}

	/* Stacked upright in the ring's centre; the outgoing and incoming icons crossfade */
	img.badge-icon {
		position: absolute;
		inset: 0;
		width: 72px;
		height: 72px;
		margin: auto;
		opacity: 0;
		transition: opacity 0.5s ease;
	}

	img.badge-icon.active {
		opacity: 1;
	}

	/* Offerings */
	section.offerings {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-l);
		color: var(--color-text);
	}

	section.offerings::before {
		content: "";
		position: absolute;
		inset: 0;
		background-size: 1024px 1024px;
		background-position: top left;
		pointer-events: none;
	}

	/* Stretched down rather than tiled, so its top edge doesn't repeat as a seam down the (tall, pinned) section
	   and it runs right down to the video. Across, it keeps at least its own 1024px width and the box crops the
	   rest, so narrow screens don't squash the grain */
	section.offerings::before {
		background-image: url(/assets/images/texture-offerings.webp);
		background-size: max(100%, 1024px) 100%;
		background-repeat: no-repeat;
		opacity: 0.5;
	}

	div.offerings-intro {
		position: relative;
		display: grid;
		gap: var(--spacing-m);
	}

	div.heading-wrap {
		position: relative;
	}

	section.offerings h2 {
		font-size: 28px;
		line-height: 1.05;
	}

	div.offering-cards {
		position: relative;
		display: grid;
		gap: var(--spacing-m);
	}

	a.offering-card {
		position: relative;
		display: flex;
		align-items: flex-end;
		min-height: 320px;
		padding: 16px;
		border-radius: 10px;
		box-shadow: var(--shadow);
		overflow: hidden;
	}

	/* Keep the global focus halo alongside the card's own shadow */
	a.offering-card:focus-visible {
		box-shadow:
			0 0 0 var(--border-width) var(--color-focus-halo),
			var(--shadow);
	}

	img.card-image {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.4s ease;
	}

	a.offering-card::after {
		content: "";
		position: absolute;
		inset: auto 0 0 0;
		height: 76px;
		background: linear-gradient(to bottom, #68381e00, #68381ebf 37.5%, var(--color-brown));
	}

	span.card-label {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		color: var(--color-white);
		font-size: 20px;
		font-weight: 500;
	}

	img.card-arrow {
		transition: transform 0.25s ease-out;
	}

	/* Testimonial. With reduced motion it simply follows the cards */
	div.offerings-stage {
		position: relative;
		display: grid;
		gap: var(--spacing-xl);
	}

	figure.testimonial {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-l);
		max-width: 800px;
		margin-inline: auto;
		text-align: center;
	}

	blockquote {
		--mark-size: 64px;
		position: relative;
		padding-inline: calc(var(--mark-size) * 0.6);
	}

	blockquote p {
		font-size: var(--font-body-m);
		line-height: 1.6;
		letter-spacing: 0.02em;
	}

	/* The marks' ink sits high in their line box, so the opening one is nudged up level with
	   the first line and the closing one down level with the last */
	blockquote::before,
	blockquote::after {
		position: absolute;
		color: var(--color-brown);
		font-size: var(--mark-size);
		font-weight: 700;
		line-height: 1;
	}

	blockquote::before {
		content: "“";
		top: 0;
		left: 0;
		transform: translateY(-15%);
	}

	blockquote::after {
		content: "”";
		right: 0;
		bottom: 0;
		transform: translateY(35%);
	}

	figcaption {
		color: var(--color-brown);
		font-family: var(--font-heading);
		font-size: 32px;
		line-height: 1;
	}

	/* The name is set twice the size of the dash before it */
	span.testimonial-author {
		font-family: var(--font-heading); /* Restated, as the global body-font rule matches every non-heading element */
		font-size: 2em;
	}

	/* Video placeholder. Opaque and stacked above the offerings, so the lowered cards slide under it once they unpin */
	section.video {
		position: relative;
		z-index: 1;
		display: grid;
		justify-items: center;
		height: 632px;
		max-height: 70vh;
		padding: 0;
		background-color: var(--color-background-peach);
	}

	/* The offerings texture flipped top to bottom, so it carries on seamlessly from the section above while the frame is still transparent */
	section.video::before {
		content: "";
		position: absolute;
		inset: 0;
		background-image: url(/assets/images/texture-offerings.webp);
		background-size: 100% 100%;
		background-repeat: no-repeat;
		opacity: 0.5;
		transform: scaleY(-1);
		pointer-events: none;
	}

	/* Widens from 80% to full bleed as the section scrolls in (--enter from enterProgress) */
	div.video-frame {
		position: relative;
		display: grid;
		place-items: center;
		width: calc(80% + 20% * var(--enter, 1));
		background-color: #d9d9d9;
		font-size: 96px;
	}

	@media (prefers-reduced-motion: reduce) {
		div.video-frame {
			width: 100%;
		}
	}

	@media (hover: hover) {
		a.offering-card:hover img.card-image {
			transform: scale(1.04);
		}

		a.offering-card:hover img.card-arrow {
			transform: translateX(4px);
		}
	}

	/* Off the usual breakpoints: two 320px-tall cards fit side by side well before 768px */
	@media screen and (min-width: 640px) {
		div.offering-cards {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media screen and (min-width: 768px) {
		section.offerings {
			gap: var(--spacing-xl);
		}

		/* The desktop card spread's --card-width maths assumes this gap */
		div.offering-cards {
			gap: var(--spacing-l);
		}

		div.offerings-intro {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--spacing-xl);
		}
	}

	@media screen and (min-width: 1024px) {
		section.hero {
			--hero-padding-bottom: 82px;
			padding-bottom: var(--hero-padding-bottom);
		}

		/* The lettering's outer edge is ~16px inside the SVG's bottom (r=66 circle plus cap height,
		   scaled 191/200), so this lines it up with the bottom of the hero buttons */
		div.hero-badge {
			display: block;
			bottom: calc(var(--hero-padding-bottom) - 16px);
		}

		div.offering-cards {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

	@media screen and (min-width: 1280px) {
		p.tagline {
			font-size: 64px;
			line-height: 1.05;
		}

		div.hero-content p.subheading,
		.body-large {
			font-size: 24px;
		}

		section.offerings h2 {
			font-size: 32px;
		}

		blockquote {
			--mark-size: 96px;
		}
	}

	/* Cards spread to reveal the testimonial. The cards pin mid-screen for 60% of a viewport's scrolling,
	   and --progress (0-1, from scrollProgress) drives two overlapping phases: the cards slide out of the
	   quote's way over the first 75%, and the quote fades up from 35% to 75%, landing with the cards. Scrolling back up rewinds it.
	   Shared here; the card layout and where each card goes are set per screen size below. */
	@media screen and (prefers-reduced-motion: no-preference) {
		div.offerings-track {
			--spread: clamp(0, var(--progress, 0) / 0.75, 1);
			/* Ease-in-out cubic, so the cards ease out of the row and ease into place. calc() can't branch, so the
			   spread is split at its midpoint: --ease-in runs 0-0.5 (then holds), --ease-out runs 0-1 over the second half,
			   and their curves sum to 4x³ for the first half and 1 - (2 - 2x)³ / 2 for the second */
			--ease-in: clamp(0, var(--spread), 0.5);
			--ease-out: clamp(0, var(--spread) * 2 - 1, 1);
			--ease: calc(
				4 * var(--ease-in) * var(--ease-in) * var(--ease-in) + (1 - (1 - var(--ease-out)) * (1 - var(--ease-out)) * (1 - var(--ease-out))) / 2
			);
			--reveal: clamp(0, (var(--progress, 0) - 0.35) / 0.4, 1);
			height: calc(var(--cards-height) + var(--vh, 1vh) * 60);
		}

		div.offerings-stage {
			position: sticky;
			top: calc(var(--vh, 1vh) * 50 - var(--cards-height) / 2);
		}

		/* The cards sit on top of the quote */
		div.offering-cards,
		figure.testimonial {
			grid-area: 1 / 1;
		}

		div.offering-cards {
			z-index: 1;
		}

		figure.testimonial {
			align-self: center;
			opacity: var(--reveal);
			transform: translateY(calc((1 - var(--reveal)) * 2rem)) scale(calc(0.96 + var(--reveal) * 0.04));
		}

		/* translate rather than transform, so it doesn't fight the group-stagger-fade entrance */
		a.offering-card {
			translate: calc(var(--x, 0px) * var(--ease)) calc(var(--y) * var(--ease));
			will-change: translate, scale;
		}
	}

	/* Below 1024px: a pinned 2×2 grid whose rows part vertically just far enough to clear the quote, while each card
	   shrinks to --end-scale and drifts towards its own side. Scaling is about the card's centre, so each edge pulls in
	   by half of what the card loses: the drift adds that back (plus any side padding beyond 1rem) so the outer edges
	   finish 1rem from the screen, and the rows travel that much less to leave the same 1rem gap around the quote */
	@media screen and (max-width: 1023.98px) and (prefers-reduced-motion: no-preference) {
		section.offerings {
			overflow-x: clip; /* Clips anything past the edges without breaking the sticky stage, as hidden would */
		}

		div.offerings-track {
			--card-height: clamp(180px, var(--vh, 1vh) * 26, 260px);
			--cards-height: calc(2 * var(--card-height) + var(--spacing-m));
			--end-scale: 0.85;
			--shrink: calc(var(--card-height) * (1 - var(--end-scale)) / 2);
			--row-shift: calc(var(--quote-height, 0px) / 2 + var(--spacing-m) / 2 - var(--shrink));
			/* Room for the lowered bottom row, so the video below doesn't cover it while it's still pinned */
			margin-bottom: calc(var(--row-shift) - var(--shrink) + var(--spacing-m)); /* + the bottom-left card's extra drop */
		}

		/* Centred in the space below the fixed header rather than the whole screen, so the raised top row stays clear of it */
		div.offerings-stage {
			top: calc(var(--header-height) + (var(--vh, 1vh) * 100 - var(--header-height) - var(--cards-height)) / 2);
		}

		a.offering-card {
			scale: calc(1 - (1 - var(--end-scale)) * var(--ease));
		}

		div.offering-cards {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--spacing-m);
		}

		a.offering-card {
			min-height: var(--card-height);
		}

		/* Half-width cards: the desktop 20px labels crowd the arrow */
		span.card-label {
			font-size: var(--font-body-m);
		}

		/* translate's % is of the card's own (unscaled) width, so (1 - scale) × 50% is what each side pulls in */
		a.offering-card {
			--drift: calc(var(--padding-inline) - var(--spacing-m) + (1 - var(--end-scale)) * 50%);
		}

		a.offering-card:nth-child(odd) {
			--x: calc(var(--drift) * -1);
		}

		a.offering-card:nth-child(even) {
			--x: var(--drift);
		}

		a.offering-card:nth-child(-n + 2) {
			--y: calc(var(--row-shift) * -1);
		}

		a.offering-card:nth-child(n + 3) {
			--y: var(--row-shift);
		}

		/* Staggered like the desktop spread: the top-right card rises 1rem further and the bottom-left drops 1rem further */
		a.offering-card:nth-child(2) {
			--y: calc(var(--row-shift) * -1 - var(--spacing-m));
		}

		a.offering-card:nth-child(3) {
			--y: calc(var(--row-shift) + var(--spacing-m));
		}
	}

	@media screen and (min-width: 1024px) and (prefers-reduced-motion: no-preference) {
		div.offerings-track {
			--card-height: 320px;
			--cards-height: var(--card-height);
		}

		/* A size container, so the quote can size itself from the cards' width in cqw */
		div.offerings-stage {
			--card-width: calc((100cqw - 3 * var(--spacing-l)) / 4);
			container-type: inline-size;
		}

		/* No wider than the middle two columns, so the outer cards never cover it */
		figure.testimonial {
			max-width: min(600px, 2 * var(--card-width) + var(--spacing-l));
		}

		/* Each card keeps its column and moves by its own --y (in viewport heights, since it's pinned mid-screen):
		   the inner pair go furthest, past the quote and partly off-screen, and the outer pair a little either side of it */
		a.offering-card:nth-child(1) {
			--y: calc(var(--vh, 1vh) * -27);
		}

		a.offering-card:nth-child(2) {
			--y: calc(var(--vh, 1vh) * 44);
		}

		a.offering-card:nth-child(3) {
			--y: calc(var(--vh, 1vh) * -49);
		}

		a.offering-card:nth-child(4) {
			--y: calc(var(--vh, 1vh) * 11);
		}
	}

	/* The badge only makes sense spinning, so drop it entirely. Last so it beats the 1024px display: block */
	@media (prefers-reduced-motion: reduce) {
		div.hero-badge {
			display: none;
		}
	}
</style>
