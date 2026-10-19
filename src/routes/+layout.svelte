<script lang="ts">
	import { onMount } from "svelte";
	import Nav from "$lib/components/Nav.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import ContactPanel from "$lib/components/ContactPanel.svelte";
	import AdminLoginPanel from "$lib/components/AdminLoginPanel.svelte";
	import { afterNavigate, onNavigate, replaceState } from "$app/navigation";
	import { page } from "$app/state";
	import { initAuth, waitForAuth } from "$lib/auth/auth.svelte";
	import { isAdminUid } from "$lib/auth/config";
	import { firebaseConfigured } from "$lib/firebase/config";
	import { uiStore, openLogin } from "$lib/utils/globalStates.svelte";

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

	// Crossfade between pages using the View Transitions API
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		if (navigation.from?.url.pathname === navigation.to?.url.pathname) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<Nav />
{@render children()}
<Footer />
<!-- Global modals / CTAs shared by every page go here -->
<ContactPanel />
<AdminLoginPanel />
<!-- Announces changes with no visible message of their own, such as signing in or out -->
<p class="visually-hidden" role="status">{uiStore.announcement}</p>
