// One download per src. The decoded Image is kept alive so the browser keeps its bitmap and an <img> with the same src paints at once
const decoding = new Map<string, Promise<void>>();

/** Resolves once `src` is downloaded and decoded, or after `timeoutMs` so a slow connection never stalls navigation for long. Never rejects */
export function preloadImage(src: string, timeoutMs = 1000): Promise<void> {
	let ready = decoding.get(src);
	if (!ready) {
		const img = new Image();
		img.src = src;
		ready = img.decode().then(
			() => void img,
			() => void decoding.delete(src) // Let a later call retry
		);
		decoding.set(src, ready);
	}
	return Promise.race([ready, new Promise<void>((resolve) => setTimeout(resolve, timeoutMs))]);
}
