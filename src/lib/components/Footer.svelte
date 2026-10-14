<script lang="ts">
	import { navLinks } from "$lib/data/navLinks";

	const year = new Date().getFullYear();
</script>

<footer class="bg-brown">
	<div class="footer-body">
		<a href="/" aria-label="Home">
			<img class="site-logo" src="/assets/svgs/logo-white-footer.svg" alt="Madhu Wellness Collective logo" width="210" height="95" />
		</a>

		<div class="footer-links">
			<div class="footer-link-column">
				<a href="/">Home</a>
				{#each navLinks as link}
					<a href={link.href}>{link.text}</a>
				{/each}
			</div>
			<div class="footer-link-column">
				<a href="mailto:hello@madhucollective.ca">Contact</a>
				<a href="https://maps.google.com/?q=Rossland,+BC" target="_blank" rel="noopener noreferrer">Location</a>
				<a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">Instagram</a>
				<a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">Facebook</a>
			</div>
		</div>
	</div>

	<hr />

	<div class="footer-bottom">
		<p>&copy; {year} Madhu Wellness Collective</p>
		<div class="footer-policies">
			<a href="/privacy#cookies">Cookies</a>
			<a href="/privacy">Privacy Policy</a>
		</div>
	</div>

	<div class="footer-credit">
		<span>A</span>
		<img src="/assets/images/pixelmountain-white.png" alt="PixelMountain" width="300" height="52" />
		<span>CREATION</span>
	</div>
</footer>

<style>
	footer {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-l);
		padding-block: 96px;
		color: var(--color-white);
		font-size: var(--font-body-m);
	}

	div.footer-body {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-l);
	}

	img.site-logo {
		width: 210px;
		height: auto;
	}

	div.footer-links {
		display: flex;
		gap: var(--spacing-xl);
	}

	div.footer-link-column {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--spacing-m);
	}

	div.footer-link-column a,
	div.footer-policies a {
		position: relative;
	}

	div.footer-link-column a::after,
	div.footer-policies a::after {
		content: "";
		position: absolute;
		left: 0;
		bottom: calc(var(--spacing-xs) * -1);
		width: 0;
		height: var(--border-width);
		background-color: var(--color-white);
		transition: width 0.3s ease;
	}

	div.footer-link-column:first-child {
		width: 162px;
	}

	footer hr {
		width: 100%;
		border: 0;
		border-top: 1px solid var(--color-white);
	}

	div.footer-bottom {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-m);
	}

	div.footer-policies {
		display: flex;
		gap: var(--spacing-l);
	}

	div.footer-credit {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-m);
		font-style: italic;
	}

	div.footer-credit img {
		width: 200px;
		height: auto;
	}

	@media (hover: hover) {
		div.footer-link-column a:hover::after,
		div.footer-policies a:hover::after {
			width: 100%;
		}
	}

	@media screen and (min-width: 768px) {
		div.footer-body,
		div.footer-bottom {
			flex-direction: row;
			align-items: flex-start;
			justify-content: space-between;
		}

		div.footer-credit img {
			width: 300px;
		}
	}
</style>
