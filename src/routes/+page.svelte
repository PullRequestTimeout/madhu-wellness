<script lang="ts">
	import SeoHead from "$lib/components/SeoHead.svelte";
	import PrimaryButton from "$lib/components/PrimaryButton.svelte";
	import SpanifyText from "$lib/components/SpanifyText.svelte";
	import { isIntersecting } from "$lib/utils/isIntersecting";
	import { homeFaqs } from "$lib/data/faqs";
</script>

<SeoHead />

<svelte:head>
	<style>
		section.hero {
			background: var(--color-primary-light) url(/assets/images/hero-home.jpg) center/cover no-repeat;
		}
	</style>
</svelte:head>

<main>
	<section class="hero">
		<div class="hero-text">
			<h1>Madhu Wellness Collective</h1>
			<h2 class="decorative-heading">A sweeter way to feel well</h2>
			<p class="subheading">Classes, events and holistic treatments with practitioners you can trust.</p>
			<div class="hero-buttons">
				<PrimaryButton href="/classes-events" text="Explore classes" />
				<PrimaryButton href="/treatments-practitioners" text="Book a treatment" primary={false} />
			</div>
		</div>
	</section>

	<section class="welcome">
		<h2 class="long-heading heading-fade-in" use:isIntersecting>
			<SpanifyText text="A collective of practitioners caring for body, mind and community." />
		</h2>
		<p class="text-light scroll-fade-up" use:isIntersecting>
			Placeholder copy. Introduce the collective, what makes it different, and who it is for.
		</p>
		<div class="welcome-points group-stagger-fade" use:isIntersecting>
			<div class="welcome-point">
				<p class="icon-heading"><span class="material-icons">self_improvement</span><span>Classes</span></p>
				<p class="text-light">Placeholder description of weekly classes.</p>
			</div>
			<div class="welcome-point">
				<p class="icon-heading"><span class="material-icons">event</span><span>Events</span></p>
				<p class="text-light">Placeholder description of workshops and events.</p>
			</div>
			<div class="welcome-point">
				<p class="icon-heading"><span class="material-icons">spa</span><span>Treatments</span></p>
				<p class="text-light">Placeholder description of one-on-one treatments.</p>
			</div>
		</div>
	</section>

	<section class="faq bg-tan">
		<h2 class="decorative-heading">Questions</h2>
		{#each homeFaqs as faq}
			<div class="faq-item scroll-fade-up" use:isIntersecting>
				<p class="text-semi-bold">{faq.question}</p>
				{#each faq.answer as answer}
					{#if answer.element === "p"}
						<p class="text-light">{answer.content}</p>
					{:else if answer.element === "ul"}
						<ul class="text-light">
							{#each answer.content as item}
								<li>{item}</li>
							{/each}
						</ul>
					{:else if answer.element === "a"}
						<a href={answer.content.href}>{answer.content.text}</a>
					{/if}
				{/each}
			</div>
		{/each}
	</section>
</main>

<style>
	div.hero-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-m);
	}

	section.welcome {
		display: grid;
		gap: var(--spacing-l);
		font-size: var(--font-body-m);
	}

	div.welcome-points {
		display: grid;
		gap: var(--spacing-l);
	}

	div.welcome-point {
		display: grid;
		gap: var(--spacing-s);
	}

	p.icon-heading {
		align-items: center;
		font-size: var(--font-heading-s);
		font-weight: 600;
		color: var(--color-primary);
	}

	section.faq {
		display: grid;
		gap: var(--spacing-m);
		font-size: var(--font-body-m);
	}

	div.faq-item {
		display: grid;
		gap: var(--spacing-s);
	}

	@media screen and (min-width: 768px) {
		div.welcome-points {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
