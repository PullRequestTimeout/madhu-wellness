// Pointer-tracking action for elements that follow the cursor.
// Usage: <section use:followPointer>…</section>. While the pointer moves over the node, sets --pointer-x and
// --pointer-y on it (unitless viewport px, for position: fixed children). CSS does the rest, easing the follow
// with a transition rather than a JS animation loop.

export function followPointer(node: HTMLElement) {
	let frame = 0;
	let x = 0;
	let y = 0;

	const update = () => {
		frame = 0;
		node.style.setProperty("--pointer-x", x.toFixed(1));
		node.style.setProperty("--pointer-y", y.toFixed(1));
	};

	const move = (event: PointerEvent) => {
		x = event.clientX;
		y = event.clientY;
		if (!frame) frame = requestAnimationFrame(update);
	};

	// On entering, jump straight to the pointer, so a follower never eases in from wherever it last was (or 0, 0)
	const enter = (event: PointerEvent) => {
		cancelAnimationFrame(frame);
		x = event.clientX;
		y = event.clientY;
		update();
	};

	node.addEventListener("pointerenter", enter);
	node.addEventListener("pointermove", move, { passive: true });

	return {
		destroy() {
			node.removeEventListener("pointerenter", enter);
			node.removeEventListener("pointermove", move);
			cancelAnimationFrame(frame);
		}
	};
}
