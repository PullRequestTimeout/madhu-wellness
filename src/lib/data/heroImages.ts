import type { RouteId } from "$app/types";

// Each page's hero photo, keyed by route, so the layout can load the next page's before navigating to it
export const heroImages = {
	"/": "/assets/images/hero-home.webp",
	"/about": "/assets/images/hero-about.webp",
	"/classes-events": "/assets/images/hero-classes-events.webp",
	"/treatments-practitioners": "/assets/images/hero-treatments-practitioners.webp"
} satisfies Partial<Record<RouteId, string>>;

export function heroImageFor(routeId: string | null | undefined): string | undefined {
	return routeId ? heroImages[routeId as keyof typeof heroImages] : undefined;
}
