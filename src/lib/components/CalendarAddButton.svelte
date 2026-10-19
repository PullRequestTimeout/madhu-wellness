<script lang="ts">
	import { getContext } from "svelte";
	import type { CalendarContextApi } from "@svar-ui/svelte-calendar";
	import PlusIcon from "phosphor-svelte/lib/PlusIcon";

	// Replaces SVAR's icon-only "+" with a labelled button. Only in the toolbar while the admin is editing.
	const api = getContext("calendar-api") as CalendarContextApi;
</script>

<button class="calendar-add" onclick={() => api.exec("add-event", { event: {}, edit: true })}>
	<PlusIcon weight="bold" aria-hidden="true" />
	<span>Add event</span>
</button>

<style>
	/* The icon is 1em in currentColor */
	button.calendar-add {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		height: 40px;
		padding: 0 var(--spacing-m);
		border: 0;
		border-radius: var(--border-radius-pill);
		background-color: var(--color-primary);
		color: var(--color-white);
		font: inherit;
		font-size: 16px;
		font-weight: 500;
		white-space: nowrap;
	}

	@media (hover: hover) {
		button.calendar-add:hover {
			background-color: var(--color-brown-dark);
		}
	}
</style>
