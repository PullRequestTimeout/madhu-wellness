<script lang="ts">
	import { getContext } from "svelte";
	import CaretDownIcon from "phosphor-svelte/lib/CaretDownIcon";
	import { CATEGORIES } from "$lib/calendar/events";

	// The event editor's Type field: a native select, so it's labelled (SVAR's Field puts the id its label points to in
	// context) and announced as a dropdown, unlike SVAR's RichSelect. Registered as the "category" editor item.
	let { value, onchange }: { value?: string; onchange?: (ev: { value: string }) => void } = $props();

	const id = getContext<string | undefined>("wx-input-id");
</script>

<div class="category-select">
	<select {id} value={value ?? "class"} onchange={(e) => onchange?.({ value: e.currentTarget.value })}>
		{#each CATEGORIES as category}
			<option value={category.id}>{category.label}</option>
		{/each}
	</select>
	<span class="category-select-caret" aria-hidden="true"><CaretDownIcon weight="bold" /></span>
</div>

<style>
	div.category-select {
		position: relative;
	}

	/* Matches SVAR's text inputs (themed in CalendarView), with room for the caret */
	select {
		width: 100%;
		height: 32px;
		padding: 0 32px 0 8px;
		border: var(--wx-input-border);
		border-radius: var(--wx-input-border-radius, 6px);
		background: var(--wx-input-background, var(--color-cream));
		color: var(--color-text);
		font: inherit;
		font-size: 14px;
		appearance: none;
		cursor: pointer;
	}

	/* The icon is 1em in currentColor */
	span.category-select-caret {
		position: absolute;
		top: 50%;
		right: 10px;
		translate: 0 -50%;
		display: flex;
		color: var(--color-primary);
		font-size: 14px;
		pointer-events: none;
	}
</style>
