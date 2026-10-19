// Global UI state shared across components (runes, no stores)
export const uiStore = $state({ modalOpen: false, contactOpen: false, loginOpen: false });

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
