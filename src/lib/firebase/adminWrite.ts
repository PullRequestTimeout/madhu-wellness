import { firebaseErrorCode } from "./errors";

export type WriteResult<T> = { ok: true; data: T } | { ok: false; message: string };

/** Use for every Firestore write, so a rules rejection becomes a friendly message */
export async function adminWrite<T>(op: () => Promise<T>): Promise<WriteResult<T>> {
	try {
		return { ok: true, data: await op() };
	} catch (err) {
		if (firebaseErrorCode(err) === "permission-denied") {
			return { ok: false, message: "You don't have permission to do that. Try logging in again." };
		}
		console.error(err);
		return { ok: false, message: "Something went wrong saving your changes." };
	}
}
