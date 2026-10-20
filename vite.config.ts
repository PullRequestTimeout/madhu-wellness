import adapter from "@sveltejs/adapter-netlify";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { sveltePhosphorOptimize } from "phosphor-svelte/vite";

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) => (filename.split(/[/\\]/).includes("node_modules") ? undefined : true)
			},
			adapter: adapter({ edge: false, split: false }),
			// Inline every stylesheet (global.css and the components') into the SSR <head>, so first paint never waits on a CSS request
			inlineStyleThreshold: Infinity
		}),
		// Rewrites named phosphor-svelte imports to per-icon ones, so dev doesn't compile every icon
		sveltePhosphorOptimize()
	]
});
