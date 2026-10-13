<script lang="ts">
	import { page } from "$app/state";
	import { fade, slide } from "svelte/transition";
	import PrimaryButton from "$lib/components/PrimaryButton.svelte";
	import { clickOutside } from "$lib/utils/clickOutside";
	import { navLinks } from "$lib/data/navLinks";

	let showMobileMenu = $state(false);
	let scrollY = $state(0);
	const scrolled = $derived(scrollY > 0 || showMobileMenu);
</script>

<svelte:window bind:scrollY />

<header class="small-screens" class:scrolled use:clickOutside onoutclick={() => (showMobileMenu = false)}>
	<div class="nav-bar">
		<a href="/" aria-label="Home" onclick={() => (showMobileMenu = false)}>
			<img class="site-logo" src="/assets/svgs/logo.svg" alt="Madhu Wellness Collective logo" />
		</a>
		<button class="nav-hamburger" aria-label="Toggle menu" aria-expanded={showMobileMenu} onclick={() => (showMobileMenu = !showMobileMenu)}>
			<svg class="hamburgericon" class:active={showMobileMenu} viewBox="0 0 100 100" aria-hidden="true">
				<path class="line top" d="M 20,30 H 80" />
				<path class="line middle" d="M 20,50 H 80" />
				<path class="line bottom" d="M 20,70 H 80" />
			</svg>
		</button>
	</div>

	{#if showMobileMenu}
		<nav transition:slide>
			{#each navLinks as link, i}
				<a
					href={link.href}
					class={page.url.pathname === link.href ? "active" : ""}
					onclick={() => (showMobileMenu = false)}
					in:fade={{ delay: (i + 1) * 100 }}
				>
					{link.text}
				</a>
				<hr in:fade={{ delay: (i + 1) * 100 }} />
			{/each}
			<div class="nav-cta" in:fade={{ delay: (navLinks.length + 1) * 100 }}>
				<PrimaryButton href="/classes-events" text="Book a class" onAction={() => (showMobileMenu = false)} />
			</div>
		</nav>
	{/if}
</header>

<header class="large-screens" class:scrolled>
	<a href="/" aria-label="Home">
		<img class="site-logo" src="/assets/svgs/logo.svg" alt="Madhu Wellness Collective logo" />
	</a>
	<nav>
		{#each navLinks as link}
			<a href={link.href} class={page.url.pathname === link.href ? "active" : ""}>{link.text}</a>
		{/each}
		<PrimaryButton href="/classes-events" text="Book a class" />
	</nav>
</header>

<style>
	header {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 1000;
		width: 100vw;
		padding: var(--spacing-xs) var(--padding-inline);
		transition:
			background-color 0.3s ease,
			box-shadow 0.3s ease;
	}

	header.scrolled {
		background-color: var(--color-background-white);
		box-shadow: var(--shadow);
	}

	img.site-logo {
		height: 3.5rem;
		width: auto;
	}

	/* Small screens */
	header.small-screens {
		display: block;
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
		stroke: var(--color-primary);
		stroke-width: 6;
		stroke-linecap: round;
		transform-origin: 50% 50%;
		transition:
			transform 0.3s ease,
			opacity 0.3s ease;
	}

	svg.hamburgericon.active path.top {
		transform: translateY(20%) rotate(45deg);
	}

	svg.hamburgericon.active path.middle {
		opacity: 0;
	}

	svg.hamburgericon.active path.bottom {
		transform: translateY(-20%) rotate(-45deg);
	}

	header.small-screens nav {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-m);
		padding-block: var(--spacing-m) var(--spacing-l);
	}

	header.small-screens nav a {
		font-size: var(--font-body-l);
		font-weight: 500;
		color: var(--color-primary);
	}

	header.small-screens nav a.active {
		font-weight: 700;
	}

	header.small-screens nav hr {
		border: 0;
		border-top: 1px solid var(--color-primary-transparent);
	}

	/* Large screens */
	@media screen and (min-width: 1024px) {
		header.small-screens {
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
			gap: var(--spacing-l);
		}

		header.large-screens nav > a {
			position: relative;
			font-size: var(--font-body-m);
			font-weight: 500;
			color: var(--color-primary);
		}

		header.large-screens nav > a::after {
			content: "";
			position: absolute;
			left: 0;
			bottom: calc(var(--spacing-xs) * -1);
			width: 0;
			height: 2px;
			background-color: var(--color-primary);
			transition: width 0.3s ease;
		}
	}

	@media screen and (min-width: 1024px) and (hover: hover) {
		header.large-screens nav > a.active::after,
		header.large-screens nav > a:hover::after {
			width: 100%;
		}
	}
</style>
