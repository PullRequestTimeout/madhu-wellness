<script lang="ts">
	import { onMount, type Component } from "svelte";
	import { firebaseConfigured } from "$lib/firebase/config";

	// Shell for the calendar. The server renders a placeholder of the same height, then the browser loads SVAR and
	// Firestore and swaps in CalendarView. That keeps both out of SSR and off every other page.
	let { canEdit = false }: { canEdit?: boolean } = $props();

	let View = $state.raw<Component<{ canEdit: boolean }>>();
	let failed = $state(false);

	onMount(() => {
		if (!firebaseConfigured) return void (failed = true);
		import("./CalendarView.svelte")
			.then((m) => (View = m.default))
			.catch((err) => {
				console.error(err);
				failed = true;
			});
	});
</script>

{#if View}
	<View {canEdit} />
{:else}
	<div class="event-calendar-placeholder" aria-busy={!failed}>
		{#if failed}
			<p role="alert">The calendar couldn't load. Please refresh the page, or get in touch with us for upcoming dates.</p>
		{:else}
			<p class="event-calendar-loading">Loading the calendar…</p>
			<!-- Shown instead by the noscript styles in app.html -->
			<p class="event-calendar-nojs">The calendar needs JavaScript. Please get in touch with us for upcoming dates.</p>
		{/if}
	</div>
{/if}

<style>
	/* Same footprint as the loaded calendar, so nothing below moves when it arrives */
	div.event-calendar-placeholder {
		display: grid;
		place-items: center;
		height: clamp(480px, calc(var(--vh, 1vh) * 75), 820px);
		padding: var(--spacing-l);
		border-radius: var(--border-radius);
		box-shadow: var(--shadow);
		background-color: var(--color-cream);
		color: var(--color-text);
		text-align: center;
	}

	p.event-calendar-nojs {
		display: none;
	}
</style>
