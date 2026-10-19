// Slide action for content that collapses to a clamped preview, e.g. a one-line bio with "See more".
// Usage: <p use:slideOpen={open}>…</p>. CSS clamps the node while it has .collapsed; this animates its height between
// the clamped and full sizes with the Web Animations API, since CSS can't transition to height: auto everywhere.
// The node needs overflow: hidden. Closing keeps the full text showing until it has slid shut, then clamps it.

export function slideOpen(node: HTMLElement, open: boolean) {
	let animation: Animation | undefined;
	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

	node.classList.toggle("collapsed", !open);

	return {
		update(next: boolean) {
			if (next === open) return;
			open = next;

			// Measure from wherever it is now (mid-slide included), then the size it's heading for
			const from = node.getBoundingClientRect().height;
			animation?.cancel();
			node.classList.toggle("collapsed", !open);
			const to = node.getBoundingClientRect().height;
			if (reducedMotion.matches) return;

			if (!open) node.classList.remove("collapsed");
			animation = node.animate({ height: [`${from}px`, `${to}px`] }, { duration: 450, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
			animation.onfinish = () => {
				node.classList.toggle("collapsed", !open);
				animation = undefined;
			};
		},
		destroy() {
			animation?.cancel();
		}
	};
}
