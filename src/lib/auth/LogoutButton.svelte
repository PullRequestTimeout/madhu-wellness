<script lang="ts">
	import { goto } from "$app/navigation";
	import { announce } from "$lib/utils/globalStates.svelte";
	import { logout } from "./actions";

	// Unstyled: the parent passes a class and styles it with :global() or its own selector
	let { redirectTo, class: className = "" }: { redirectTo?: string; class?: string } = $props();
	let pending = $state(false);

	async function handleLogout() {
		if (pending) return;
		pending = true;
		// Finish signing out before navigating
		const result = await logout();
		pending = false;
		announce(result.ok ? "Logged out." : result.message);
		if (result.ok && redirectTo) await goto(redirectTo);
	}
</script>

<button type="button" class={className} aria-disabled={pending} onclick={handleLogout}>Log out</button>

<style>
	button[aria-disabled="true"] {
		opacity: 0.6;
		cursor: progress;
	}
</style>
