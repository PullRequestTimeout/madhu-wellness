import type { SiteEvent } from "./events";

const LOCALE = "en-CA";
const dayFmt = new Intl.DateTimeFormat(LOCALE, { weekday: "long", month: "long", day: "numeric" });
const shortDayFmt = new Intl.DateTimeFormat(LOCALE, { weekday: "short", month: "short", day: "numeric" });
const timeFmt = new Intl.DateTimeFormat(LOCALE, { hour: "numeric", minute: "2-digit" });
const monthFmt = new Intl.DateTimeFormat(LOCALE, { month: "long", year: "numeric" });

const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** The calendar stores an all-day event's end as the following midnight; this is the last day it actually covers */
export function lastDay(event: Pick<SiteEvent, "start" | "end" | "allDay">): Date {
	if (!event.allDay) return event.end;
	return new Date(Math.max(event.start.getTime(), event.end.getTime() - 1));
}

/** e.g. "Saturday, October 25 · 6:00 p.m. – 7:30 p.m.", "Saturday, October 25 (all day)" or "Sat, Oct 25 – Mon, Oct 27" */
export function formatWhen(event: Pick<SiteEvent, "start" | "end" | "allDay">): string {
	const end = lastDay(event);
	if (event.allDay) {
		return sameDay(event.start, end) ? `${dayFmt.format(event.start)} (all day)` : `${shortDayFmt.format(event.start)} – ${shortDayFmt.format(end)}`;
	}
	if (sameDay(event.start, end)) return `${dayFmt.format(event.start)} · ${timeFmt.format(event.start)} – ${timeFmt.format(end)}`;
	return `${shortDayFmt.format(event.start)}, ${timeFmt.format(event.start)} – ${shortDayFmt.format(end)}, ${timeFmt.format(end)}`;
}

export function formatMonth(date: Date): string {
	return monthFmt.format(date);
}

/** Whether the event touches the given month */
export function inMonth(event: Pick<SiteEvent, "start" | "end" | "allDay">, month: Date): boolean {
	const first = new Date(month.getFullYear(), month.getMonth(), 1);
	const next = new Date(month.getFullYear(), month.getMonth() + 1, 1);
	return event.start < next && lastDay(event) >= first;
}
