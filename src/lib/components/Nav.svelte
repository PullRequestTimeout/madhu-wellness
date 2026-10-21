<script lang="ts">
	import { page } from "$app/state";
	import { afterNavigate } from "$app/navigation";
	import { fade, slide } from "svelte/transition";
	import PrimaryButton from "$lib/components/PrimaryButton.svelte";
	import { clickOutside } from "$lib/utils/clickOutside";
	import { isIntersecting } from "$lib/utils/isIntersecting";
	import { navLinks } from "$lib/data/navLinks";
	import { openContact } from "$lib/utils/globalStates.svelte";
	import { contact } from "$lib/data/contact";

	let showMobileMenu = $state(false);
	let scrollY = $state(0);
	// Nav is transparent only while it overlays a hero image
	let hasHero = $state(true);
	const scrolled = $derived(scrollY > 0 || showMobileMenu || !hasHero);

	// Menu transitions run instantly for reduced motion, and from 1024px where the small-screen header is hidden
	// (a slide on a hidden element has no height to animate)
	const motion = (ms: number) => (window.matchMedia("(prefers-reduced-motion: reduce), (min-width: 1024px)").matches ? 0 : ms);

	let hamburger: HTMLButtonElement;

	function closeOnEscape(event: KeyboardEvent) {
		if (event.key !== "Escape" || !showMobileMenu) return;
		showMobileMenu = false;
		hamburger.focus();
	}

	// The small-screen header is hidden from 1024px, so an open menu there would be stranded
	function closeOnDesktop() {
		if (showMobileMenu && window.matchMedia("(min-width: 1024px)").matches) showMobileMenu = false;
	}

	afterNavigate(() => {
		hasHero = document.querySelector("section.hero") !== null;
	});
</script>

<svelte:window bind:scrollY onkeydown={closeOnEscape} onresize={closeOnDesktop} />

