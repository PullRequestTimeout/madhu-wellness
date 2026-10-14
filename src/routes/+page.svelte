<script lang="ts">
	import SeoHead from "$lib/components/SeoHead.svelte";
	import PrimaryButton from "$lib/components/PrimaryButton.svelte";
	import SpanifyText from "$lib/components/SpanifyText.svelte";
	import { isIntersecting } from "$lib/utils/isIntersecting";

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

	$effect(() => {
		const circumference = 2 * Math.PI * 66;
		const wide = window.matchMedia("(min-width: 1024px)");
		// Each word's angle on the unrotated ring, in degrees clockwise from 3 o'clock
		let wordAngles: number[] = [];

		const fit = () => {
			if (!badgeText || !wide.matches) return;
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
		{ text: "Practitioners", href: "/treatments-practitioners", img: "/assets/images/card-practitioners.png" },
		{ text: "Events Schedule", href: "/classes-events", img: "/assets/images/card-events.jpg" }
	];
</script>

<SeoHead />

<main>
	<section class="hero">
		<img class="hero-image" src="/assets/images/hero-home.png" alt="" width="1024" height="683" />
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
				<h2>A place to care for yourself and connect with others.</h2>
			</div>
			<p class="body-large">
				We are a diverse community of practitioners, teachers and facilitators offering space to move, heal, learn and connect.
			</p>
		</div>
		<div class="offering-cards">
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
	</section>

	<!-- Placeholder: the design has an empty "VIDEO" frame here -->
	<section class="video">
		<p>VIDEO</p>
	</section>

	<section class="newsletter">
		<div class="newsletter-text">
			<p class="eyebrow" aria-hidden="true">Newsletter</p>
			<h2>Keep in touch with us.</h2>
			<p class="body-large">Stay up to date with upcoming events, new practitioners, and what’s happening in our community.</p>
		</div>
		<!-- TODO: connect to a newsletter provider -->
		<form class="newsletter-form" onsubmit={(e) => e.preventDefault()}>
			<label class="visually-hidden" for="newsletter-email">Email</label>
			<input id="newsletter-email" type="email" name="email" placeholder="Enter your email" autocomplete="email" required />
			<div class="newsletter-actions">
				<p class="fine-print">By signing up you agree to the <a href="/privacy">privacy policy</a></p>
				<PrimaryButton type="submit" text="Sign Up" />
			</div>
		</form>
	</section>
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
		gap: var(--spacing-l);
		width: 100%;
		max-width: 887px;
	}

	p.tagline {
		color: var(--color-cream);
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
		gap: var(--spacing-l);
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
		gap: var(--spacing-xl);
		padding-block: 64px;
		color: var(--color-text);
	}

	section.offerings::before,
	section.newsletter::before {
		content: "";
		position: absolute;
		inset: 0;
		background-size: 1024px 1024px;
		background-position: top left;
		pointer-events: none;
	}

	section.offerings::before {
		background-image: url(/assets/images/texture-offerings.png);
		opacity: 0.5;
	}

	div.offerings-intro {
		position: relative;
		display: grid;
		gap: var(--spacing-l);
	}

	div.heading-wrap {
		position: relative;
	}

	section.offerings h2,
	section.newsletter h2 {
		font-size: 28px;
		line-height: 1.05;
	}

	div.offering-cards {
		position: relative;
		display: grid;
		gap: var(--spacing-l);
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

	/* Video placeholder */
	section.video {
		display: grid;
		place-items: center;
		height: 632px;
		max-height: 70vh;
		background-color: #d9d9d9;
		font-size: 96px;
	}

	/* Newsletter */
	section.newsletter {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-l);
		padding-block: 64px;
		background-color: var(--color-background-peach);
		color: var(--color-text);
	}

	section.newsletter::before {
		background-image: url(/assets/images/texture-newsletter.png);
		opacity: 0.79;
	}

	div.newsletter-text {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-m);
		max-width: 538px;
	}

	form.newsletter-form {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: var(--spacing-s);
	}

	form.newsletter-form input {
		width: 100%;
		height: 38px;
		padding-inline: 16px;
		border: var(--border-width) solid var(--color-text);
		border-radius: 8px;
		background: none;
		color: var(--color-text);
		font-size: 14px;
		letter-spacing: 0.05em;
	}

	form.newsletter-form input::placeholder {
		color: var(--color-placeholder);
	}

	form.newsletter-form input:focus-visible {
		outline: var(--border-width) solid var(--color-primary);
		outline-offset: 2px;
	}

	div.newsletter-actions {
		display: flex;
		align-items: center;
		gap: var(--spacing-m);
	}

	p.fine-print {
		font-size: 10px;
		letter-spacing: 0.05em;
	}

	p.fine-print a {
		text-decoration: underline;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	@media (hover: hover) {
		a.offering-card:hover img.card-image {
			transform: scale(1.04);
		}

		a.offering-card:hover img.card-arrow {
			transform: translateX(4px);
		}
	}

	@media screen and (min-width: 768px) {
		div.offering-cards {
			grid-template-columns: repeat(2, minmax(0, 1fr));
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

		section.newsletter {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}

		form.newsletter-form {
			align-items: stretch;
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

		section.offerings h2,
		section.newsletter h2 {
			font-size: 32px;
		}

		section.offerings,
		section.newsletter {
			padding-block: 96px;
		}
	}

	/* The badge only makes sense spinning, so drop it entirely. Last so it beats the 1024px display: block */
	@media (prefers-reduced-motion: reduce) {
		div.hero-badge {
			display: none;
		}
	}
</style>
