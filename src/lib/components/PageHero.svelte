<!-- Header for the inner pages: a full-bleed photo with the page title set large in its bottom-left corner,
     over a faint script copy of the title in lower case -->
<script lang="ts">
	import SpanifyText from "$lib/components/SpanifyText.svelte";
	import { isIntersecting } from "$lib/utils/isIntersecting";

	// focus: the photo's object-position, for a photo whose subject sits off-centre (centred by default).
	// mobileFocus overrides it below 1024px, where the taller hero crops the photo from the sides instead.
	let { title, image, focus, mobileFocus }: { title: string; image: string; focus?: string; mobileFocus?: string } = $props();
</script>

<svelte:head>
	<!-- Starts the hero photo downloading before the parser reaches it in the (CSS-inlined) body -->
	<link rel="preload" as="image" href={image} fetchpriority="high" />
</svelte:head>

<section class="hero page-hero">
	<img class="hero-image" src={image} alt="" fetchpriority="high" style:--focus={focus} style:--focus-mobile={mobileFocus} />
	<div class="page-hero-title">
		<p class="eyebrow light" aria-hidden="true">{title.toLowerCase()}</p>
		<h1 class="heading-fade-in" use:isIntersecting>
			<SpanifyText text={title} />
		</h1>
	</div>
</section>

<style>
	/* 659px tall in the 1440px design, about three-quarters of a desktop screen. Shorter on phones so the content below peeks in */
	section.page-hero {
		height: calc(var(--vh, 1vh) * 60);
		min-height: 360px;
		max-height: 720px;
	}

	section.page-hero::after {
		content: "";
		position: absolute;
		inset: 0;
		background-color: var(--color-overlay-hero);
	}

	img.hero-image {
		object-position: var(--focus-mobile, var(--focus, center));
	}

	div.page-hero-title {
		position: relative;
		z-index: 1;
	}

	/* Sized from the title rather than the usual eyebrow scale (about 115px on phones, 205px from 1280px),
	   fainter, and sitting lower so it runs behind it */
	p.eyebrow {
		top: -0.2em;
		color: var(--color-script-cream-faint);
		font-size: calc(var(--font-heading-l) * 3.2);
	}

	/* Sits above the script */
	h1 {
		position: relative;
		color: var(--color-white);
		font-family: var(--font-body);
		font-size: var(--font-heading-l);
		font-weight: 600;
		line-height: 1;
	}

	@media screen and (min-width: 1024px) {
		section.page-hero {
			height: calc(var(--vh, 1vh) * 75);
			padding-bottom: 82px; /* Level with the homepage hero's content */
		}

		img.hero-image {
			object-position: var(--focus, center);
		}
	}
</style>
