/**
 * The error's Firebase code (e.g. "auth/invalid-credential"), or null.
 * Read by shape rather than instanceof FirebaseError, so importing this doesn't pull firebase/app into every page.
 */
export function firebaseErrorCode(err: unknown): string | null {
	if (typeof err === "object" && err !== null && "code" in err && typeof err.code === "string") return err.code;
	return null;
}
