<!-- Newsletter signup that closes out every page, above the footer -->
<script lang="ts">
	import PrimaryButton from "$lib/components/PrimaryButton.svelte";
	import SpanifyText from "$lib/components/SpanifyText.svelte";
	import { isIntersecting } from "$lib/utils/isIntersecting";
</script>

<section class="newsletter">
	<div class="newsletter-text">
		<p class="eyebrow" aria-hidden="true">Newsletter</p>
		<h2 class="heading-fade-in" use:isIntersecting>
			<SpanifyText text="Keep in touch with us." />
		</h2>
		<p class="newsletter-body">Stay up to date with upcoming events, new practitioners, and what’s happening in our community.</p>
	</div>
	<!-- TODO: connect to a newsletter provider -->
	<form class="newsletter-form" onsubmit={(e) => e.preventDefault()}>
		<label class="visually-hidden" for="newsletter-email">Email</label>
		<input id="newsletter-email" type="email" name="email" placeholder="Enter your email" autocomplete="email" required />
		<div class="newsletter-actions">
			<p class="fine-print">By signing up you agree to the <a href="/privacy">privacy policy</a></p>
			<PrimaryButton type="submit" text="Sign Up" />
		</div>
	</form>
</section>

<style>
	section.newsletter {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-l);
		background-color: var(--color-background-peach);
		color: var(--color-text);
	}

	section.newsletter::before {
		content: "";
		position: absolute;
		inset: 0;
		background-image: url(/assets/images/texture-newsletter.webp);
		background-size: 1024px 1024px;
		background-position: top left;
		opacity: 0.79;
		pointer-events: none;
	}

	div.newsletter-text {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-m);
		max-width: 538px;
	}

	/* Sits above the eyebrow */
	h2 {
		position: relative;
		font-family: var(--font-body);
		font-size: 28px;
		font-weight: 600;
		line-height: 1.05;
		text-wrap: wrap;
	}

	p.newsletter-body {
		font-size: 20px;
		letter-spacing: 0.05em;
	}

	/* Stacked, it's capped at the text's width so the email field doesn't stretch across the screen */
	form.newsletter-form {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: var(--spacing-s);
		max-width: 538px;
	}

	form.newsletter-form input {
		width: 100%;
		height: 38px;
		padding-inline: 16px;
		border: var(--border-width) solid var(--color-text);
		border-radius: 8px;
		background: none;
		color: var(--color-text);
		font-size: 14px;
		letter-spacing: 0.05em;
	}

	form.newsletter-form input::placeholder {
		color: var(--color-placeholder);
	}

	div.newsletter-actions {
		display: flex;
		align-items: center;
		gap: var(--spacing-m);
	}

	p.fine-print {
		font-size: 12px;
		letter-spacing: 0.05em;
	}

	p.fine-print a {
		text-decoration: underline;
	}

	/* Side by side from here, so the stacked email field never stretches across a wide screen */
	@media screen and (min-width: 768px) {
		section.newsletter {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			padding-block: var(--spacing-xl);
		}

		div.newsletter-text {
			flex: 1 1 auto;
		}

		form.newsletter-form {
			flex: 0 0 auto;
			align-items: stretch;
		}
	}

	@media screen and (min-width: 1280px) {
		h2 {
			font-size: 32px;
		}

		p.newsletter-body {
			font-size: 24px;
		}

		section.newsletter {
			padding-block: 96px;
		}
	}
</style>
