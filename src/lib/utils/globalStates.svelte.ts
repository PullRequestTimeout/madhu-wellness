// Global UI state shared across components (runes, no stores)
export const uiStore = $state({ modalOpen: false, contactOpen: false, loginOpen: false, announcement: "" });

export function openContact() {
	uiStore.contactOpen = true;
}

export function closeContact() {
	uiStore.contactOpen = false;
}

export function openLogin() {
	uiStore.loginOpen = true;
}

export function closeLogin() {
	uiStore.loginOpen = false;
}

export function openModal() {
	uiStore.modalOpen = true;
}

export function closeModal() {
	uiStore.modalOpen = false;
}

/** Read out by the layout's status region, for changes that have no visible message of their own (e.g. signing in) */
export function announce(message: string) {
	// Cleared first, so repeating the same message is still announced
	uiStore.announcement = "";
	setTimeout(() => (uiStore.announcement = message), 50);
}
