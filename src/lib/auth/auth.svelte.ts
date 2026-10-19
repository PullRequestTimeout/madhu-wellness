import { browser } from "$app/environment";
import type { User } from "firebase/auth";
import { firebaseConfigured } from "$lib/firebase/config";
import { loadAuth } from "$lib/firebase/load";
import { isAdminUid } from "./config";

type AuthState = {
	user: User | null;
	isAdmin: boolean;
	/** false until we know whether an admin is signed in. Always false on the server, so SSR never renders admin UI */
	ready: boolean;
};

// Only ever written in the browser: module state is shared across requests on the server
export const authStore = $state<AuthState>({ user: null, isAdmin: false, ready: false });

// Set while an admin is signed in, so a returning admin's session is restored on load. Without it the visitor
// can't have a session, and Firebase isn't loaded at all until someone opens the login form.
const SESSION_HINT = "madhu-admin-session";

function hasSessionHint() {
	try {
		return localStorage.getItem(SESSION_HINT) === "1";
	} catch {
		return false;
	}
}

function setSessionHint(on: boolean) {
	try {
		if (on) localStorage.setItem(SESSION_HINT, "1");
		else localStorage.removeItem(SESSION_HINT);
	} catch {
		// Storage blocked: the session still works, it just isn't restored on the next visit
	}
}

let unsubscribe: (() => void) | null = null;
let listening: Promise<void> | null = null;

/** Loads Firebase Auth and keeps authStore in sync with it. Safe to call repeatedly; resolves once auth state is known */
export function startAuthListener(): Promise<void> {
	if (!browser || !firebaseConfigured) return Promise.resolve();
	listening ??= (async () => {
		const [{ auth }, { onAuthStateChanged }] = await Promise.all([loadAuth(), import("firebase/auth")]);
		unsubscribe = onAuthStateChanged(auth, (user) => {
			authStore.user = user;
			authStore.isAdmin = isAdminUid(user?.uid);
			authStore.ready = true;
			setSessionHint(authStore.isAdmin);
		});
		await auth.authStateReady();
	})().catch((err) => {
		listening = null;
		throw err;
	});
	return listening;
}

/** Call once from the root +layout.svelte onMount. Returns a cleanup function */
export function initAuth(): () => void {
	if (!browser) return () => {};
	if (firebaseConfigured && hasSessionHint()) {
		startAuthListener().catch((err) => {
			// Offline or blocked: carry on signed out rather than leaving admin UI waiting forever
			console.error(err);
			authStore.ready = true;
		});
	} else {
		authStore.ready = true;
	}
	return () => {
		unsubscribe?.();
		unsubscribe = null;
		listening = null;
	};
}

/** Await in browser-only code before reading auth state. Avoids the hard-refresh race */
export async function waitForAuth(): Promise<User | null> {
	if (!browser || !firebaseConfigured) return null;
	await startAuthListener();
	const { auth } = await loadAuth();
	return auth.currentUser;
}
