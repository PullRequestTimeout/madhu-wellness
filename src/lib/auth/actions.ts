import { firebaseConfigured } from "$lib/firebase/config";
import { firebaseErrorCode } from "$lib/firebase/errors";
import { loadAuth } from "$lib/firebase/load";
import { startAuthListener } from "./auth.svelte";
import { isAdminUid } from "./config";

export type AuthResult = { ok: true } | { ok: false; message: string };

const INVALID_LOGIN = "Incorrect email or password.";

// With email enumeration protection on, a bad email and a bad password both come back as auth/invalid-credential.
// The legacy codes stay in case protection is ever turned off.
const MESSAGES: Record<string, string> = {
	"auth/invalid-credential": INVALID_LOGIN,
	"auth/wrong-password": INVALID_LOGIN,
	"auth/user-not-found": INVALID_LOGIN,
	"auth/invalid-email": "That doesn't look like a valid email address.",
	"auth/missing-password": "Please enter your password.",
	"auth/missing-email": "Please enter your email address.",
	"auth/user-disabled": "This account has been disabled.",
	"auth/too-many-requests": "Too many attempts. Wait a few minutes or reset your password.",
	"auth/network-request-failed": "Network error. Check your connection and try again.",
	"auth/operation-not-allowed": "Email and password sign-in isn't enabled for this site."
};

const NOT_CONFIGURED: AuthResult = { ok: false, message: "Admin sign-in isn't set up yet." };

function toMessage(err: unknown): string {
	const code = firebaseErrorCode(err);
	if (code && code in MESSAGES) return MESSAGES[code];
	console.error(err);
	return "Something went wrong. Please try again.";
}

export async function login(email: string, password: string): Promise<AuthResult> {
	if (!firebaseConfigured) return NOT_CONFIGURED;
	try {
		// Listen first, so authStore picks up the new session
		await startAuthListener();
		const [{ auth }, { signInWithEmailAndPassword, signOut }] = await Promise.all([loadAuth(), import("firebase/auth")]);
		const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
		if (!isAdminUid(user.uid)) {
			// Sign-up is disabled, so this shouldn't happen. Don't leave a non-admin session around.
			await signOut(auth);
			return { ok: false, message: "This account isn't authorised to make changes." };
		}
		return { ok: true };
	} catch (err) {
		return { ok: false, message: toMessage(err) };
	}
}

export async function logout(): Promise<AuthResult> {
	if (!firebaseConfigured) return { ok: true };
	try {
		const [{ auth }, { signOut }] = await Promise.all([loadAuth(), import("firebase/auth")]);
		await signOut(auth);
		return { ok: true };
	} catch (err) {
		return { ok: false, message: toMessage(err) };
	}
}

/** With enumeration protection on, this succeeds whether or not the account exists */
export async function resetPassword(email: string): Promise<AuthResult> {
	if (!firebaseConfigured) return NOT_CONFIGURED;
	try {
		const [{ auth }, { sendPasswordResetEmail }] = await Promise.all([loadAuth(), import("firebase/auth")]);
		await sendPasswordResetEmail(auth, email.trim());
		return { ok: true };
	} catch (err) {
		return { ok: false, message: toMessage(err) };
	}
}
