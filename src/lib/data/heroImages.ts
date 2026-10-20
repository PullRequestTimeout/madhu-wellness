import type { RouteId } from "$app/types";

// Each page's hero photo, keyed by route, so the layout can load the next page's before navigating to it
export const heroImages = {
	"/": "/assets/images/hero-home.webp",
	"/about": "/assets/images/hero-about.jpg",
	"/classes-events": "/assets/images/space-rental.jpg",
	"/treatments-practitioners": "/assets/images/hero-treatments-practitioners.jpg"
} satisfies Partial<Record<RouteId, string>>;

export function heroImageFor(routeId: string | null | undefined): string | undefined {
	return routeId ? heroImages[routeId as keyof typeof heroImages] : undefined;
}
