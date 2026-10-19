<script lang="ts">
	import XIcon from "phosphor-svelte/lib/XIcon";
	import ArrowUpRightIcon from "phosphor-svelte/lib/ArrowUpRightIcon";
	import PencilSimpleIcon from "phosphor-svelte/lib/PencilSimpleIcon";
	import { CATEGORIES, type SiteEvent } from "$lib/calendar/events";
	import { formatWhen } from "$lib/calendar/format";
	import { getCalendarContext } from "$lib/calendar/context";

	// The card SVAR opens when an event in the grid is clicked (its eventPopup prop). It's mouse-driven, so the same
	// details are also listed below the grid for keyboard and screen reader users.
	let { event, close }: { event: SiteEvent; close: () => void } = $props();

	const ctx = getCalendarContext();
	const uid = $props.id();
	const category = $derived(CATEGORIES.find((c) => c.id === event.category)?.label);

	function edit() {
		// Read before closing: the card's event is cleared once it closes
		const id = event.id;
		close();
		ctx.edit(id);
	}
</script>

<div class="event-card" role="group" aria-labelledby="{uid}-title">
	<button class="event-card-close" aria-label="Close event details" onclick={close}>
		<XIcon aria-hidden="true" />
	</button>

	{#if category}<p class="event-card-category">{category}</p>{/if}
	<h3 class="event-card-title" id="{uid}-title">{event.text}</h3>
	<p class="event-card-when">{formatWhen(event)}</p>
	{#if event.details}<p class="event-card-details">{event.details}</p>{/if}

	{#if event.link || ctx.canEdit}
		<div class="event-card-actions">
			{#if event.link}
				<a class="event-card-link" href={event.link} target="_blank" rel="noopener noreferrer">
					Book or learn more <ArrowUpRightIcon aria-hidden="true" /><span class="visually-hidden"> (opens in a new tab)</span>
				</a>
			{/if}
			{#if ctx.canEdit}
				<button class="event-card-edit" onclick={edit}><PencilSimpleIcon aria-hidden="true" /> Edit</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	div.event-card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-s);
		width: min(20rem, calc(100vw - 2 * var(--spacing-m)));
		padding: var(--spacing-m) var(--spacing-l) var(--spacing-m) var(--spacing-m);
		color: var(--color-text);
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.4;
	}

	button.event-card-close {
		position: absolute;
		top: var(--spacing-xs);
		right: var(--spacing-xs);
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: none;
		color: var(--color-primary);
		font-size: 18px;
	}

	p.event-card-category {
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-brown-mid);
	}

	h3.event-card-title {
		padding-right: var(--spacing-s);
		font-size: 20px;
		font-weight: 600;
		line-height: 1.2;
	}

	p.event-card-when {
		font-weight: 500;
	}

	/* The admin's line breaks are kept */
	p.event-card-details {
		max-height: 12rem;
		overflow-y: auto;
		white-space: pre-line;
		overflow-wrap: anywhere;
	}

	div.event-card-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--spacing-s) var(--spacing-m);
		margin-top: var(--spacing-xs);
	}

	/* Icons are 1em in currentColor */
	a.event-card-link,
	button.event-card-edit {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		min-height: 32px;
		font-weight: 600;
		color: var(--color-primary);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	button.event-card-edit {
		padding: 0;
		border: 0;
		background: none;
		font: inherit;
		font-weight: 600;
		text-decoration: none;
	}

	@media (hover: hover) {
		button.event-card-close:hover {
			background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
		}

		a.event-card-link:hover {
			text-decoration-thickness: 2px;
		}

		button.event-card-edit:hover {
			text-decoration: underline;
		}
	}
</style>
