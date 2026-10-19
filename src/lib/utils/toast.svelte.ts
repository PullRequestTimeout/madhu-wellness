import { browser } from "$app/environment";

// Toasts: brief, visible feedback that's also announced to screen readers. Rendered by <Toaster /> in the root layout.
//
//   import { toast } from "$lib/utils/toast.svelte";
//   toast.success("Event saved.");
//   toast.error("Couldn't save the event. Please try again.");
//   toast.info("Edit mode is on.", { duration: 3000 });
//
// Successes and notices dismiss themselves (pausing while hovered or focused); errors stay until dismissed.
// Prefer inline messages for form validation, and don't toast while a modal <dialog> is open: the page behind a
// modal is inert, so the toast would be hidden and unannounced. Toast once the dialog has closed instead.

export type ToastKind = "success" | "error" | "info";

export type Toast = {
	id: number;
	kind: ToastKind;
	message: string;
	/** Milliseconds before it dismisses itself; 0 keeps it until dismissed */
	duration: number;
};

type ToastOptions = { duration?: number };

const DEFAULT_DURATION: Record<ToastKind, number> = { success: 5000, info: 5000, error: 0 };
// Older toasts make way, so a burst of messages can't fill the screen
const MAX_TOASTS = 3;
const MAX_TOASTS_PHONE = 2;

// Only ever written in the browser: module state is shared across requests on the server
export const toasts = $state<Toast[]>([]);

// What the Toaster's always-present live regions read out: errors interrupt, everything else waits its turn.
// Kept apart from the visible toasts so screen readers hear the message, not the dismiss button too.
// Each message is added as its own node, which live regions announce as an addition, so messages raised in quick
// succession queue up rather than overwriting each other. They're removed once read, to keep the regions short.
type Announcement = { id: number; message: string };
export const announcements = $state<{ polite: Announcement[]; assertive: Announcement[] }>({ polite: [], assertive: [] });

const ANNOUNCEMENT_LIFETIME = 10000;
let nextId = 1;

function announce(id: number, kind: ToastKind, message: string) {
	const region = announcements[kind === "error" ? "assertive" : "polite"];
	region.push({ id, message });
	setTimeout(() => {
		const index = region.findIndex((a) => a.id === id);
		if (index !== -1) region.splice(index, 1);
	}, ANNOUNCEMENT_LIFETIME);
}

function show(kind: ToastKind, message: string, options: ToastOptions = {}): number {
	if (!browser) return 0;
	const id = nextId++;
	// A repeated message replaces its earlier copy rather than stacking up
	const duplicate = toasts.findIndex((t) => t.kind === kind && t.message === message);
	if (duplicate !== -1) toasts.splice(duplicate, 1);
	toasts.push({ id, kind, message, duration: options.duration ?? DEFAULT_DURATION[kind] });
	// Phones keep fewer, so the stack can't cover much of a small screen
	const max = window.matchMedia("(min-width: 768px)").matches ? MAX_TOASTS : MAX_TOASTS_PHONE;
	if (toasts.length > max) toasts.splice(0, toasts.length - max);
	announce(id, kind, message);
	return id;
}

export function dismissToast(id: number) {
	const index = toasts.findIndex((t) => t.id === id);
	if (index !== -1) toasts.splice(index, 1);
}

/** Shows a toast and returns its id, for dismissToast() */
export const toast = Object.assign(
	(message: string, options?: ToastOptions & { kind?: ToastKind }) => show(options?.kind ?? "info", message, options),
	{
		success: (message: string, options?: ToastOptions) => show("success", message, options),
		error: (message: string, options?: ToastOptions) => show("error", message, options),
		info: (message: string, options?: ToastOptions) => show("info", message, options)
	}
);
