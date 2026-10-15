<!-- Header for the inner pages: a full-bleed photo with the page title set large in its bottom-left corner -->
<script lang="ts">
	import SpanifyText from "$lib/components/SpanifyText.svelte";
	import { isIntersecting } from "$lib/utils/isIntersecting";

	let { title, image }: { title: string; image: string } = $props();
</script>

<section class="hero page-hero">
	<img class="hero-image" src={image} alt="" />
	<h1 class="heading-fade-in" use:isIntersecting>
		<SpanifyText text={title} />
	</h1>
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

	h1 {
		position: relative;
		z-index: 1;
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
	}
</style>
