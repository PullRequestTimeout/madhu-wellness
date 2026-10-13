// Reusable IntersectionObserver action.
// Usage: <div class="scroll-fade-up" use:isIntersecting> or use:isIntersecting={{ threshold: 0.5, once: false }}
// Adds `class` (default "show") when visible and dispatches an "intersect" event (typed in app.d.ts).

export interface IntersectOptions extends IntersectionObserverInit {
	class?: string; // class to toggle when visible
	once?: boolean; // only fire once
}

export function isIntersecting(node: HTMLElement, options: IntersectOptions = {}) {
	const { threshold = 0.1, root = null, rootMargin = "0px", class: cls = "show", once = true } = options;

	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) {
				if (cls) node.classList.add(cls);
				node.dispatchEvent(new CustomEvent("intersect", { detail: true }));
				if (once) observer.disconnect();
			} else {
				if (cls && !once) node.classList.remove(cls);
				node.dispatchEvent(new CustomEvent("intersect", { detail: false }));
			}
		},
		{ threshold, root, rootMargin }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}