<header class="small-screens" class:scrolled use:clickOutside onoutclick={() => (showMobileMenu = false)}>
	<div class="nav-bar">
		<a href="/" aria-label="Home" onclick={() => (showMobileMenu = false)}>
			<span class="site-logo" aria-hidden="true"></span>
		</a>
		<button
			bind:this={hamburger}
			class="nav-hamburger"
			aria-label="Toggle menu"
			aria-expanded={showMobileMenu}
			onclick={() => (showMobileMenu = !showMobileMenu)}
		>
			<svg class="hamburgericon" class:active={showMobileMenu} viewBox="0 0 100 100" aria-hidden="true">
				<path class="line top" d="M 20,30 H 80" />
				<path class="line middle" d="M 20,50 H 80" />
				<path class="line bottom" d="M 20,70 H 80" />
			</svg>
		</button>
	</div>

	{#if showMobileMenu}
		<nav transition:slide={{ duration: motion(400) }}>
			<!-- Sized here rather than on the nav, as slide animates the nav's height -->
			<div class="nav-menu group-stagger-fade" use:isIntersecting>
				{#each navLinks as link}
					<a href={link.href} class={page.url.pathname === link.href ? "active" : ""} onclick={() => (showMobileMenu = false)}>
						{link.text}
					</a>
					<hr />
				{/each}
				<!-- Opens the contact form instead of navigating -->
				<button
					class="nav-contact"
					aria-haspopup="dialog"
					onclick={() => {
						showMobileMenu = false;
						openContact();
					}}
				>
					Contact
				</button>
				<hr />
				<div class="nav-cta">
					<PrimaryButton href={contact.bookingHref} text="Book Now" onAction={() => (showMobileMenu = false)} />
				</div>
			</div>
		</nav>
	{/if}
</header>

{#if showMobileMenu}
	<!-- Sits under the header; a click on it closes the menu through the header's clickOutside -->
	<div class="nav-backdrop modal-backdrop" aria-hidden="true" transition:fade={{ duration: motion(400) }}></div>
{/if}

<header class="large-screens" class:scrolled>
	<a href="/" aria-label="Home">
		<span class="site-logo" aria-hidden="true"></span>
	</a>
	<nav>
		{#each navLinks as link}
			<a href={link.href} class={page.url.pathname === link.href ? "active" : ""}>{link.text}</a>
		{/each}
		<button class="nav-contact" aria-haspopup="dialog" onclick={openContact}>Contact</button>
	</nav>
	<PrimaryButton href={contact.bookingHref} text="Book Now" light={!scrolled} />
</header>

<style>
	header {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 1000;
		width: 100vw;
		padding: 16px var(--padding-inline);
		/* Text, lines and logo colour: white over the hero, primary on cream */
		--nav-fg: var(--color-white);
		transition:
			background-color 0.3s ease,
			box-shadow 0.3s ease;
	}

	header.scrolled {
		--nav-fg: var(--color-primary);
		background-color: var(--color-cream);
		box-shadow: var(--shadow);
	}

	/* The logo SVGs are white only, so it's drawn through a mask to let its colour transition with the nav */
	span.site-logo {
		display: block;
		width: 120px;
		height: 54px;
		background-color: var(--nav-fg);
		-webkit-mask: url("/assets/svgs/logo-white.svg") center / contain no-repeat;
		mask: url("/assets/svgs/logo-white.svg") center / contain no-repeat;
		transition: background-color 0.3s ease;
	}

	@media (forced-colors: active) {
		span.site-logo {
			background-color: CanvasText;
		}
	}

	/* Book Now swaps from the light pill to the dark one; fade it instead of PrimaryButton's instant background swap */
	/* Not while hovered, so PrimaryButton's own hover timing still applies */
	header :global(a.primary:not(:hover)) {
		transition:
			color 0.3s ease,
			background-color 0.3s ease;
	}

	header :global(a.primary div.circle) {
		transition:
			clip-path 0.2s ease-out,
			background-color 0.3s ease;
	}

	header :global(a.primary div.circle span.arrow) {
		transition: color 0.3s ease;
	}

	/* Small screens */
	header.small-screens {
		display: block;
		/* On short screens the open menu scrolls rather than running off the bottom */
		max-height: 100dvh;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	header.large-screens {
		display: none;
	}

	div.nav-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	button.nav-hamburger {
		background: none;
		border: 0;
		padding: 0;
	}

	svg.hamburgericon {
		width: 3rem;
		height: 3rem;
	}

	svg.hamburgericon path.line {
		fill: none;
		stroke: var(--nav-fg);
		stroke-width: 6;
		stroke-linecap: round;
		/* Rotate around the icon's centre (50, 50), not each line's own box */
		transform-box: view-box;
		transform-origin: 50% 50%;
		transition:
			transform 0.3s ease,
			opacity 0.3s ease,
			stroke 0.3s ease;
	}

	svg.hamburgericon.active path.top {
		/* Listed right to left: move to the centre line first, then rotate, so both strokes cross at the centre */
		transform: rotate(45deg) translateY(20px);
	}

	svg.hamburgericon.active path.middle {
		opacity: 0;
	}

	svg.hamburgericon.active path.bottom {
		transform: rotate(-45deg) translateY(-20px);
	}

	@media (prefers-reduced-motion: reduce) {
		header,
		span.site-logo,
		svg.hamburgericon path.line,
		header.large-screens nav > a,
		header.large-screens nav > button.nav-contact,
		header.large-screens nav > a::after,
		header.large-screens nav > button.nav-contact::after,
		header :global(a.primary:not(:hover)),
		header :global(a.primary div.circle),
		header :global(a.primary div.circle span.arrow) {
			transition: none;
		}
	}

	header.small-screens nav {
		padding-block: var(--spacing-m) var(--spacing-l);
	}

	/* The open header fills about 80% of the screen, with the links kept together and centred in the space */
	div.nav-menu {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--spacing-m);
		/* --vh is measured once at load, so dvh caps it after a rotation */
		min-height: calc(min(var(--vh, 1vh) * 80, 80dvh) - var(--header-height) - var(--spacing-m) - var(--spacing-l));
	}

	div.nav-backdrop {
		position: fixed;
		inset: 0;
		z-index: 999; /* Just under the header */
	}

	/* Contact is a button but looks like the links around it */
	button.nav-contact {
		background: none;
		border: 0;
		padding: 0;
		text-align: left;
	}

	header.small-screens nav a,
	header.small-screens nav button.nav-contact {
		font-size: var(--font-body-l);
		font-weight: 500;
		letter-spacing: 0.8px;
		color: var(--nav-fg);
	}

	header.small-screens nav a.active {
		font-weight: 700;
	}

	header.small-screens nav hr {
		border: 0;
		/* Dimmed through the colour, not opacity, so the stagger fade can still animate it */
		border-top: 1px solid color-mix(in srgb, var(--nav-fg) 30%, transparent);
	}

	/* Large screens */
	@media screen and (min-width: 1024px) {
		header.small-screens,
		div.nav-backdrop {
			display: none;
		}

		header.large-screens {
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		header.large-screens nav {
			display: flex;
			align-items: center;
			gap: 24px;
		}

		header.large-screens nav > a,
		header.large-screens nav > button.nav-contact {
			position: relative;
			font-size: 16px;
			font-weight: 500;
			letter-spacing: 0.8px;
			color: var(--nav-fg);
			transition: color 0.3s ease;
		}

		header.large-screens nav > a::after,
		header.large-screens nav > button.nav-contact::after {
			content: "";
			position: absolute;
			left: 0;
			bottom: calc(var(--spacing-xs) * -1);
			width: 0;
			height: var(--border-width);
			background-color: var(--nav-fg);
			transition: width 0.3s ease;
		}
	}

	@media screen and (min-width: 1024px) and (hover: hover) {
		header.large-screens nav > a.active::after,
		header.large-screens nav > a:hover::after,
		header.large-screens nav > button.nav-contact:hover::after {
			width: 100%;
		}
	}
</style>
