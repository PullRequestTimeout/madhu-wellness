<script lang="ts">
	import SeoHead from "$lib/components/SeoHead.svelte";
</script>

<SeoHead
	title="Privacy Policy | Madhu Wellness Collective"
	description="How Madhu Wellness Collective collects, uses and protects your information."
/>

<main>
	<section class="privacy">
		<h1 class="decorative-heading">Privacy Policy</h1>
		<p class="text-light">Last updated: placeholder date</p>

		<h2 class="text-semi-bold">Information we collect</h2>
		<p class="text-light">Placeholder text.</p>

		<h2 class="text-semi-bold">How we use your information</h2>
		<p class="text-light">Placeholder text.</p>

		<h2 class="text-semi-bold">Analytics</h2>
		<p class="text-light">This site uses Plausible Analytics, which does not use cookies or collect personal data.</p>

		<h2 class="text-semi-bold">Contact</h2>
		<p class="text-light">Questions about this policy can be sent to <a href="mailto:hello@madhucollective.ca">hello@madhucollective.ca</a>.</p>
	</section>
</main>

<style>
	section.privacy {
		display: grid;
		gap: var(--spacing-m);
		margin-top: 4.5rem;
		font-size: var(--font-body-m);
	}

	section.privacy h2 {
		font-size: var(--font-heading-s);
		margin-top: var(--spacing-m);
	}

	section.privacy a {
		text-decoration: underline;
	}
</style>
