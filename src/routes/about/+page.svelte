<script lang="ts">
	import HandshakeIcon from "phosphor-svelte/lib/HandshakeIcon";
	import HandHeartIcon from "phosphor-svelte/lib/HandHeartIcon";
	import UsersThreeIcon from "phosphor-svelte/lib/UsersThreeIcon";
	import PlantIcon from "phosphor-svelte/lib/PlantIcon";
	import SeoHead from "$lib/components/SeoHead.svelte";
	import PageHero from "$lib/components/PageHero.svelte";
	import PrimaryButton from "$lib/components/PrimaryButton.svelte";
	import Newsletter from "$lib/components/Newsletter.svelte";
	import SpanifyText from "$lib/components/SpanifyText.svelte";
	import { isIntersecting } from "$lib/utils/isIntersecting";
	import { openContact } from "$lib/utils/globalStates.svelte";

	const values = [
		{ title: "Connection", text: "Creating meaningful relationships within our space and the wider community.", icon: HandshakeIcon },
		{ title: "Care", text: "Approaching our work with thoughtfulness, compassion and respect.", icon: HandHeartIcon },
		{ title: "Inclusivity", text: "Welcoming people from different backgrounds, experiences and walks of life.", icon: UsersThreeIcon },
		{ title: "Growth", text: "Supporting learning, personal development and new possibilities.", icon: PlantIcon }
	];

	// Headshots to come; until then each shows a placeholder circle
	const practitioners: { name: string; role: string; img?: string }[] = [
		{ name: "Claire Kearney", role: "Yoga Instructor / Registered Massage Therapist" },
		{ name: "Danielle Hachey", role: "Yoga Instructor" },
		{ name: "Nadine Klawitter", role: "Registered Massage Therapist" },
		{ name: "Jineya Naiker", role: "Canadian Certified Counsellor" }
	];
</script>

<SeoHead
	title="About Us | Madhu Wellness Collective"
	description="Madhu Collective is a shared space for movement, healing and connection in Rossland. Meet our values, our studio and our practitioners."
/>

