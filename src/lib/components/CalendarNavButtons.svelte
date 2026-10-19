<script lang="ts">
	import { getContext } from "svelte";
	import type { CalendarContextApi } from "@svar-ui/svelte-calendar";
	import CaretLeftIcon from "phosphor-svelte/lib/CaretLeftIcon";
	import CaretRightIcon from "phosphor-svelte/lib/CaretRightIcon";

	// Previous / Today / Next as one toolbar item, so they stay together when the toolbar wraps on phones. Replaces
	// SVAR's prev/next block, whose icon-only buttons have no accessible names (its aria-labels are commented out
	// upstream) and need its CDN icon font. Registered as a toolbar item in CalendarView.
	const api = getContext("calendar-api") as CalendarContextApi;
	const go = (direction: "previous" | "next" | "now") => api.exec("navigate-time", { direction });
</script>

<div class="calendar-nav" role="group" aria-label="Change month">
	<button class="calendar-nav-arrow" aria-label="Previous month" onclick={() => go("previous")}>
		<CaretLeftIcon weight="bold" aria-hidden="true" />
	</button>
	<button class="calendar-nav-today" onclick={() => go("now")}>Today</button>
	<button class="calendar-nav-arrow" aria-label="Next month" onclick={() => go("next")}>
		<CaretRightIcon weight="bold" aria-hidden="true" />
	</button>
</div>

<style>
	div.calendar-nav {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}

	/* 40px round targets; the icon is 1em in currentColor */
	button.calendar-nav-arrow {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: none;
		color: var(--color-primary);
		font-size: 20px;
	}

	button.calendar-nav-today {
		height: 40px;
		padding: 0 var(--spacing-m);
		border: var(--border-width) solid var(--color-primary);
		border-radius: var(--border-radius-pill);
		background: none;
		color: var(--color-primary);
		font: inherit;
		font-size: 14px;
		font-weight: 600;
	}

	@media (hover: hover) {
		button.calendar-nav-arrow:hover,
		button.calendar-nav-today:hover {
			background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
		}
	}
</style>
