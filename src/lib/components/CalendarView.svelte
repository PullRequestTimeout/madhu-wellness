<script lang="ts">
	import { onDestroy, tick } from "svelte";
	import { Calendar, Editor, Willow, getEditorItems, registerEditorItem } from "@svar-ui/svelte-calendar";
	import type { CalendarInstanceApi } from "@svar-ui/svelte-calendar";
	import type { StoreActions } from "@svar-ui/calendar-store";
	import { Locale } from "@svar-ui/svelte-core";
	import PencilSimpleIcon from "phosphor-svelte/lib/PencilSimpleIcon";
	import ArrowUpRightIcon from "phosphor-svelte/lib/ArrowUpRightIcon";
	import { registerToolbarItem } from "@svar-ui/svelte-toolbar";
	import EventCard from "$lib/components/EventCard.svelte";
	import CategorySelect from "$lib/components/CategorySelect.svelte";
	import EventDatesField from "$lib/components/EventDatesField.svelte";
	import CalendarNavButtons from "$lib/components/CalendarNavButtons.svelte";
	import CalendarAddButton from "$lib/components/CalendarAddButton.svelte";
	import { CATEGORIES, deleteEvent, isValidLink, newEventId, saveEvent, subscribeEvents, type SiteEvent } from "$lib/calendar/events";
	import { formatMonth, formatWhen, inMonth } from "$lib/calendar/format";
	import { setCalendarContext } from "$lib/calendar/context";
	import { toast } from "$lib/utils/toast.svelte";
	import { canRefocus, lockScroll } from "$lib/utils/modal";
	import { confirmDialog } from "$lib/utils/confirm.svelte";

	// The SVAR month calendar, fed live from Firestore. Loaded on demand by EventCalendar, so SVAR and Firestore stay
	// out of SSR and out of every other page. Read-only unless canEdit (a signed-in admin with Edit mode on); the
	// Firestore rules are what actually stop anyone else writing.

	let { canEdit }: { canEdit: boolean } = $props();

	// The editor's Type field: a labelled native select (SVAR's RichSelect is unlabelled and needs its icon font)
	registerEditorItem("category", CategorySelect);
	// Dates as day/month/year, all-day events by their last day, and labelled inputs (see EventDatesField)
	registerEditorItem("site-dates", EventDatesField);
	// Labelled replacements for SVAR's icon-only prev/next and add buttons
	registerToolbarItem("monthNav", CalendarNavButtons);
	registerToolbarItem("addEvent", CalendarAddButton);

	// Month only. Kept constant: a new array would make the calendar rebuild its views
	const VIEWS = ["month"];
	// Sunday-first weeks, as Canadian calendars usually are
	const WORDS = { calendar: { weekStart: 0 } };
	// Pinned, so SVAR never folds them into its overflow menu (whose button needs its CDN icon font); the row wraps
	// instead (see the toolbar styles). Title left, controls right
	const TOOLBAR_ITEMS = [{ id: "title", comp: "dateLabel", pinned: true }, { comp: "spacer" }, { id: "nav", comp: "monthNav", pinned: true }];
	const toolbar = $derived({ items: canEdit ? [...TOOLBAR_ITEMS, { id: "add", comp: "addEvent", pinned: true }] : TOOLBAR_ITEMS });

	const linkMessage = "Use a full link starting with https://";
	const EDITOR_ITEMS = [
		{ comp: "text", key: "text", label: "Title", validation: (v: string) => !!v?.trim(), validationMessage: "Please add a title" },
		// SVAR's schedule item (start, end, all day and its end-after-start check), drawn by EventDatesField
		{ ...getEditorItems()[1], comp: "site-dates" },
		{ comp: "category", key: "category", label: "Type" },
		{ comp: "textarea", key: "details", label: "Details" },
		{ comp: "text", key: "link", label: "Booking or info link", placeholder: "https://", validation: isValidLink, validationMessage: linkMessage }
	];
	// Saves only on Save: the default autosave would write to Firestore on every keystroke
	const EDITOR_BOTTOM_BAR = {
		items: [
			{ comp: "button", id: "delete", text: "Delete", type: "danger" },
			{ comp: "spacer" },
			{ comp: "button", id: "duplicate", text: "Duplicate" },
			{ comp: "button", id: "close", text: "Cancel" },
			{ comp: "button", id: "save", text: "Save", type: "primary" }
		]
	};

	let api = $state.raw<CalendarInstanceApi>();
	// Raw, so the calendar gets plain objects rather than deep proxies
	let events = $state.raw<SiteEvent[]>([]);
	// The calendar returns to this date whenever `events` changes, so it's kept on the month being viewed (applyEvents)
	let date = $state(new Date());
	// The month on screen, for the list below the grid
	let viewDate = $state(new Date());
	let status = $state<"loading" | "ready" | "error">("loading");

	// Events created in the calendar but never saved; they only exist locally, so closing the editor discards them
	const unsaved = new Set<string>();
	// The event the editor is showing, and whether a Save is closing it
	let editingId = $state<string | null>(null);
	let closeAfterSave = false;
	let cleanups: (() => void)[] = [];

	const monthEvents = $derived(events.filter((e) => inMonth(e, viewDate)).sort((a, b) => a.start.getTime() - b.start.getTime()));
	const categoryLabel = (event: SiteEvent) => CATEGORIES.find((c) => c.id === event.category)?.label;

	// Month changes are announced, as the grid and the list below both change silently. Not the first month shown
	let monthAnnouncement = $state("");
	let firstMonth = true;
	$effect(() => {
		const message = `Showing ${formatMonth(viewDate)}: ${monthEvents.length} ${monthEvents.length === 1 ? "event" : "events"}.`;
		if (status !== "ready") return;
		if (firstMonth) return void (firstMonth = false);
		monthAnnouncement = message;
	});

	// SVAR's editor modal isn't a dialog to assistive tech, doesn't keep Tab inside it, drops focus when it closes, and
	// leaves the page scrollable. While it's open this names it as a dialog, wraps Tab within it and locks page scroll,
	// and afterwards hands focus back to what opened it (or, if that's gone, the event's Edit button, else Add event).
	let lastFocusOutside: HTMLElement | null = null;
	const trackFocus = (e: FocusEvent) => {
		const target = e.target as HTMLElement;
		if (!target.closest?.(".wx-modal")) lastFocusOutside = target;
	};
	document.addEventListener("focusin", trackFocus);
	cleanups.push(() => document.removeEventListener("focusin", trackFocus));

	const FOCUSABLE =
		'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

	// Runs fn once no native modal dialog is open (checked each frame, giving up after a second)
	function afterDialogsClose(fn: () => void, deadline = performance.now() + 1000) {
		requestAnimationFrame(() => {
			if (document.querySelector("dialog[open]") && performance.now() < deadline) afterDialogsClose(fn, deadline);
			else fn();
		});
	}

	$effect(() => {
		const id = editingId;
		if (!id) return;
		const opener = lastFocusOutside;
		const isNew = unsaved.has(id);

		tick().then(() => {
			const win = document.querySelector<HTMLElement>(".wx-modal .wx-window");
			win?.setAttribute("role", "dialog");
			win?.setAttribute("aria-modal", "true");
			win?.setAttribute("aria-label", isNew ? "Add event" : "Edit event");
		});

		// The page behind the editor stays put while it's open, as with the contact form (the shared lock in modal.ts)
		const unlock = lockScroll();

		const wrapTab = (e: KeyboardEvent) => {
			if (e.key !== "Tab") return;
			// A native modal dialog over the editor (the delete confirmation) handles its own focus
			if (document.querySelector("dialog[open]")) return;
			const modal = document.querySelector<HTMLElement>(".wx-modal");
			if (!modal) return;
			const items = [...modal.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
			if (!items.length) return;
			const first = items[0];
			const last = items[items.length - 1];
			// The editor's date and time pickers open in popups outside the modal; Tab there is theirs to handle
			if (document.activeElement?.closest(".wx-popup, .wx-portal")) return;
			const inside = modal.contains(document.activeElement);
			if (e.shiftKey && (document.activeElement === first || !inside)) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && (document.activeElement === last || !inside)) {
				e.preventDefault();
				first.focus();
			}
		};
		document.addEventListener("keydown", wrapTab, true);

		return () => {
			document.removeEventListener("keydown", wrapTab, true);
			unlock();
			// After any native dialog over the editor (the delete confirmation) has closed: until then the page is inert,
			// and closing it would then move focus again
			afterDialogsClose(() => {
				const fallback =
					document.querySelector<HTMLElement>(`[data-event-edit="${id}"]`) ?? document.querySelector<HTMLElement>("button.calendar-add");
				(canRefocus(opener) ? opener : fallback)?.focus();
			});
		};
	});

	setCalendarContext({
		get canEdit() {
			return canEdit;
		},
		edit: (id) => api?.exec("select-event", { id })
	});

	function applyEvents(next: SiteEvent[]) {
		if (api) date = api.getState().currentDate;
		events = next;
	}

	// Puts the calendar back in step with the last data from Firestore, e.g. after a rejected write
	function resync() {
		applyEvents([...events]);
	}

	function stored(id: string): SiteEvent | undefined {
		return api?.getEvent(id) as SiteEvent | undefined;
	}

	function closeEditor() {
		api?.exec("select-event", { id: null });
	}

	// SVAR types every handler's payload as a union of all actions; these narrow it to the one being handled
	type Handler<K extends keyof StoreActions> = (p: StoreActions[K]) => void | boolean | Promise<boolean>;
	const intercept = <K extends keyof StoreActions>(a: CalendarInstanceApi, name: K, fn: Handler<K>) =>
		a.intercept(name, fn as unknown as Handler<keyof StoreActions>);
	const on = <K extends keyof StoreActions>(a: CalendarInstanceApi, name: K, fn: Handler<K>) =>
		a.on(name, fn as unknown as Handler<keyof StoreActions>);

	function init(a: CalendarInstanceApi) {
		api = a;
		// Typed as returning nothing, but it's a Svelte store and returns its unsubscribe
		const subscribe = a.getReactiveState().currentDate.subscribe as unknown as (fn: (d: Date) => void) => () => void;
		cleanups.push(subscribe((d) => (viewDate = d)));

		intercept(a, "add-event", async (p) => {
			if (!canEdit) return false;
			// Created with its Firestore id, so the calendar and database agree from the start
			p.event.id ??= await newEventId();
			(p.event as Partial<SiteEvent>).category ??= "class";
			unsaved.add(String(p.event.id));
			return true;
		});
		on(a, "add-event", (p) => {
			if (p.edit) {
				editingId = String(p.id);
				editorSaved = false;
			}
		});

		intercept(a, "update-event", (p) => {
			if (!canEdit) return false;
			const id = String(p.id);
			const merged = { ...stored(id), ...p.event, id } as SiteEvent;
			if (!merged.text?.trim()) {
				toast.error("Please add a title before saving.");
				closeAfterSave = false;
				return false;
			}
			if (!isValidLink(merged.link)) {
				toast.error(`${linkMessage}.`);
				closeAfterSave = false;
				return false;
			}
			const isNew = unsaved.has(id);
			// Saved in the background; the calendar shows the change straight away
			saveEvent(merged).then((res) => {
				if (!res.ok) {
					toast.error(res.message);
					if (!isNew) resync();
					return;
				}
				unsaved.delete(id);
				toast.success(isNew ? "Event added." : "Event saved.");
			});
			return true;
		});
		on(a, "update-event", () => {
			if (!closeAfterSave) return;
			closeAfterSave = false;
			// After SVAR's editor has finished its own save: closing mid-save makes it read the cleared editor data
			// Only if the same event is still open, in case it was closed and something else opened meanwhile
			const savedId = editingId;
			setTimeout(() => {
				if (editingId === savedId) closeEditor();
			});
		});

		intercept(a, "delete-event", async (p) => {
			if (!canEdit) return false;
			const id = String(p.id);
			// Never saved, so there's nothing in Firestore to remove
			if (unsaved.delete(id)) return true;
			const event = stored(id);
			const confirmed = await confirmDialog({
				title: `Delete “${event?.text || "this event"}”?`,
				message: "It will be removed from the calendar for everyone. This can't be undone.",
				confirmText: "Delete event",
				cancelText: "Keep it",
				danger: true
			});
			if (!confirmed) return false;
			deleteEvent(id).then((res) => {
				if (res.ok) toast.success("Event deleted.");
				else {
					toast.error(res.message);
					resync();
				}
			});
			return true;
		});
		on(a, "delete-event", (p) => {
			if (String(p.id) === editingId) closeEditor();
		});

		on(a, "select-event", (p) => {
			const previous = editingId;
			editingId = p.id == null ? null : String(p.id);
			// A fresh start for each opening and closing, so a save that never completed can't affect the next one
			editorSaved = false;
			// Closing the editor on a new event that was never saved discards it
			if (p.id == null && previous && unsaved.has(previous)) a.exec("delete-event", { id: previous });
		});

		// Clicking a date number asks SVAR to open that day in Day view, which this month-only calendar doesn't have.
		// Day clicks are handled by onGridClick instead
		intercept(a, "navigate-to", (p) => p.view !== "day");
	}

	// SVAR only creates events by dragging across days, so in Edit mode a plain click on a day's empty space adds an
	// all-day event there and opens the editor. A click that ends a drag is left alone: the drag already created one
	let pointerStart: { x: number; y: number } | null = null;
	let adding = false;

	function onGridPointerDown(e: PointerEvent) {
		pointerStart = { x: e.clientX, y: e.clientY };
	}

	function onGridClick(e: MouseEvent) {
		const start = pointerStart;
		pointerStart = null;
		if (!canEdit || !api) return;
		// Only a pointer click can be the end of a drag; keyboard and assistive-tech clicks (detail 0) never are
		const moved = e.detail !== 0 && start && (Math.abs(e.clientX - start.x) > 3 || Math.abs(e.clientY - start.y) > 3);
		if (moved) return;
		const target = e.target as HTMLElement;
		// Not on an event, "+N more" or a control, nor inside the event card or editor, which render within the grid
		if (target.closest(".wx-bar-event, .wx-more-button, button, a, input, select, textarea, .wx-popup, .wx-modal, .event-card")) return;
		const raw = target.closest(".wx-grid-cell")?.querySelector("[data-date]")?.getAttribute("data-date");
		if (!raw) return;
		const [y, m, d] = raw.split("-").map(Number);
		// A double-click would otherwise add two: the first add is still fetching its id when the second click lands
		if (adding) return;
		adding = true;
		api
			.exec("add-event", { event: { start: new Date(y, m - 1, d), end: new Date(y, m - 1, d + 1), allDay: true }, edit: true })
			.finally(() => (adding = false));
	}

	// Set when SVAR's editor runs its own save, which comes just before its Save action reaches onEditorAction
	let editorSaved = false;

	function onEditorSave() {
		closeAfterSave = true;
		editorSaved = true;
	}

	function onEditorAction({ item, changes }: { item: { id?: string | number }; changes?: string[] }) {
		if (!api || !editingId) return;
		if (item.id === "delete") api.exec("delete-event", { id: editingId });
		if (item.id === "duplicate") duplicate(editingId);
		// The editor skips its save when nothing changed, so Save just closes. A brand-new event still needs storing,
		// as it only exists locally until its first save
		if (item.id === "save") {
			const handled = editorSaved;
			editorSaved = false;
			if (handled || changes?.length) return;
			if (unsaved.has(editingId)) {
				closeAfterSave = true;
				api.exec("update-event", { id: editingId, event: {} });
			} else closeEditor();
		}
	}

	// Copies the saved event to the same time a week later, as a new unsaved event open in the editor. Covers weekly
	// classes without recurring events, which are a SVAR PRO feature
	function duplicate(id: string) {
		const source = stored(id);
		if (!source || !api) return;
		const week = 7 * 24 * 60 * 60 * 1000;
		const { id: _, ...rest } = source;
		closeEditor();
		api.exec("add-event", {
			event: { ...rest, start: new Date(source.start.getTime() + week), end: new Date(source.end.getTime() + week) },
			edit: true
		});
		toast.info("Copied to the same time next week. Adjust it, then Save.");
	}

	// Firestore stream
	subscribeEvents(
		(next) => {
			applyEvents(next);
			status = "ready";
		},
		(err) => {
			console.error(err);
			status = "error";
		}
	)
		.then((unsubscribe) => cleanups.push(unsubscribe))
		.catch((err) => {
			console.error(err);
			status = "error";
		});

	onDestroy(() => cleanups.forEach((fn) => fn()));
