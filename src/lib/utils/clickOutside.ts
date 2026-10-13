// Dispatches an "outclick" event when a click lands outside the node (typed in app.d.ts).
// Usage: <header use:clickOutside onoutclick={() => (open = false)}>

export function clickOutside(node: HTMLElement) {
	const handleClick = (event: MouseEvent) => {
		if (!node.contains(event.target as Node)) {
			node.dispatchEvent(new CustomEvent("outclick"));
		}
	};

	document.addEventListener("click", handleClick, true);

	return {
		destroy() {
			document.removeEventListener("click", handleClick, true);
		}
	};
}
