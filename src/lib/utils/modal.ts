// Page scroll lock, shared by everything modal: the contact panel, the admin login, the event editor and the
// confirmation dialog. Hiding the scrollbar would widen the page and shift it sideways, so the body is padded by the
// scrollbar's width to hold it still; a full-screen dialog covers the space the scrollbar leaves.
// Counted, so modals can stack (a confirmation over the event editor) and the page only unlocks when the last closes.
let locks = 0;
let saved = { overflow: "", paddingRight: "" };

/** Locks page scroll and returns the function that releases this lock (safe to call more than once) */
export function lockScroll(): () => void {
	if (locks++ === 0) {
		const html = document.documentElement;
		const scrollbarWidth = window.innerWidth - html.clientWidth;
		saved = { overflow: html.style.overflow, paddingRight: document.body.style.paddingRight };
		html.style.overflow = "hidden";
		document.body.style.paddingRight = `${scrollbarWidth}px`;
	}
	let released = false;
	return () => {
		if (released) return;
		released = true;
		if (--locks > 0) return;
		document.documentElement.style.overflow = saved.overflow;
		document.body.style.paddingRight = saved.paddingRight;
	};
}

/**
 * Opens a <dialog> as a modal when it mounts: the top layer and the inert page behind it come from showModal().
 * onOpen receives the element that had focus beforehand, so the dialog can refocus it once it has closed.
 *
 * It also locks page scroll. The lock is released in destroy, which runs once any exit transition has finished, so
 * the scrollbar can't reappear beside the dialog while it's still animating out.
 */
export function modal(node: HTMLDialogElement, onOpen?: (opener: HTMLElement | null) => void) {
	// Grab the opener first, as showModal() moves focus into the dialog
	onOpen?.(document.activeElement as HTMLElement | null);
	const unlock = lockScroll();
	node.showModal();
	return { destroy: unlock };
}

/** Whether an element can take focus back: still in the document and not hidden */
export function canRefocus(el: HTMLElement | null): el is HTMLElement {
	return !!el && el.isConnected && el.offsetParent !== null;
}
