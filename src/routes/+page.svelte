<script lang="ts">
	import SeoHead from "$lib/components/SeoHead.svelte";
	import PrimaryButton from "$lib/components/PrimaryButton.svelte";

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
		<div class="hero-content">
			<p class="script-overlay" aria-hidden="true">Madhu Collective</p>
			<h1>A welcoming space for <em>movement</em>, <em>healing</em> and <em>community</em>.</h1>
			<p class="subheading">Find your flow in downtown Rossland.</p>
			<div class="hero-buttons">
				<PrimaryButton href="/treatments-practitioners" text="Book An Appointment" light />
				<PrimaryButton href="/classes-events" text="Explore Classes" primary={false} light />
			</div>
		</div>
		<svg class="hero-badge" viewBox="0 0 200 200" aria-hidden="true">
			<path id="badge-circle" d="M 100,100 m -66,0 a 66,66 0 1,1 132,0 a 66,66 0 1,1 -132,0" fill="none" />
			<text>
				<textPath href="#badge-circle" textLength="400" lengthAdjust="spacing">Connect • Move • Breathe •</textPath>
			</text>
		</svg>
	</section>

	<section class="offerings">
		<div class="offerings-intro">
			<div class="heading-wrap">
				<p class="script-overlay" aria-hidden="true">Our Offerings</p>
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
		<p class="script-overlay" aria-hidden="true">Newsletter</p>
		<div class="newsletter-text">
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
	/* Decorative script text behind headings */
	p.script-overlay {
		position: absolute;
		font-family: var(--font-heading);
		font-size: 72px;
		letter-spacing: 0.05em;
		line-height: 1;
		white-space: nowrap;
		pointer-events: none;
		user-select: none;
		transform: rotate(-5deg);
		transform-origin: left bottom;
	}

	h1,
	h2 {
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

	div.hero-content p.script-overlay {
		left: -0.25em;
		top: -0.6em;
		color: var(--color-script-cream);
	}

	div.hero-content h1 {
		color: var(--color-cream);
		font-size: 40px;
		line-height: 0.95;
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

	svg.hero-badge {
		display: none;
		position: absolute;
		z-index: 1;
		right: 58px;
		bottom: 109px;
		width: 191px;
		height: 191px;
		overflow: visible;
		fill: var(--color-white);
		font-size: 24px;
		transform: rotate(-40deg);
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

	div.heading-wrap p.script-overlay,
	section.newsletter p.script-overlay {
		color: var(--color-script-brown);
	}

	div.heading-wrap p.script-overlay {
		left: -0.2em;
		top: -0.7em;
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

	section.newsletter p.script-overlay {
		left: 14px;
		top: 0;
		transform: rotate(-7deg);
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
			padding-bottom: 82px;
		}

		svg.hero-badge {
			display: block;
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
		p.script-overlay {
			font-size: 128px;
		}

		div.hero-content h1 {
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
</style>
