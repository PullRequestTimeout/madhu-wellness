<script lang="ts">
	import { Checkbox, DatePicker, TimePicker } from "@svar-ui/svelte-core";

	// The event editor's dates, replacing SVAR's EventDatesForm (registered as "site-dates" in CalendarView). Theirs:
	// - shows an all-day event's stored end, the following midnight, so a one-day event on the 15th read "ends the 16th"
	//   and an admin entering the last day they meant got an event one day short. Here the last day is shown and
	//   entered, and stored as the following midnight as the calendar expects
	// - labels its inputs with plain spans; here they're real labels
	// - uses the month-first US date format; here it's day/month/year
	type Dates = { start: Date; end: Date; allDay?: boolean };
	let { value, error, onchange }: { value: Dates; error?: unknown; onchange: (ev: { value: Dates }) => void } = $props();

	const uid = $props.id();
	const DATE_FORMAT = "%d/%m/%Y";

	const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
	const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, d.getHours(), d.getMinutes());

	// The last day an all-day event covers: the day before its stored end, but never before its start
	// Calendar days, not 24 hours, so a clock change (e.g. spring forward) can't land it on the wrong day
	const shownEnd = $derived(
		value.allDay ? new Date(Math.max(midnight(value.start).getTime(), midnight(addDays(value.end, -1)).getTime())) : value.end
	);

	function update(part: Partial<Dates>) {
		onchange({ value: { ...value, ...part } });
	}

	function withTime(day: Date, time: Date) {
		const next = new Date(day);
		next.setHours(time.getHours(), time.getMinutes(), 0, 0);
		return next;
	}

	// Moving the start moves the end with it, keeping the event's length
	function pickStart(day: Date | null) {
		if (!day) return;
		const start = withTime(day, value.start);
		update({ start, end: new Date(value.end.getTime() + (start.getTime() - value.start.getTime())) });
	}

	function pickEnd(day: Date | null) {
		if (!day) return;
		// All day: the picked day is the last one covered, stored as the midnight after it
		update({ end: value.allDay ? addDays(midnight(day), 1) : withTime(day, value.end) });
	}

	function pickTime(key: "start" | "end", time: Date | null) {
		if (!time) return;
		update({ [key]: withTime(value[key], time) });
	}

	function toggleAllDay(allDay: boolean) {
		if (allDay) {
			// Whole days, from the start's day through the end's
			update({ allDay, start: midnight(value.start), end: addDays(midnight(value.end), 1) });
		} else {
			// Back to a timed event: an hour from 9am on the first day, rather than midnight to midnight
			const start = new Date(value.start.getFullYear(), value.start.getMonth(), value.start.getDate(), 9);
			update({ allDay, start, end: new Date(start.getTime() + 60 * 60 * 1000) });
		}
	}
</script>

<div class="event-dates" class:error={!!error}>
	<div class="event-dates-row">
		<label class="event-dates-label" for="{uid}-start">Start date</label>
		<div class="event-dates-date">
			<DatePicker
				id="{uid}-start"
				value={value.start}
				format={DATE_FORMAT}
				buttons={false}
				onchange={(ev: { value: Date | null }) => pickStart(ev.value)}
			/>
		</div>
		{#if !value.allDay}
			<div class="event-dates-time">
				<label class="visually-hidden" for="{uid}-start-time">Start time</label>
				<TimePicker id="{uid}-start-time" value={value.start} onchange={(ev: { value: Date | null }) => pickTime("start", ev.value)} />
			</div>
		{/if}
	</div>

	<div class="event-dates-row">
		<label class="event-dates-label" for="{uid}-end">{value.allDay ? "Last day" : "End date"}</label>
		<div class="event-dates-date">
			<DatePicker id="{uid}-end" value={shownEnd} format={DATE_FORMAT} buttons={false} onchange={(ev: { value: Date | null }) => pickEnd(ev.value)} />
		</div>
		{#if !value.allDay}
			<div class="event-dates-time">
				<label class="visually-hidden" for="{uid}-end-time">End time</label>
				<TimePicker id="{uid}-end-time" value={value.end} onchange={(ev: { value: Date | null }) => pickTime("end", ev.value)} />
			</div>
		{/if}
	</div>

	<div class="event-dates-row">
		<span class="event-dates-label" aria-hidden="true"></span>
		<Checkbox label="All day" value={!!value.allDay} onchange={(ev: { value: boolean }) => toggleAllDay(ev.value)} />
	</div>
</div>

<style>
	/* Laid out as SVAR's own date form */
	div.event-dates {
		display: flex;
		flex-direction: column;
		gap: var(--wx-padding, 8px);
	}

	div.event-dates-row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--wx-padding, 8px);
	}

	.event-dates-label {
		flex-shrink: 0;
		min-width: 5em;
		font-size: var(--wx-font-size, 14px);
		color: var(--color-text);
	}

	div.event-dates-date {
		flex: 1;
		min-width: 0;
	}

	div.event-dates-time {
		width: 96px;
		flex-shrink: 0;
	}
</style>
