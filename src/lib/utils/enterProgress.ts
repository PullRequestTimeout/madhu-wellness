// Scroll-linked progress action for elements scrolling into view (no pinning).
// Usage: <section use:enterProgress> or use:enterProgress={{ end: 0.2 }}
// Sets --enter on the node: 0 when its top touches the bottom of the viewport, 1 once `end` of its height is on screen.
// Scrolling back up runs it in reverse.

export interface EnterProgressOptions {
	end?: number; // fraction of the node's height that must be visible to reach 1
}

export function enterProgress(node: HTMLElement, options: EnterProgressOptions = {}) {
	let { end = 0.2 } = options;
	let frame = 0;

	const update = () => {
		frame = 0;
		const rect = node.getBoundingClientRect();
		const distance = rect.height * end;
		const progress = distance > 0 ? Math.min(Math.max((window.innerHeight - rect.top) / distance, 0), 1) : 1;
		node.style.setProperty("--enter", progress.toFixed(4));
	};

	const schedule = () => {
		if (!frame) frame = requestAnimationFrame(update);
	};

	const listen = () => {
		window.addEventListener("scroll", schedule, { passive: true });
		window.addEventListener("resize", schedule, { passive: true });
	};

	const stop = () => {
		window.removeEventListener("scroll", schedule);
		window.removeEventListener("resize", schedule);
	};

	// Only track scrolling while the node is on screen, with one last update on the way out so it settles at 0 or 1
	const observer = new IntersectionObserver(([entry]) => {
		if (entry.isIntersecting) listen();
		else stop();
		update();
	});

	observer.observe(node);
	update();

	return {
		update(newOptions: EnterProgressOptions = {}) {
			end = newOptions.end ?? 0.2;
			update();
		},
		destroy() {
			observer.disconnect();
			stop();
			cancelAnimationFrame(frame);
		}
	};
}
