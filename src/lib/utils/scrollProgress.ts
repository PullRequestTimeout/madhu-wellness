// Scroll-linked progress action for pinned (scrubbed) animations.
// Usage: <div class="track" use:scrollProgress><div class="stage">…</div></div>, where the stage is position: sticky
// and the track is taller than it. Sets --progress on the track: 0 when the stage pins, 1 when it unpins.
// Scrolling back up runs it in reverse. Pass { onProgress } to also hear each new value, e.g. to pick a discrete step.

type ScrollProgressOptions = {
	onProgress?: (progress: number) => void;
};

export function scrollProgress(node: HTMLElement, options: ScrollProgressOptions = {}) {
	let frame = 0;
	let onProgress = options.onProgress;

	const update = () => {
		frame = 0;
		const stage = node.firstElementChild as HTMLElement | null;
		if (!stage) return;
		// The stage pins once the track's top scrolls up past the stage's sticky top
		const pinTop = parseFloat(getComputedStyle(stage).top) || 0;
		const distance = node.offsetHeight - stage.offsetHeight;
		const scrolled = pinTop - node.getBoundingClientRect().top;
		const progress = distance > 0 ? Math.min(Math.max(scrolled / distance, 0), 1) : 0;
		node.style.setProperty("--progress", progress.toFixed(4));
		onProgress?.(progress);
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

	// Only track scrolling while the track is on screen, with one last update on the way out so it settles at 0 or 1
	const observer = new IntersectionObserver(([entry]) => {
		if (entry.isIntersecting) listen();
		else stop();
		update();
	});

	observer.observe(node);
	update();

	return {
		update(next: ScrollProgressOptions = {}) {
			onProgress = next.onProgress;
		},
		destroy() {
			observer.disconnect();
			stop();
			cancelAnimationFrame(frame);
		}
	};
}
