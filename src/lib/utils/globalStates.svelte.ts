// Global UI state shared across components (runes, no stores)
export const uiStore = $state({ modalOpen: false });

export function openModal() {
	uiStore.modalOpen = true;
}

export function closeModal() {
	uiStore.modalOpen = false;
}
