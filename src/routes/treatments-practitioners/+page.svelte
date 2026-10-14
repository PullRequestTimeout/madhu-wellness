<script lang="ts">
	import SeoHead from "$lib/components/SeoHead.svelte";
	import SpanifyText from "$lib/components/SpanifyText.svelte";
	import { isIntersecting } from "$lib/utils/isIntersecting";
</script>

<SeoHead
	title="Treatments & Practitioners | Madhu Wellness Collective"
	description="Explore holistic treatments and meet the practitioners of Madhu Wellness Collective."
/>

<main>
	<section class="hero">
		<img class="hero-image" src="/assets/images/hero-treatments.jpg" alt="" />
		<div class="hero-text">
			<h1>Treatments & Practitioners</h1>
			<h2 class="decorative-heading">Care, one on one</h2>
			<p class="subheading">Placeholder line about the treatments on offer.</p>
		</div>
	</section>

	<section class="treatments">
		<h2 class="long-heading heading-fade-in" use:isIntersecting>
			<SpanifyText text="Treatments tailored to you, from practitioners who listen." />
		</h2>
		<div class="treatments-list group-stagger-fade" use:isIntersecting>
			<div class="treatments-item">
				<p class="text-semi-bold">Treatment name</p>
				<p class="text-light">Placeholder description, length and price.</p>
			</div>
			<div class="treatments-item">
				<p class="text-semi-bold">Treatment name</p>
				<p class="text-light">Placeholder description, length and price.</p>
			</div>
			<div class="treatments-item">
				<p class="text-semi-bold">Treatment name</p>
				<p class="text-light">Placeholder description, length and price.</p>
			</div>
		</div>
	</section>

	<section class="practitioners bg-tan">
		<h2 class="decorative-heading">Our practitioners</h2>
		<div class="practitioners-list group-stagger-fade" use:isIntersecting>
			<div class="practitioners-item">
				<p class="text-semi-bold">Practitioner name</p>
				<p class="text-light">Placeholder bio and specialties.</p>
			</div>
			<div class="practitioners-item">
				<p class="text-semi-bold">Practitioner name</p>
				<p class="text-light">Placeholder bio and specialties.</p>
			</div>
		</div>
	</section>
</main>

<style>
	section.treatments,
	section.practitioners {
		display: grid;
		gap: var(--spacing-l);
		font-size: var(--font-body-m);
	}

	div.treatments-list,
	div.practitioners-list {
		display: grid;
		gap: var(--spacing-l);
	}

	div.treatments-item,
	div.practitioners-item {
		display: grid;
		gap: var(--spacing-s);
	}

	@media screen and (min-width: 768px) {
		div.treatments-list {
			grid-template-columns: repeat(3, 1fr);
		}

		div.practitioners-list {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
