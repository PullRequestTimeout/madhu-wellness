<script lang="ts">
	import SeoHead from "$lib/components/SeoHead.svelte";
	import SpanifyText from "$lib/components/SpanifyText.svelte";
	import { isIntersecting } from "$lib/utils/isIntersecting";
</script>

<SeoHead title="About Us | Madhu Wellness Collective" description="Meet the people and the story behind Madhu Wellness Collective." />

<main>
	<section class="hero">
		<img class="hero-image" src="/assets/images/hero-about.jpg" alt="" />
		<div class="hero-text">
			<h1>About Us</h1>
			<h2 class="decorative-heading">Rooted in community</h2>
			<p class="subheading">Placeholder line about the collective's story.</p>
		</div>
	</section>

	<section class="story">
		<h2 class="long-heading heading-fade-in" use:isIntersecting>
			<SpanifyText text="Madhu began with a simple idea: wellness is better shared." />
		</h2>
		<p class="text-light scroll-fade-up" use:isIntersecting>Placeholder body copy telling the story of how the collective started.</p>
		<div class="story-points group-stagger-fade" use:isIntersecting>
			<div class="story-point">
				<p class="text-semi-bold">Our mission</p>
				<p class="text-light">Placeholder mission statement.</p>
			</div>
			<div class="story-point">
				<p class="text-semi-bold">Our values</p>
				<p class="text-light">Placeholder values.</p>
			</div>
			<div class="story-point">
				<p class="text-semi-bold">Our space</p>
				<p class="text-light">Placeholder description of the studio.</p>
			</div>
		</div>
	</section>
</main>

<style>
	section.story {
		display: grid;
		gap: var(--spacing-l);
		font-size: var(--font-body-m);
	}

	div.story-points {
		display: grid;
		gap: var(--spacing-l);
	}

	div.story-point {
		display: grid;
		gap: var(--spacing-s);
	}

	@media screen and (min-width: 768px) {
		div.story-points {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
