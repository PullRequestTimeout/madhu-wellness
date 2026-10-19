<script lang="ts">
	import { navLinks } from "$lib/data/navLinks";
	import { openContact, openLogin } from "$lib/utils/globalStates.svelte";
	import { toast } from "$lib/utils/toast.svelte";
	import { authStore } from "$lib/auth/auth.svelte";
	import { logout } from "$lib/auth/actions";
	import { firebaseConfigured } from "$lib/firebase/config";

	const year = new Date().getFullYear();
	const isAdmin = $derived(authStore.ready && authStore.isAdmin);
	let loggingOut = $state(false);

	async function handleLogout() {
		if (loggingOut) return;
		loggingOut = true;
		const result = await logout();
		loggingOut = false;
		if (result.ok) toast.success("You're logged out.");
		else toast.error(result.message);
	}
</script>

<footer class="bg-brown">
	<div class="footer-body">
		<a href="/" aria-label="Home">
			<img class="site-logo" src="/assets/svgs/logo-white.svg" alt="Madhu Wellness Collective logo" width="120" height="54" />
		</a>

		<div class="footer-links">
			<div class="footer-link-column">
				<a href="/">Home</a>
				{#each navLinks as link}
					<a href={link.href}>{link.text}</a>
				{/each}
			</div>
			<div class="footer-link-column">
				<!-- Opens the contact form, like the nav's Contact -->
				<button class="footer-contact" aria-haspopup="dialog" onclick={openContact}>Contact</button>
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
			<!-- Discreet way in for the studio's admins. Hiding it is cosmetic: the Firestore rules protect the data.
			     One button that becomes Log out, rather than two swapped in and out, so keyboard focus survives signing in or out -->
			{#if firebaseConfigured}
				<button
					class="footer-admin"
					aria-haspopup={isAdmin ? undefined : "dialog"}
					aria-disabled={loggingOut}
					onclick={isAdmin ? handleLogout : openLogin}>{isAdmin ? "Log out" : "Admin"}</button
				>
			{/if}
		</div>
	</div>

	<a class="footer-credit" href="https://pixelmountain.ca/" target="_blank" rel="noopener noreferrer">
		<span>A</span>
		<img src="/assets/images/pixelmountain-white.png" alt="PixelMountain" width="300" height="52" />
		<span>CREATION</span>
		<span class="visually-hidden">(opens in a new tab)</span>
	</a>
</footer>

<style>
	footer {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-l);
		color: var(--color-white);
		font-size: var(--font-body-m);
	}

	div.footer-body {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-l);
	}

	/* Nav-sized until the desktop layout; the one SVG scales to either */
	img.site-logo {
		width: 120px;
		height: auto;
	}

	/* The columns never shrink below their longest link; on the narrowest phones the second one wraps underneath */
	div.footer-links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-m) var(--spacing-l);
	}

	div.footer-link-column {
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		align-items: flex-start;
		gap: var(--spacing-m);
	}

	/* One line each, however long */
	div.footer-link-column a,
	div.footer-link-column button.footer-contact,
	div.footer-policies a,
	div.footer-policies button.footer-admin {
		position: relative;
		white-space: nowrap;
	}

	/* Contact and Admin are buttons but look like the links around them */
	button.footer-contact,
	div.footer-policies button.footer-admin {
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
	}

	/* While logging out */
	button.footer-admin[aria-disabled="true"] {
		opacity: 0.6;
		cursor: progress;
	}

	div.footer-link-column a::after,
	div.footer-link-column button.footer-contact::after,
	div.footer-policies a::after,
	div.footer-policies button.footer-admin::after {
		content: "";
		position: absolute;
		left: 0;
		bottom: calc(var(--spacing-xs) * -1);
		width: 0;
		height: var(--border-width);
		background-color: var(--color-white);
		transition: width 0.3s ease;
	}

	/* At least the design's column width, but free to grow so long links don't wrap */
	div.footer-link-column:first-child {
		min-width: 162px;
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

	/* Wraps rather than overflowing the narrowest phones now that Admin sits here too */
	div.footer-policies {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-m) var(--spacing-l);
	}

	/* Centred and only as wide as its content, so the link's target is the credit itself */
	a.footer-credit {
		display: flex;
		align-self: center;
		align-items: center;
		max-width: 100%;
		gap: var(--spacing-m);
		font-style: italic;
	}

	/* min-width: 0 lets it shrink below 200px, so the credit fits on the narrowest phones */
	a.footer-credit img {
		width: 200px;
		min-width: 0;
		height: auto;
	}

	@media (hover: hover) {
		div.footer-link-column a:hover::after,
		div.footer-link-column button.footer-contact:hover::after,
		div.footer-policies a:hover::after,
		div.footer-policies button.footer-admin:hover::after {
			width: 100%;
		}

		a.footer-credit:hover {
			opacity: 0.8;
		}
	}

	@media screen and (min-width: 768px) {
		div.footer-body,
		div.footer-bottom {
			flex-direction: row;
			align-items: flex-start;
			justify-content: space-between;
		}

		div.footer-links {
			column-gap: var(--spacing-xl);
		}

		a.footer-credit img {
			width: 300px;
		}
	}

	@media screen and (min-width: 1024px) {
		img.site-logo {
			width: 210px;
		}
	}
</style>
