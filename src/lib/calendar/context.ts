import { getContext, setContext } from "svelte";

// Shared with components SVAR renders inside the calendar (the event card), which can't take props from us directly

type CalendarContext = {
	/** Whether the signed-in admin has Edit mode on */
	readonly canEdit: boolean;
	/** Opens the editor on an event */
	edit: (id: string) => void;
};

const KEY = Symbol("event-calendar");

export const setCalendarContext = (ctx: CalendarContext) => setContext(KEY, ctx);
export const getCalendarContext = () => getContext<CalendarContext>(KEY);