<main>
	<PageHero title="About Us." image="/assets/images/hero-about.jpg" />

	<section class="values">
		<div class="values-intro">
			<div class="heading-wrap">
				<p class="eyebrow" aria-hidden="true">Our Values</p>
				<h2 class="heading-fade-in" use:isIntersecting>
					<SpanifyText text="A shared vision for wellbeing and community" />
				</h2>
			</div>
			<p class="body-large">
				Madhu Collective is built on a shared belief in the importance of connection, care and creating space for people to feel supported. These
				values shape how we work, how we welcome others and how we contribute to our community.
			</p>
		</div>
		<ul class="value-cards group-stagger-fade" use:isIntersecting>
			{#each values as value}
				{@const Icon = value.icon}
				<li class="value-card">
					<span class="value-icon"><Icon weight="light" aria-hidden="true" /></span>
					<h3>{value.title}</h3>
					<p>{value.text}</p>
				</li>
			{/each}
		</ul>
	</section>

	<section class="space">
		<div class="space-intro">
			<div class="heading-wrap">
				<p class="eyebrow" aria-hidden="true">The Space</p>
				<h2 class="heading-fade-in" use:isIntersecting>
					<SpanifyText text="A place for movement, healing and connection" />
				</h2>
			</div>
			<p class="body-large">
				Our space brings together a welcoming studio for movement and community alongside private rooms for individual care. Together, they create a
				place to learn, connect, and explore different approaches to wellbeing.
			</p>
		</div>
		<div class="space-gallery group-stagger-fade" use:isIntersecting>
			<img
				class="space-image"
				src="/assets/images/space-meditation.jpg"
				alt="A person meditating cross-legged on a wooden deck at sunrise"
				loading="lazy"
			/>
			<img class="space-image" src="/assets/images/space-massage.jpg" alt="A practitioner's hands massaging a client's back" loading="lazy" />
			<img
				class="space-image"
				src="/assets/images/space-counselling.jpg"
				alt="A person seated on a sofa with their hands clasped during a counselling session"
				loading="lazy"
			/>
			<img
				class="space-image"
				src="/assets/images/space-treatment.jpg"
				alt="A therapist working on a client's leg during a treatment"
				loading="lazy"
			/>
		</div>
	</section>

	<section class="people bg-tan">
		<div class="people-intro">
			<div class="heading-wrap">
				<p class="eyebrow" aria-hidden="true">Our People</p>
				<h2 class="heading-fade-in" use:isIntersecting>
					<SpanifyText text="Different practices, a shared commitment to care" />
				</h2>
			</div>
			<p class="body-large">
				Our practitioners bring diverse skills, experiences and perspectives to the collective, creating a space where different approaches to
				wellbeing can come together.
			</p>
		</div>
		<ul class="people-list group-stagger-fade" use:isIntersecting>
			{#each practitioners as person}
				<li class="person">
					{#if person.img}
						<img class="person-photo" src={person.img} alt="" loading="lazy" />
					{:else}
						<span class="person-photo" aria-hidden="true"></span>
					{/if}
					<h3>{person.name}</h3>
					<p>{person.role}</p>
				</li>
			{/each}
		</ul>
		<div class="people-buttons">
			<PrimaryButton href="/treatments-practitioners" text="Meet the Practitioners" />
			<PrimaryButton href="/treatments-practitioners" text="Explore Treatments" primary={false} />
		</div>
	</section>

	<section class="rental">
		<div class="rental-card scroll-fade-up" use:isIntersecting>
			<img class="rental-image" src="/assets/images/space-rental.jpg" alt="" loading="lazy" />
			<div class="rental-text">
				<div class="heading-wrap">
					<p class="eyebrow light" aria-hidden="true">Space Rental</p>
					<h2>A space for your next gathering</h2>
				</div>
				<p class="body-large">
					Our community continues to evolve, building on the many practitioners and practices that have found a home here over the years.
				</p>
				<PrimaryButton text="Enquire About Renting Madhu" light onAction={openContact} />
			</div>
		</div>
	</section>

	<Newsletter />
</main>

<style>
	/* Shared */
	div.heading-wrap {
		position: relative;
	}

	/* Sit above the eyebrows */
	h2 {
		position: relative;
		font-family: var(--font-body);
		font-size: 28px;
		font-weight: 600;
		line-height: 1.05;
		text-wrap: wrap;
	}

	.body-large {
		font-size: 20px;
		letter-spacing: 0.05em;
	}

	h3 {
		color: var(--color-text);
		font-family: var(--font-body);
		font-size: 20px;
		font-weight: 600;
	}

	section.values,
	section.space,
	section.people,
	section.rental {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-l);
		color: var(--color-text);
	}

	div.values-intro,
	div.space-intro,
	div.people-intro {
		position: relative;
		display: grid;
		gap: var(--spacing-m);
	}

	ul.value-cards,
	ul.people-list {
		padding: 0;
		list-style: none;
	}

	/* Values */
	section.values::before {
		content: "";
		position: absolute;
		inset: 0;
		background-image: url(/assets/images/texture-newsletter.webp);
		background-size: 1024px 1024px;
		opacity: 0.79;
		pointer-events: none;
	}

	section.values h2 {
		max-width: 560px;
	}

	section.values p.body-large {
		max-width: 800px;
	}

	ul.value-cards {
		position: relative;
		display: grid;
		gap: var(--spacing-l);
	}

	li.value-card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--spacing-s);
	}

	/* The icon is 1em in currentColor */
	span.value-icon {
		display: grid;
		place-items: center;
		width: 80px;
		height: 80px;
		margin-bottom: var(--spacing-s);
		border-radius: 50%;
		background-color: var(--color-tan);
		color: var(--color-brown);
		font-size: 48px;
	}

	li.value-card p {
		max-width: 280px;
		font-size: 16px;
		letter-spacing: 0.02em;
	}

	/* Space */
	div.space-intro {
		justify-items: center;
		text-align: center;
	}

	section.space p.body-large {
		max-width: 819px;
	}

	div.space-gallery {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--spacing-m);
	}

	img.space-image {
		width: 100%;
		height: 100%;
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: 10px;
		box-shadow: var(--shadow);
	}

	/* The two larger photos run full width on phones */
	img.space-image:nth-child(-n + 2) {
		grid-column: 1 / -1;
	}

	img.space-image:nth-child(2) {
		aspect-ratio: 2;
	}

	/* People */
	ul.people-list {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--spacing-l) var(--spacing-m);
	}

	li.person {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-s);
		text-align: center;
	}

	.person-photo {
		display: block;
		width: 100%;
		max-width: 192px;
		aspect-ratio: 1;
		margin-bottom: var(--spacing-s);
		border-radius: 50%;
		background-color: var(--color-peach);
		object-fit: cover;
	}

	li.person p {
		max-width: 192px;
		font-size: 14px;
		letter-spacing: 0.05em;
	}

	div.people-buttons {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		/* Tighter when the buttons wrap onto two rows */
		gap: var(--spacing-m) var(--spacing-l);
	}

	/* Rental */
	div.rental-card {
		position: relative;
		display: flex;
		align-items: flex-end;
		min-height: 480px;
		padding: var(--spacing-l) var(--spacing-m);
		border-radius: var(--border-radius);
		box-shadow: var(--shadow);
		overflow: hidden;
	}

	img.rental-image {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Brown rises from the bottom on phones, where the text sits under the photo's busiest part */
	div.rental-card::after {
		content: "";
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to top,
			var(--color-brown) 0%,
			color-mix(in srgb, var(--color-brown) 85%, transparent) 55%,
			color-mix(in srgb, var(--color-brown) 20%, transparent) 100%
		);
	}

	div.rental-text {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--spacing-m);
		max-width: 560px;
		color: var(--color-white);
	}

	/* Tops up the text's spacing-m gap to spacing-l, setting the button apart from the text */
	div.rental-text :global(a),
	div.rental-text :global(button) {
		margin-top: calc(var(--spacing-l) - var(--spacing-m));
	}

	@media screen and (min-width: 640px) {
		/* Off the usual breakpoints: two value cards fit side by side well before 768px */
		ul.value-cards {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media screen and (min-width: 768px) {
		section.values,
		section.space,
		section.people,
		section.rental {
			padding-block: var(--spacing-xl);
		}

		div.people-intro {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--spacing-xl);
		}

		/* Left, a tall photo; right, a wide one over two squares */
		div.space-gallery {
			grid-template-columns: 2fr 1fr 1fr;
			grid-template-rows: repeat(2, minmax(0, 1fr));
			gap: var(--spacing-l);
			aspect-ratio: 1312 / 662;
		}

		img.space-image,
		img.space-image:nth-child(2) {
			aspect-ratio: auto;
		}

		img.space-image:nth-child(1) {
			grid-column: 1;
			grid-row: 1 / -1;
		}

		img.space-image:nth-child(2) {
			grid-column: 2 / -1;
		}

		/* The text stays at the bottom over the phone gradient until 1024px, where it's narrow enough to sit beside the photo */
		div.rental-card {
			min-height: 394px;
			padding: var(--spacing-xl) var(--spacing-l);
		}
	}

	@media screen and (min-width: 1024px) {
		/* Four across, split by rules */
		ul.value-cards {
			grid-template-columns: repeat(4, minmax(0, 1fr));
			gap: 0;
		}

		li.value-card {
			padding-inline: var(--spacing-l);
		}

		li.value-card:first-child {
			padding-left: 0;
		}

		li.value-card + li.value-card {
			border-left: var(--border-width) solid var(--color-text);
		}

		ul.people-list {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}

		span.value-icon {
			width: 96px;
			height: 96px;
			font-size: 56px;
		}

		div.rental-card {
			align-items: center;
			padding-inline: var(--spacing-xl);
		}

		/* Brown fades out to the right, uncovering the class behind the text. It holds at 90% across the text
		   (capped at 60% of the card) so the white stays readable over the bright wall and windows */
		div.rental-card::after {
			background: linear-gradient(
				to right,
				var(--color-brown) 0%,
				color-mix(in srgb, var(--color-brown) 90%, transparent) 60%,
				color-mix(in srgb, var(--color-brown) 0%, transparent) 100%
			);
		}

		div.rental-text {
			max-width: min(560px, 60%);
		}
	}

	@media screen and (min-width: 1280px) {
		h2 {
			font-size: 32px;
		}

		h3 {
			font-size: 24px;
		}

		.body-large {
			font-size: 24px;
		}

		section.values,
		section.space,
		section.people,
		section.rental {
			padding-block: 96px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		/* scroll-fade-up's fallback isn't global, so show the card outright */
		div.rental-card {
			opacity: 1;
			transform: none;
			transition: none;
		}
	}
</style>
