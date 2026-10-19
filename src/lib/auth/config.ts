import { PUBLIC_ADMIN_UIDS } from "$env/static/public";

// UX only: the allowlist in firestore.rules is what actually enforces admin access. Keep the two in sync.
export const ADMIN_UIDS: readonly string[] = PUBLIC_ADMIN_UIDS.split(",")
	.map((uid) => uid.trim())
	.filter(Boolean);

export function isAdminUid(uid: string | null | undefined): boolean {
	return !!uid && ADMIN_UIDS.includes(uid);
}
