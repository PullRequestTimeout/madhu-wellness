import { browser } from "$app/environment";

// Firebase is loaded on demand: most visitors never sign in, so the SDK shouldn't weigh down every page.
// Each loader caches its promise, and forgets a failed one (e.g. offline) so the next call can retry.

let authModule: Promise<typeof import("./authClient")> | null = null;

export function loadAuth() {
	if (!browser) throw new Error("Firebase Auth is browser-only");
	authModule ??= import("./authClient").catch((err) => {
		authModule = null;
		throw err;
	});
	return authModule;
}

let dbModule: Promise<typeof import("./dbClient")> | null = null;

export function loadDb() {
	if (!browser) throw new Error("Firestore is browser-only");
	dbModule ??= import("./dbClient").catch((err) => {
		dbModule = null;
		throw err;
	});
	return dbModule;
}
