<script lang="ts">
	import Nav from "$lib/components/Nav.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import ContactPanel from "$lib/components/ContactPanel.svelte";
	import { onNavigate } from "$app/navigation";

	let { children } = $props();

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
