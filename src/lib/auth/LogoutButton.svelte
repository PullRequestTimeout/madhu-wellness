<script lang="ts">
	import { goto } from "$app/navigation";
	import { toast } from "$lib/utils/toast.svelte";
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
		if (result.ok) toast.success("You're logged out.");
		else toast.error(result.message);
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
