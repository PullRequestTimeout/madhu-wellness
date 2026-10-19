/**
 * Opens a <dialog> as a modal when it mounts: the top layer and the inert page behind it come from showModal().
 * onOpen receives the element that had focus beforehand, so the dialog can refocus it once it has closed.
 *
 * It also locks page scroll. Hiding the scrollbar would widen the page and shift it sideways, so the body is
 * padded by the scrollbar's width to hold it still; a full-screen dialog covers the space the scrollbar leaves.
 * The lock is released in destroy, which runs once any exit transition has finished, so the scrollbar can't
 * reappear beside the dialog while it's still animating out.
 */
export function modal(node: HTMLDialogElement, onOpen?: (opener: HTMLElement | null) => void) {
	// Grab the opener first, as showModal() moves focus into the dialog
	onOpen?.(document.activeElement as HTMLElement | null);

	const html = document.documentElement;
	const scrollbarWidth = window.innerWidth - html.clientWidth;
	const previous = { overflow: html.style.overflow, paddingRight: document.body.style.paddingRight };
	html.style.overflow = "hidden";
	document.body.style.paddingRight = `${scrollbarWidth}px`;

	node.showModal();

	return {
		destroy() {
			html.style.overflow = previous.overflow;
			document.body.style.paddingRight = previous.paddingRight;
		}
	};
}

/** Whether an element can take focus back: still in the document and not hidden */
export function canRefocus(el: HTMLElement | null): el is HTMLElement {
	return !!el && el.isConnected && el.offsetParent !== null;
}
