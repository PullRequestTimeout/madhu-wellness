<script lang="ts">
	import { navLinks } from "$lib/data/navLinks";

	const year = new Date().getFullYear();
</script>

<footer class="bg-green">
	<div class="footer-body">
		<div class="footer-heading">
			<a href="/" aria-label="Home">
				<img class="site-logo" src="/assets/svgs/logo.svg" alt="Madhu Wellness Collective logo" />
			</a>
			<p class="text-light">Classes, events and holistic treatments, all under one roof.</p>
		</div>

		<div class="footer-quick-links">
			<p class="footer-subheading">Quick Links</p>
			<a href="/">Home</a>
			{#each navLinks as link}
				<a href={link.href}>{link.text}</a>
			{/each}
		</div>

		<div class="footer-contact">
			<p class="footer-subheading">Contact</p>
			<p><span class="material-icons">email</span><a href="mailto:hello@madhucollective.ca">hello@madhucollective.ca</a></p>
			<p><span class="material-icons">phone</span><a href="tel:+10000000000">(000) 000-0000</a></p>
			<p><span class="material-icons">location_on</span><span>Address coming soon</span></p>
		</div>

		<div class="footer-policy">
			<p class="footer-subheading">Policies</p>
			<a href="/privacy">Privacy Policy</a>
		</div>
	</div>

	<div class="footer-bottom">
		<div class="footer-socials">
			<a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">Instagram</a>
			<a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">Facebook</a>
		</div>
		<hr />
		<div class="footer-copyright">
			<p class="text-light">&copy; {year} Madhu Wellness Collective. All rights reserved.</p>
		</div>
	</div>
</footer>

<style>
	footer {
		display: grid;
		gap: var(--spacing-l);
		color: var(--color-primary);
		font-size: var(--font-body-m);
	}

	div.footer-body {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--spacing-l);
	}

	div.footer-heading {
		display: grid;
		gap: var(--spacing-m);
	}

	img.site-logo {
		height: 4rem;
		width: auto;
	}

	div.footer-quick-links,
	div.footer-contact,
	div.footer-policy {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
	}

	p.footer-subheading {
		font-size: var(--font-heading-s);
		font-weight: 600;
	}

	div.footer-contact p {
		display: flex;
		align-items: center;
		gap: var(--spacing-s);
	}

	div.footer-bottom {
		display: grid;
		gap: var(--spacing-m);
	}

	div.footer-socials {
		display: flex;
		gap: var(--spacing-m);
		font-weight: 600;
	}

	div.footer-bottom hr {
		border: 0;
		border-top: 1px solid var(--color-primary-transparent);
	}

	div.footer-copyright p {
		font-size: var(--font-body-s);
	}

	@media (hover: hover) {
		div.footer-body a:hover,
		div.footer-socials a:hover {
			text-decoration: underline;
		}
	}

	@media screen and (min-width: 768px) {
		div.footer-body {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media screen and (min-width: 1024px) {
		div.footer-body {
			grid-template-columns: 2fr repeat(3, 1fr);
		}
	}
</style>
