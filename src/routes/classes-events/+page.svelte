<script lang="ts">
	import SeoHead from "$lib/components/SeoHead.svelte";
	import SpanifyText from "$lib/components/SpanifyText.svelte";
	import { isIntersecting } from "$lib/utils/isIntersecting";
</script>

<SeoHead
	title="Classes & Events | Madhu Wellness Collective"
	description="Browse weekly classes, workshops and community events at Madhu Wellness Collective."
/>

<main>
	<section class="hero">
		<img class="hero-image" src="/assets/images/hero-classes-events.jpg" alt="" />
		<div class="hero-text">
			<h1>Classes & Events</h1>
			<h2 class="decorative-heading">Move, learn, gather</h2>
			<p class="subheading">Placeholder line about the class and event program.</p>
		</div>
	</section>

	<section class="classes">
		<h2 class="long-heading heading-fade-in" use:isIntersecting>
			<SpanifyText text="Weekly classes for every body and every level." />
		</h2>
		<div class="classes-list group-stagger-fade" use:isIntersecting>
			<div class="classes-item">
				<p class="text-semi-bold">Class name</p>
				<p class="text-light">Placeholder day, time and description.</p>
			</div>
			<div class="classes-item">
				<p class="text-semi-bold">Class name</p>
				<p class="text-light">Placeholder day, time and description.</p>
			</div>
			<div class="classes-item">
				<p class="text-semi-bold">Class name</p>
				<p class="text-light">Placeholder day, time and description.</p>
			</div>
		</div>
	</section>

	<section class="events bg-green">
		<h2 class="decorative-heading">Upcoming events</h2>
		<p class="text-light scroll-fade-up" use:isIntersecting>Placeholder list of workshops, retreats and community events.</p>
	</section>
</main>

<style>
	section.classes,
	section.events {
		display: grid;
		gap: var(--spacing-l);
		font-size: var(--font-body-m);
	}

	div.classes-list {
		display: grid;
		gap: var(--spacing-l);
	}

	div.classes-item {
		display: grid;
		gap: var(--spacing-s);
	}

	@media screen and (min-width: 768px) {
		div.classes-list {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