</script>

<!-- The grid is visual: its events can't be reached by keyboard, so every event is also listed below it -->
<p class="visually-hidden">Every event in this calendar is also listed below it, with its details and booking link.</p>
<p class="visually-hidden" role="status">{monthAnnouncement}</p>
<div class="event-calendar" class:editable={canEdit} aria-busy={status === "loading"}>
	{#if status === "error"}
		<p class="event-calendar-message" role="alert">
			The calendar couldn't load. Please refresh the page, or get in touch with us for upcoming dates.
		</p>
	{:else}
		<!-- Day clicks add events in Edit mode; keyboard users have the Add event button -->
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div class="event-calendar-grid" onpointerdown={onGridPointerDown} onclick={onGridClick}>
			<Willow fonts={false}>
				<Locale words={WORDS}>
					<Calendar
						{events}
						{date}
						view="month"
						views={VIEWS}
						readonly={!canEdit}
						{toolbar}
						eventCss={(o) => `event-${(o.event as Partial<SiteEvent>).category ?? "class"}`}
						eventPopup={EventCard}
						{init}
					/>
					{#if api && canEdit}
						<Editor
							{api}
							items={EDITOR_ITEMS}
							placement="modal"
							autoSave={false}
							topBar={false}
							bottomBar={EDITOR_BOTTOM_BAR}
							hotkeys={{ delete: false }}
							onsave={onEditorSave}
							onaction={onEditorAction}
						/>
					{/if}
				</Locale>
			</Willow>
		</div>
	{/if}
</div>

<!-- The month's events as a list: the grid's events are mouse-only, and on phones the details are easier to read here -->
{#if status === "ready"}
	<section class="event-list" aria-labelledby="event-list-heading">
		<h3 id="event-list-heading">What's on in {formatMonth(viewDate)}</h3>
		{#if monthEvents.length}
			<ul>
				{#each monthEvents as event (event.id)}
					<li class="event-list-item event-{event.category ?? 'class'}">
						<p class="event-list-when">
							{#if categoryLabel(event)}<span class="event-list-type">{categoryLabel(event)}</span> ·{/if}
							{formatWhen(event)}
						</p>
						<h4>{event.text}</h4>
						{#if event.details}<p class="event-list-details">{event.details}</p>{/if}
						{#if event.link || canEdit}
							<div class="event-list-actions">
								{#if event.link}
									<a href={event.link} target="_blank" rel="noopener noreferrer"
										>Book or learn more <ArrowUpRightIcon aria-hidden="true" /><span class="visually-hidden">
											about {event.text} (opens in a new tab)</span
										></a
									>
								{/if}
								{#if canEdit}
									<button data-event-edit={event.id} onclick={() => api?.exec("select-event", { id: event.id })}
										><PencilSimpleIcon aria-hidden="true" /> Edit<span class="visually-hidden"> {event.text}</span></button
									>
								{/if}
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		{:else}
			<p class="event-list-empty">Nothing is scheduled for {formatMonth(viewDate)} yet. Check back soon.</p>
		{/if}
	</section>
{/if}

<style>
	/* Everything SVAR renders is themed from here. Its variables go on its theme element, which would otherwise reset
	   anything inherited from the wrapper; then its public wx- classes. Its popups and the admin's editor modal are
	   portalled out of the wrapper, so those rules are global (see the bottom) */
	div.event-calendar {
		position: relative;
		/* Fixed height before and after load, so nothing below jumps */
		height: clamp(480px, calc(var(--vh, 1vh) * 75), 820px);
		overflow: hidden;
		border-radius: var(--border-radius);
		box-shadow: var(--shadow);
		background-color: var(--color-cream);
		color: var(--color-text);
	}

	div.event-calendar-grid {
		height: 100%;
	}

	div.event-calendar-grid :global(.wx-willow-theme) {
		height: 100%;
	}

	p.event-calendar-message {
		display: grid;
		place-items: center;
		height: 100%;
		padding: var(--spacing-l);
		text-align: center;
	}

	/* Toolbar */
	div.event-calendar :global(.wx-navigation) {
		padding: var(--spacing-s) var(--spacing-m);
		border-bottom: 1px solid var(--wx-calendar-grid-color);
	}

	div.event-calendar :global(.wx-navigation .wx-toolbar) {
		gap: var(--spacing-s);
	}

	/* Month title */
	div.event-calendar :global(.wx-navigation .wx-date-label) {
		font-size: var(--font-heading-s);
		font-weight: 600;
		white-space: nowrap;
	}

	/* Weekday headings */
	div.event-calendar :global(.wx-month-label) {
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--color-brown-mid);
	}

	/* Days outside the month dim back; today gets a peach wash */
	div.event-calendar :global(.wx-grid-cell.wx-out-of-month) {
		background-color: color-mix(in srgb, var(--color-peach) 30%, var(--color-cream));
		/* Dimmer than the month's own days, but still 4.5:1 */
		color: color-mix(in srgb, var(--color-text) 78%, var(--color-cream));
	}

	div.event-calendar :global(.wx-grid-cell.wx-today) {
		background-color: color-mix(in srgb, var(--color-peach) 75%, var(--color-cream));
		font-weight: 700;
	}

	/* At least a 24px target, on one line so it never spills into the next week */
	div.event-calendar :global(.wx-more-button) {
		display: inline-flex;
		align-items: center;
		min-height: 24px;
		padding-inline: 2px;
		color: var(--color-primary);
		font-size: 12px;
		font-weight: 600;
		white-space: nowrap;
	}

	/* Events take their type's colour: single-day ones as a dot beside the time, longer ones as a filled bar.
	   The type is spelt out in the list below and the event card, so colour is never the only cue */
	div.event-calendar :global(.wx-bar-event) {
		--event-color: var(--color-brown);
		--event-text: var(--color-white);
		border-radius: 4px;
		font-size: 12px;
		cursor: pointer;
	}

	/* Its bar is a lighter tan-dark, so the dark text on it reaches 4.5:1 */
	div.event-calendar :global(.wx-bar-event.event-workshop) {
		--event-color: var(--color-tan-dark);
		--event-fill: color-mix(in srgb, var(--color-tan-dark) 55%, var(--color-cream));
		--event-text: var(--color-text);
	}

	div.event-calendar :global(.wx-bar-event.event-training) {
		--event-color: var(--color-brown-dark);
	}

	div.event-calendar :global(.wx-bar-event.event-community) {
		--event-color: var(--color-tan);
		--event-text: var(--color-text);
	}

	div.event-calendar :global(.wx-bar-event:not(.wx-bar-single-day)) {
		background-color: var(--event-fill, var(--event-color));
		color: var(--event-text);
		font-weight: 600;
	}

	div.event-calendar :global(.wx-bar-event.wx-bar-single-day) {
		color: var(--color-text);
	}

	/* A filled bar already carries the colour, so its dot goes */
	div.event-calendar :global(.wx-bar-event:not(.wx-bar-single-day) .wx-bar-marker) {
		display: none;
	}

	/* The type colour fills the dot; a brown ring keeps every dot at 3:1 against the day, however pale its fill */
	div.event-calendar :global(.wx-bar-single-day .wx-bar-marker) {
		flex-shrink: 0;
		box-sizing: border-box;
		border: 1.5px solid var(--color-brown);
		background-color: var(--event-color);
	}

	@media (hover: hover) {
		div.event-calendar :global(.wx-bar-event.wx-bar-single-day:hover) {
			background-color: color-mix(in srgb, var(--color-peach) 70%, transparent);
		}

		/* In Edit mode a click on a day adds an event there */
		div.event-calendar.editable :global(.wx-grid-cell) {
			cursor: pointer;
		}
	}

	/* Up to 1024px events are just their colour, a dot for one day and a strip for longer: day cells are under ~100px
	   wide, and a truncated "Dr…" helps no one. The list below the grid has the details */
	div.event-calendar :global(.wx-bar-time),
	div.event-calendar :global(.wx-bar-title) {
		display: none;
	}

	div.event-calendar :global(.wx-bar-single-day .wx-bar-marker) {
		width: 8px;
		height: 8px;
	}

	/* The toolbar's items are all pinned, so its row wraps on narrow screens rather than overflowing */
	div.event-calendar :global(.wx-navigation .wx-toolbar) {
		flex-wrap: wrap;
	}

	@media screen and (min-width: 1024px) {
		div.event-calendar :global(.wx-bar-time),
		div.event-calendar :global(.wx-bar-title) {
			display: revert;
		}

		div.event-calendar :global(.wx-bar-single-day .wx-bar-marker) {
			width: 6px;
			height: 6px;
		}
	}

	/* SVAR's theme variables. Global, as its popups and the editor modal are portalled outside the wrapper;
	   it's the only SVAR widget on the site. :root outranks Willow's own rule whichever stylesheet loads last.
	   Popups and the modal sit above the nav (1000) */
	:global(:root .wx-willow-theme) {
		--wx-font-family: var(--font-body);
		--wx-font-size: 14px;
		--wx-font-size-md: 14px;
		--wx-font-weight-md: 600;
		--wx-color-font: var(--color-text);
		--wx-color-font-alt: var(--color-brown-mid);
		--wx-color-primary: var(--color-primary);
		--wx-color-primary-font: var(--color-white);
		--wx-color-primary-selected: var(--color-peach);
		--wx-color-link: var(--color-primary);
		--wx-color-danger: var(--color-error);
		--wx-color-secondary-hover: color-mix(in srgb, var(--color-primary) 12%, transparent);
		--wx-icon-color: var(--color-primary);
		--wx-background: var(--color-cream);
		--wx-background-alt: var(--color-peach);
		--wx-background-hover: color-mix(in srgb, var(--color-peach) 60%, var(--color-cream));
		--wx-border-color: color-mix(in srgb, var(--color-tan) 70%, var(--color-cream));
		--wx-border-radius: 6px;
		--wx-calendar-grid-color: color-mix(in srgb, var(--color-tan) 70%, var(--color-cream));
		--wx-calendar-weekend-background: color-mix(in srgb, var(--color-peach) 20%, var(--color-cream));
		--wx-button-font-color: var(--color-text);
		--wx-button-box-shadow: none;
		--wx-button-primary-box-shadow: none;
		--wx-input-border: 1px solid var(--color-tan-dark);
		--wx-input-border-focus: 1px solid var(--color-primary);
		--wx-popup-z-index: 1050;
		--wx-modal-z-index: 1050;
		--wx-popup-background: var(--color-cream);
		--wx-popup-border-radius: 10px;
		--wx-popup-shadow: var(--shadow);
		--wx-modal-background: var(--color-cream);
		--wx-modal-border-radius: var(--border-radius);
		--wx-modal-backdrop: var(--color-overlay-brown);
		--wx-modal-header-font-color: var(--color-text);
	}

	/* The list below the grid */
	section.event-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-m);
		/* A section inside a section: the page section already pads it */
		padding: 0;
		margin-top: var(--spacing-l);
		color: var(--color-text);
	}

	section.event-list h3 {
		font-size: var(--font-heading-s);
		font-weight: 600;
	}

	section.event-list ul {
		display: grid;
		gap: var(--spacing-m);
		padding: 0;
		list-style: none;
	}

	/* The type colour runs down the left edge, matching the grid */
	li.event-list-item {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
		padding: var(--spacing-m);
		border-left: 6px solid var(--color-brown);
		border-radius: 10px;
		background-color: var(--color-cream);
	}

	li.event-workshop {
		border-left-color: var(--color-tan-dark);
	}

	li.event-training {
		border-left-color: var(--color-brown-dark);
	}

	li.event-community {
		border-left-color: var(--color-tan);
	}

	span.event-list-type {
		font-weight: 700;
	}

	p.event-list-when {
		font-size: 14px;
		font-weight: 500;
		color: var(--color-brown-mid);
	}

	li.event-list-item h4 {
		font-size: 18px;
		font-weight: 600;
		line-height: 1.25;
	}

	p.event-list-details {
		font-size: 16px;
		line-height: 1.4;
		white-space: pre-line;
		overflow-wrap: anywhere;
	}

	div.event-list-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-s) var(--spacing-m);
		margin-top: var(--spacing-xs);
	}

	/* Icons are 1em in currentColor */
	div.event-list-actions a,
	div.event-list-actions button {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		min-height: 32px;
		padding: 0;
		border: 0;
		background: none;
		color: var(--color-primary);
		font: inherit;
		font-size: 16px;
		font-weight: 600;
	}

	div.event-list-actions a {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	@media (hover: hover) {
		div.event-list-actions a:hover {
			text-decoration-thickness: 2px;
		}

		div.event-list-actions button:hover {
			text-decoration: underline;
		}
	}

	@media screen and (min-width: 768px) {
		section.event-list ul {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media screen and (min-width: 1280px) {
		section.event-list ul {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
</style>
