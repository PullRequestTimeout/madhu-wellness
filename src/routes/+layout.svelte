<script lang="ts">
	// Critical CSS, inlined into every page's <head> by kit.inlineStyleThreshold
	import "$lib/styles/global.css";
	import { onMount } from "svelte";
	import Nav from "$lib/components/Nav.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import ContactPanel from "$lib/components/ContactPanel.svelte";
	import AdminLoginPanel from "$lib/components/AdminLoginPanel.svelte";
	import Toaster from "$lib/components/Toaster.svelte";
	import ConfirmDialog from "$lib/components/ConfirmDialog.svelte";
	import { afterNavigate, onNavigate, replaceState } from "$app/navigation";
	import { page } from "$app/state";
	import { initAuth, waitForAuth } from "$lib/auth/auth.svelte";
	import { isAdminUid } from "$lib/auth/config";
	import { firebaseConfigured } from "$lib/firebase/config";
	import { openLogin } from "$lib/utils/globalStates.svelte";
	import { heroImageFor } from "$lib/data/heroImages";
	import { preloadImage } from "$lib/utils/preloadImage";

	let { children } = $props();

	onMount(() => initAuth());

	// ?admin on any page opens the login form, so admins can bookmark it. The param is dropped from the address bar.
	// afterNavigate also runs on the first load, but before the router allows replaceState, hence the timeout
	afterNavigate(() => {
		if (!firebaseConfigured || !page.url.searchParams.has("admin")) return;
		const url = new URL(page.url);
		url.searchParams.delete("admin");
		setTimeout(() => replaceState(url, page.state));
		waitForAuth()
			.then((user) => {
				if (!isAdminUid(user?.uid)) openLogin();
			})
			.catch(() => openLogin());
	});

	// Start a link's hero photo downloading on hover, touch or focus, like SvelteKit's own preloading, so the wait below is
	// usually over before the click. The site's routes have no params, so a link's pathname is its route id
	function warmHero(event: Event) {
		const link = (event.target as Element).closest?.("a[href]");
		if (!(link instanceof HTMLAnchorElement) || link.origin !== location.origin) return;
		const hero = heroImageFor(link.pathname);
		if (hero) preloadImage(hero);
	}

	onNavigate(async (navigation) => {
		if (navigation.from?.url.pathname === navigation.to?.url.pathname) return;

		// Keep the current page up until the next one's hero photo is decoded (at most 1s), so it never pops in after the page
		const hero = heroImageFor(navigation.to?.route.id);
		if (hero) await preloadImage(hero);

		// Crossfade between pages using the View Transitions API
		if (!document.startViewTransition) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		return new Promise<void>((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<!-- pointerover also fires when a touch lands, before the click -->
<svelte:document onpointerover={warmHero} onfocusin={warmHero} />

<Nav />
{@render children()}
<Footer />
<!-- Global modals / CTAs shared by every page go here -->
<ContactPanel />
<AdminLoginPanel />
<!-- Branded confirmations raised anywhere with confirmDialog() from $lib/utils/confirm.svelte -->
<ConfirmDialog />
<!-- Feedback raised anywhere with toast() from $lib/utils/toast.svelte -->
<Toaster />
