// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	// Custom events dispatched by actions in $lib/utils
	declare namespace svelteHTML {
		interface HTMLAttributes<T> {
			onoutclick?: (event: CustomEvent) => void;
			onintersect?: (event: CustomEvent<boolean>) => void;
		}
	}
}

export {};
