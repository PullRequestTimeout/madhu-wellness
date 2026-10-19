import type { DocumentData, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import { adminWrite, type WriteResult } from "$lib/firebase/adminWrite";
import { loadDb } from "$lib/firebase/load";

// Calendar events live in the Firestore `events` collection: public to read, admin-only to write (see firestore.rules,
// which validates this same shape). Everything here is browser-only and loads Firestore on demand.

export const CATEGORIES = [
	{ id: "class", label: "Class" },
	{ id: "workshop", label: "Workshop" },
	{ id: "training", label: "Training" },
	{ id: "community", label: "Community" }
] as const;

export type Category = (typeof CATEGORIES)[number]["id"];

/** An event as the calendar holds it: Firestore's Timestamps become Dates, and the doc id is the event id */
export type SiteEvent = {
	id: string;
	text: string;
	start: Date;
	end: Date;
	allDay: boolean;
	details?: string;
	link?: string;
	category?: Category;
};

const COLLECTION = "events";
const CATEGORY_IDS: readonly string[] = CATEGORIES.map((c) => c.id);

function fromDoc(snap: QueryDocumentSnapshot<DocumentData>): SiteEvent {
	const d = snap.data();
	return {
		id: snap.id,
		text: d.text ?? "",
		start: (d.start as Timestamp).toDate(),
		end: (d.end as Timestamp).toDate(),
		allDay: !!d.allDay,
		details: d.details || undefined,
		link: d.link || undefined,
		category: CATEGORY_IDS.includes(d.category) ? d.category : undefined
	};
}

/** The fields the rules allow, tidied: optional strings are dropped when empty, as the rules reject empty links */
function toDoc(event: Omit<SiteEvent, "id">) {
	const data: Record<string, unknown> = {
		text: event.text.trim(),
		start: event.start,
		end: event.end,
		allDay: !!event.allDay
	};
	const details = event.details?.trim();
	const link = event.link?.trim();
	if (details) data.details = details;
	if (link) data.link = link;
	if (event.category && CATEGORY_IDS.includes(event.category)) data.category = event.category;
	return data;
}

/** Only https links are stored, matching the rules */
export function isValidLink(link: string | undefined) {
	return !link?.trim() || /^https:\/\/\S+$/.test(link.trim());
}

/** Streams every event, ordered by start. Returns the unsubscribe function */
export async function subscribeEvents(onEvents: (events: SiteEvent[]) => void, onError: (err: unknown) => void) {
	const [{ db }, { collection, onSnapshot, orderBy, query }] = await Promise.all([loadDb(), import("firebase/firestore")]);
	return onSnapshot(query(collection(db, COLLECTION), orderBy("start")), (snap) => onEvents(snap.docs.map(fromDoc)), onError);
}

/** A fresh Firestore doc id, so a new event keeps the same id in the calendar and in the database */
export async function newEventId() {
	const [{ db }, { collection, doc }] = await Promise.all([loadDb(), import("firebase/firestore")]);
	return doc(collection(db, COLLECTION)).id;
}

/** Creates or overwrites the event, so a first save and later edits take the same path */
export async function saveEvent(event: SiteEvent): Promise<WriteResult<void>> {
	const [{ db }, { doc, setDoc, serverTimestamp }] = await Promise.all([loadDb(), import("firebase/firestore")]);
	const { id, ...rest } = event;
	return adminWrite(() => setDoc(doc(db, COLLECTION, id), { ...toDoc(rest), updatedAt: serverTimestamp() }));
}

export async function deleteEvent(id: string): Promise<WriteResult<void>> {
	const [{ db }, { doc, deleteDoc }] = await Promise.all([loadDb(), import("firebase/firestore")]);
	return adminWrite(() => deleteDoc(doc(db, COLLECTION, id)));
}
