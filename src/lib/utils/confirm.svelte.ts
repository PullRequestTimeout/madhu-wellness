import { browser } from "$app/environment";

// A branded replacement for window.confirm(), rendered by <ConfirmDialog /> in the root layout.
//
//   import { confirmDialog } from "$lib/utils/confirm.svelte";
//   if (await confirmDialog({ title: "Delete this event?", message: "This can't be undone.", confirmText: "Delete", danger: true })) …
//
// Resolves true when confirmed, false when cancelled (Cancel, Escape or the backdrop).

export type ConfirmOptions = {
	title: string;
	message?: string;
	confirmText?: string;
	cancelText?: string;
	/** A destructive action: the confirm button turns red */
	danger?: boolean;
};

// Only ever written in the browser: module state is shared across requests on the server
export const confirmState = $state<{ open: boolean; options: ConfirmOptions | null }>({ open: false, options: null });

let resolve: ((confirmed: boolean) => void) | null = null;

export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
	if (!browser) return Promise.resolve(false);
	// A second request while one is open cancels the first
	resolve?.(false);
	confirmState.options = options;
	confirmState.open = true;
	return new Promise((r) => (resolve = r));
}

/** Called by ConfirmDialog with the user's answer */
export function settleConfirm(confirmed: boolean) {
	confirmState.open = false;
	const r = resolve;
	resolve = null;
	r?.(confirmed);
}
