# SvelteKit Starter: Project Boilerplate Spec

> **For the agent reading this:** Use this file to scaffold a new marketing-style website with SvelteKit (Svelte 5 runes) and TypeScript.
> Follow the steps in order. Create every file listed in **Section 4** exactly as shown. Swap each `{{PLACEHOLDER}}` for a real value.
> If you don't know a value, ask the user before you start. Don't add extra libraries (Tailwind, UI kits, CSS-in-JS and so on) unless the user asks for them.
> Styling uses plain CSS: global tokens and utilities in `static/global.css`, and scoped `<style>` blocks inside components.

## 0. Placeholders to collect from the user

| Placeholder            | Example                            | Used in                               |
| ---------------------- | ---------------------------------- | ------------------------------------- |
| `{{PROJECT_NAME}}`     | `ophirsaunas`                      | `package.json`, folder name           |
| `{{SITE_NAME}}`        | `Ophir Mobile Saunas`              | `SeoHead`, manifest, Nav, Footer      |
| `{{SITE_SHORT_NAME}}`  | `OphirSaunas`                      | manifest                              |
| `{{SITE_DESCRIPTION}}` | One or two sentence description    | `SeoHead` default                     |
| `{{DOMAIN}}`           | `example.ca`                       | Plausible analytics script (optional) |
| `{{HEADING_FONT}}`     | `Abigail` (woff2/woff files)       | `global.css`, `app.html` preload      |
| `{{ROUTES}}`           | `about, pricing, contact, privacy` | `src/routes/*`, Nav, Footer           |
| Brand colors           | primary, secondary, backgrounds    | `global.css` `:root`                  |

---

## 1. Scaffold

Run these from the parent folder, or use `.` as the path if you're already in an empty project folder:

```sh
npx sv create {{PROJECT_NAME}} --template minimal --types ts --add prettier --install npm
cd {{PROJECT_NAME}}
npm i -D @sveltejs/adapter-netlify
npm uninstall @sveltejs/adapter-auto
npm i material-icons
```

Then overwrite or create the files in Section 4.

---

## 2. Folder structure (target)

```
.
├── .npmrc
├── .prettierrc
├── .prettierignore
├── .gitignore
├── _redirects                  # Netlify proxy rules (e.g. Plausible analytics)
├── netlify.toml
├── package.json
├── svelte.config.js
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── app.d.ts                # global types + custom element event typings
│   ├── app.html                # fonts preload, global CSS, --vh fix, analytics
│   ├── lib/
│   │   ├── components/         # PascalCase .svelte files, one component per file
│   │   │   ├── Nav.svelte
│   │   │   ├── Footer.svelte
│   │   │   ├── PrimaryButton.svelte
│   │   │   ├── SeoHead.svelte
│   │   │   └── SpanifyText.svelte
│   │   ├── data/               # static content as exported arrays/objects (camelCase .js/.ts)
│   │   │   └── faqs.ts
│   │   └── utils/              # camelCase .ts: Svelte actions + shared runes state
│   │       ├── clickOutside.ts
│   │       ├── isIntersecting.ts
│   │       └── globalStates.svelte.ts
│   └── routes/
│       ├── +layout.svelte      # Nav + {@render children()} + Footer (+ global modals)
│       ├── +page.svelte        # Home
│       ├── about/+page.svelte
│       ├── contact/+page.svelte
│       └── privacy/+page.svelte
└── static/
    ├── global.css              # CRITICAL CSS: fonts, reset, tokens, globals, utilities, hero, above-fold animations
    ├── global-noncritical.css  # NON-CRITICAL CSS: scroll animations, loaded at end of <body>
    ├── robots.txt
    └── assets/
        ├── favicon/            # favicon.ico, favicon.svg, favicon-96x96.png, apple-touch-icon.png, site.webmanifest, web-app-manifest-*.png
        ├── fonts/              # *.woff2 + *.woff
        ├── images/             # jpg/webp photos, og-image.jpg
        ├── svgs/               # logo.svg, icons
        └── video/
```

### File and folder naming rules

- **Components:** `PascalCase.svelte` in `src/lib/components/`. Import them with `$lib/components/Name.svelte`.
- **Utils and actions:** `camelCase.ts` in `src/lib/utils/`. A file that uses runes outside a component must end in `.svelte.ts`, for example `globalStates.svelte.ts`.
- **Data:** `camelCase.ts` in `src/lib/data/`. Export named arrays such as `export const homeFaqs = [...]`.
- **Routes:** use lowercase kebab-case folders with a `+page.svelte` in each. Keep it to one level of nesting unless there's a real need for more.
- **Static assets:** reference them with absolute paths (`/assets/images/1.jpg`). Don't import images through Vite.

---

## 3. Conventions

### 3.1 Svelte / TypeScript

- Every component uses `<script lang="ts">` and **Svelte 5 runes**: `$props()`, `$state()`, `$derived()`, `$bindable()`. Don't use `export let`, `$:` or stores.
- Type props inline or with a local `type XProps = {...}`, then destructure with defaults:
  ```ts
  let { title = "Default", href }: { title?: string; href?: string } = $props();
  ```
- Event handlers use the new attribute syntax: `onclick={...}`, not `on:click`.
- Keep shared UI state in a `$state` object exported from `globalStates.svelte.ts`, plus small open/close functions. Don't add a store library.
- DOM behavior goes into **Svelte actions** (`use:isIntersecting`, `use:clickOutside`). If an action dispatches a custom event, type that event in `app.d.ts`.
- For the current route, use `page` from `$app/state` (not `$app/stores`).

### 3.2 Page anatomy (every `+page.svelte`)

```svelte
<script lang="ts">
	import SeoHead from "$lib/components/SeoHead.svelte";
	import { isIntersecting } from "$lib/utils/isIntersecting";
	import SpanifyText from "$lib/components/SpanifyText.svelte";
</script>

<SeoHead title="About | {{ SITE_NAME }}" description="Page-specific description." />

<!-- Optional: per-page hero background, kept out of the component CSS so it can be swapped per route -->
<svelte:head>
	<style>
		section.hero {
			background: url(/assets/images/hero-about.jpg) center/cover no-repeat;
		}
	</style>
</svelte:head>

<main>
	<section class="hero">
		<div class="hero-text">
			<h1>About</h1>
			<h2 class="decorative-heading">Big decorative headline</h2>
			<p class="subheading">Supporting line of text</p>
		</div>
	</section>

	<section class="story">
		<h2 class="long-heading heading-fade-in" use:isIntersecting>
			<SpanifyText text="A longer section heading that fades in letter by letter." />
		</h2>
		<p class="text-light">Body copy…</p>
		<div class="story-points group-stagger-fade" use:isIntersecting>
			<div class="story-point">…</div>
			<div class="story-point">…</div>
		</div>
	</section>
</main>

<style>
	section.story {
		display: grid;
		gap: var(--spacing-l);
	}
</style>
```

- Each top-level block is a `<section>`. Global CSS gives it `padding-inline: var(--padding-inline)` and `padding-block: var(--padding-block)`, so pages never set their own outer padding.
- Each page has exactly one `<main>`. Nav and Footer live in `+layout.svelte`.

### 3.3 CSS naming conventions

- **Classes are kebab-case and use the section or component name as a prefix,** for example `footer-heading`, `footer-quick-links`, `sauna-text`, `sauna-text-dotpoint`, `hero-text`, `faq-item` and `faq-answer`. A class reads as `{block}-{element}` or `{block}-{element}-{sub}`. Don't use BEM `__` or `--`.
- **Qualify selectors with the element type** in both scoped and global CSS: `section.hero`, `div.hero-text`, `div.faq-item button`, `img.site-logo`.
- **State classes** are short words that get toggled: `.active`, `.open`, `.show`, `.scrolled`. Example: `header.scrolled`, `svg.hamburgericon.active`.
- **Variant classes** are plain words on the element: `.primary` / `.secondary`.
- **Global utility classes** live in `global.css` and describe purpose:
  - Typography: `.decorative-heading`, `.long-heading`, `.icon-heading`, `.text-light`, `.text-semi-bold`
  - Backgrounds: `.bg-{color}`, for example `.bg-green` and `.bg-tan`
  - Animation: `.heading-fade-in`, `.scroll-fade-up`, `.group-stagger-fade` (each needs `use:isIntersecting`, which adds `.show`)
- **CSS custom properties** follow `--{category}-{name}-{size}`:
  - `--font-heading`, `--font-body` (families)
  - `--font-body-s|m|l`, `--font-heading-s|m|l` (sizes)
  - `--color-primary`, `--color-primary-light`, `--color-primary-transparent`, `--color-secondary`, `--color-background-{name}`, `--color-white|black|grey`
  - `--spacing-xs|s|m|l|xl`, `--padding-inline`, `--padding-block`
  - `--border-width`, `--border-radius`, `--shadow`
- **Never hard-code colors, font sizes or spacing in components.** Use the tokens. Responsive scaling happens by **redefining tokens inside media queries in `global.css`**, so components rarely need their own breakpoints for size changes.
- **Write mobile first** with `min-width` breakpoints: `768px`, `1024px` (desktop nav switch), `1280px` (type and spacing jump), `1440px`, `1600px`.
- Wrap hover effects in `@media (hover: hover)`.
- Component-specific runtime values go in inline CSS variables, for example `style="--top: {y}px"`. The CSS then reads them as `var(--top)`.

### 3.4 Critical vs non-critical CSS

- `static/global.css` is loaded in `<head>` and holds everything needed for first paint: fonts, the reset, tokens, globals, utilities, hero styles and above-the-fold animations.
- `static/global-noncritical.css` is linked at the **end of `<body>`** and holds below-the-fold scroll animations.
- Component styles stay scoped inside each `.svelte` file.

### 3.5 Formatting

Prettier settings: tabs, double quotes, no trailing commas, print width 150. Run `npm run format` before committing.

---

## 4. Files to create

### `.npmrc`

```
engine-strict=true
```

### `.prettierrc`

```json
{
	"useTabs": true,
	"singleQuote": false,
	"trailingComma": "none",
	"printWidth": 150,
	"plugins": ["prettier-plugin-svelte"],
	"overrides": [{ "files": "*.svelte", "options": { "parser": "svelte" } }]
}
```

### `.prettierignore`

```
package-lock.json
pnpm-lock.yaml
yarn.lock
bun.lock
bun.lockb
/static/
```

### `.gitignore`

```
node_modules
.output
.vercel
.netlify
.wrangler
/.svelte-kit
/build
.DS_Store
Thumbs.db
.env
.env.*
!.env.example
!.env.test
vite.config.js.timestamp-*
vite.config.ts.timestamp-*
```

### `netlify.toml`

```toml
[build]
	command = "npm run build"
	publish = "build"
```

### `_redirects` (only if you're using Plausible; this proxies the script past ad-blockers)

```
/js/script.tagged-events.js https://plausible.io/js/script.tagged-events.js 200
/api/event https://plausible.io/api/event 200
```

### `svelte.config.js`

```js
import adapter from "@sveltejs/adapter-netlify";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({ edge: false, split: false })
	}
};

export default config;
```

### `vite.config.ts`

```ts
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [sveltekit()]
});
```

### `tsconfig.json`

```json
{
	"extends": "./.svelte-kit/tsconfig.json",
	"compilerOptions": {
		"rewriteRelativeImportExtensions": true,
		"allowJs": true,
		"checkJs": true,
		"esModuleInterop": true,
		"forceConsistentCasingInFileNames": true,
		"resolveJsonModule": true,
		"skipLibCheck": true,
		"sourceMap": true,
		"strict": true,
		"moduleResolution": "bundler"
	}
}
```

### `package.json` scripts (keep the versions `sv create` installs)

```json
"scripts": {
	"dev": "vite dev",
	"build": "vite build",
	"preview": "vite preview",
	"prepare": "svelte-kit sync || echo ''",
	"check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
	"check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
	"lint": "prettier --check .",
	"format": "prettier --write ."
}
```

### `src/app.html`

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />

		<!-- Favicon -->
		<link rel="icon" type="image/png" href="/assets/favicon/favicon-96x96.png" sizes="96x96" />
		<link rel="icon" type="image/svg+xml" href="/assets/favicon/favicon.svg" />
		<link rel="shortcut icon" href="/assets/favicon/favicon.ico" />
		<link rel="apple-touch-icon" sizes="180x180" href="/assets/favicon/apple-touch-icon.png" />
		<link rel="manifest" href="/assets/favicon/site.webmanifest" />

		<!-- Preload fonts, then load critical CSS -->
		<link rel="preload" href="/assets/fonts/{{HEADING_FONT}}.woff2" as="font" type="font/woff2" crossorigin />
		<link rel="stylesheet" href="%sveltekit.assets%/global.css" />

		<!-- Plausible Analytics (optional; delete if unused) -->
		<script defer data-domain="{{DOMAIN}}" src="/js/script.tagged-events.js"></script>

		%sveltekit.head%
		<script>
			// CSS variable for the real viewport height (handles mobile browser UI bars)
			document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
		</script>
	</head>

	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
		<link rel="stylesheet" href="%sveltekit.assets%/global-noncritical.css" />
	</body>
</html>
```

### `src/app.d.ts`

```ts
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
```

### `static/global.css`

```css
/* Font Imports ---------------------------------------- */

@font-face {
	font-family: "{{HEADING_FONT}}";
	font-weight: 400;
	font-style: normal;
	src:
		url("/assets/fonts/{{HEADING_FONT}}.woff2") format("woff2"),
		url("/assets/fonts/{{HEADING_FONT}}.woff") format("woff");
	font-display: swap;
}

/* Reset ----------------------------------------------- */

*,
*::before,
*::after {
	box-sizing: border-box;
}

* {
	margin: 0;
}

body {
	line-height: 1.2;
	-webkit-font-smoothing: antialiased;
}

img,
picture,
video,
canvas,
svg {
	display: block;
	max-width: 100%;
}

input,
button,
textarea,
select {
	font: inherit;
}

p,
h1,
h2,
h3,
h4,
h5,
h6 {
	overflow-wrap: break-word;
}

p {
	text-wrap: pretty;
}

h1,
h2,
h3,
h4,
h5,
h6 {
	text-wrap: balance;
}

button {
	cursor: pointer;
}

/* Variables ------------------------------------------- */

:root {
	/* Fonts */
	--font-heading: "{{HEADING_FONT}}", serif;
	--font-body:
		-apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, Adwaita Sans, Cantarell, Ubuntu, roboto, noto, helvetica, arial,
		sans-serif;

	/* Font sizes */
	--font-body-s: 12px;
	--font-body-m: 16px;
	--font-body-l: 20px;

	--font-heading-s: 20px;
	--font-heading-m: 24px;
	--font-heading-l: 36px;

	/* Colors (replace with brand palette) */
	--color-background-white: #faf3eb;
	--color-background-green: #babe9f;
	--color-background-tan: #ebc797;

	--color-white: #fff;
	--color-black: #000;
	--color-grey: #383838;

	--color-primary: #414833;
	--color-primary-light: #64704e;
	--color-primary-transparent: #41483380;

	--color-secondary: #936639;

	/* Spacing */
	--padding-inline: 1rem;
	--padding-block: 2rem;

	--spacing-xs: 0.25rem;
	--spacing-s: 0.5rem;
	--spacing-m: 1rem;
	--spacing-l: 2rem;
	--spacing-xl: 4rem;

	/* Utils */
	--border-width: 3px;
	--border-radius: 20px;
	--shadow: 0 4px 6px #41418333;
}

@media screen and (min-width: 768px) {
	:root {
		--padding-inline: 2rem;
	}
}

@media screen and (min-width: 1280px) {
	:root {
		--font-body-s: 16px;
		--font-body-m: 20px;
		--font-body-l: 24px;

		--font-heading-s: 24px;
		--font-heading-m: 36px;
		--font-heading-l: 64px;

		--padding-inline: 4rem;
		--padding-block: 4rem;
	}
}

@media screen and (min-width: 1440px) {
	:root {
		--padding-inline: 6rem;
	}
}

@media screen and (min-width: 1600px) {
	:root {
		--padding-inline: 8rem;
	}
}

/* Global Styles --------------------------------------- */

:root {
	color-scheme: light;
}

html {
	overflow-x: hidden;
	max-width: 100vw;
	background-color: var(--color-background-white);
}

* {
	scrollbar-color: var(--color-primary) var(--color-background-white);
}

img,
button {
	user-select: none;
}

*:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6) {
	font-family: var(--font-body);
}

*::selection {
	color: var(--color-white);
	background-color: var(--color-primary);
}

a {
	text-decoration: none;
	color: inherit;
}

a:visited {
	color: inherit;
}

section,
footer {
	padding-inline: var(--padding-inline);
	padding-block: var(--padding-block);
}

/* Utilities ------------------------------------------- */

/* Icons (material-icons) */
span.material-icons {
	color: var(--color-primary);
	font-size: 24px;
}

@media screen and (min-width: 1024px) {
	span.material-icons {
		font-size: 32px;
	}
}

/* Headings */
.decorative-heading {
	font-family: var(--font-heading);
	font-size: var(--font-heading-l);
	line-height: 1;
}

.long-heading {
	font-family: var(--font-body);
	font-size: var(--font-heading-m);
	text-wrap: unset;
}

.decorative-heading,
.long-heading {
	font-weight: 700;
	color: var(--color-primary);
}

.icon-heading {
	display: flex;
	gap: var(--spacing-s);
}

.icon-heading p {
	font-size: var(--font-heading-s);
	font-weight: 600;
	color: var(--color-primary);
}

/* Text */
.text-light {
	color: var(--color-grey);
	font-weight: 300;
}

.text-semi-bold {
	color: var(--color-primary);
	font-weight: 600;
}

/* Background Colors */
.bg-green {
	background-color: var(--color-background-green);
}

.bg-tan {
	background-color: var(--color-background-tan);
}

/* Heros */
section.hero {
	position: relative;
	display: flex;
	align-items: flex-end;
	height: 85vh;
	height: calc(var(--vh) * 85);
	margin-top: 4.5rem;
}

div.hero-text {
	position: relative;
	display: flex;
	flex-direction: column;
	gap: var(--spacing-s);
	max-width: 90%;
}

div.hero-text h1 {
	color: var(--color-white);
	font-size: var(--font-body-m);
	border: 2px solid var(--color-white);
	padding: 0.25rem 0.75rem 0.4rem 0.75rem;
	width: fit-content;
	font-weight: 600;
	border-radius: var(--border-radius);
	margin-bottom: var(--spacing-s);
}

div.hero-text h2 {
	color: var(--color-white);
	font-size: var(--font-heading-l);
	text-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.5);
}

div.hero-text p.subheading {
	color: var(--color-white);
	font-size: var(--font-body-l);
	font-weight: 300;
	margin-bottom: var(--spacing-s);
}

@media screen and (min-width: 1024px) {
	div.hero-text {
		max-width: 60%;
	}
}

/* Above fold animations (pair with SpanifyText + use:isIntersecting) */
.heading-fade-in span {
	opacity: 0;
	filter: blur(2px);
	transition:
		opacity 0.5s ease,
		filter 0.5s ease;
}

.heading-fade-in.show span {
	opacity: 1;
	filter: blur(0);
}
```

### `static/global-noncritical.css`

```css
/* Scroll Animations (pair with use:isIntersecting) */
.scroll-fade-up {
	opacity: 0;
	transform: translateY(2rem);
	transition:
		opacity 0.5s ease,
		transform 0.5s ease;
}

.scroll-fade-up.show {
	opacity: 1;
	transform: translateY(0);
}

/* Children fade up one after another */
.group-stagger-fade > * {
	opacity: 0;
	transform: translateY(2rem);
	transition:
		opacity 0.5s ease,
		transform 0.5s ease;
}

.group-stagger-fade.show > * {
	opacity: 1;
	transform: translateY(0);
}

/* 50ms per child; extend the list if a group has more than 12 children */
.group-stagger-fade.show > *:nth-child(1) {
	transition-delay: 0.05s;
}
.group-stagger-fade.show > *:nth-child(2) {
	transition-delay: 0.1s;
}
.group-stagger-fade.show > *:nth-child(3) {
	transition-delay: 0.15s;
}
.group-stagger-fade.show > *:nth-child(4) {
	transition-delay: 0.2s;
}
.group-stagger-fade.show > *:nth-child(5) {
	transition-delay: 0.25s;
}
.group-stagger-fade.show > *:nth-child(6) {
	transition-delay: 0.3s;
}
.group-stagger-fade.show > *:nth-child(7) {
	transition-delay: 0.35s;
}
.group-stagger-fade.show > *:nth-child(8) {
	transition-delay: 0.4s;
}
.group-stagger-fade.show > *:nth-child(9) {
	transition-delay: 0.45s;
}
.group-stagger-fade.show > *:nth-child(10) {
	transition-delay: 0.5s;
}
.group-stagger-fade.show > *:nth-child(11) {
	transition-delay: 0.55s;
}
.group-stagger-fade.show > *:nth-child(12) {
	transition-delay: 0.6s;
}
```

### `static/robots.txt`

```
User-agent: *
Disallow:
```

### `static/assets/favicon/site.webmanifest`

```json
{
	"name": "{{SITE_NAME}}",
	"short_name": "{{SITE_SHORT_NAME}}",
	"icons": [
		{ "src": "/assets/favicon/web-app-manifest-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
		{ "src": "/assets/favicon/web-app-manifest-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
	],
	"theme_color": "#FAF3EB",
	"background_color": "#FAF3EB",
	"display": "standalone"
}
```

Also create empty `static/assets/{fonts,images,svgs,video}/` folders. Tell the user to add the font files, `og-image.jpg`, `logo.svg` and the favicon set (realfavicongenerator.net produces exactly this file set).

### `src/lib/utils/isIntersecting.ts`

```ts
// Reusable IntersectionObserver action.
// Usage: <div class="scroll-fade-up" use:isIntersecting> or use:isIntersecting={{ threshold: 0.5, once: false }}
// Adds `class` (default "show") when visible and dispatches an "intersect" event (typed in app.d.ts).

export interface IntersectOptions extends IntersectionObserverInit {
	class?: string; // class to toggle when visible
	once?: boolean; // only fire once
}

export function isIntersecting(node: HTMLElement, options: IntersectOptions = {}) {
	const { threshold = 0.1, root = null, rootMargin = "0px", class: cls = "show", once = true } = options;

	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) {
				if (cls) node.classList.add(cls);
				node.dispatchEvent(new CustomEvent("intersect", { detail: true }));
				if (once) observer.disconnect();
			} else {
				if (cls && !once) node.classList.remove(cls);
				node.dispatchEvent(new CustomEvent("intersect", { detail: false }));
			}
		},
		{ threshold, root, rootMargin }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}
```

### `src/lib/utils/clickOutside.ts`

```ts
// Dispatches an "outclick" event when a click lands outside the node (typed in app.d.ts).
// Usage: <header use:clickOutside onoutclick={() => (open = false)}>

export function clickOutside(node: HTMLElement) {
	const handleClick = (event: MouseEvent) => {
		if (!node.contains(event.target as Node)) {
			node.dispatchEvent(new CustomEvent("outclick"));
		}
	};

	document.addEventListener("click", handleClick, true);

	return {
		destroy() {
			document.removeEventListener("click", handleClick, true);
		}
	};
}
```

### `src/lib/utils/globalStates.svelte.ts`

```ts
// Global UI state shared across components (runes, no stores)
export const uiStore = $state({ modalOpen: false });

export function openModal() {
	uiStore.modalOpen = true;
}

export function closeModal() {
	uiStore.modalOpen = false;
}
```

### `src/lib/components/SpanifyText.svelte`

```svelte
<!-- Wraps each character in a span so .heading-fade-in can animate letter by letter -->
<!-- Usage: <h2 class="heading-fade-in" use:isIntersecting><SpanifyText text="Hello" /></h2> -->
<script lang="ts">
	let { text = "" }: { text: string } = $props();
</script>

{#each text.split("") as char, i}
	<span style="transition-delay: {i * 25}ms">{char}</span>
{/each}

<style>
	span {
		font: inherit;
	}
</style>
```

### `src/lib/components/SeoHead.svelte`

```svelte
<!-- Use in every +page.svelte with a page-specific title and description. OG image lives at static/assets/images/og-image.jpg -->
<script lang="ts">
	import { page } from "$app/state";

	let { title = "{{SITE_NAME}}", description = "{{SITE_DESCRIPTION}}" }: { title?: string; description?: string } = $props();
	const image = "/assets/images/og-image.jpg";
	const url = $derived(page.url.toString());
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />

	<meta property="og:type" content="website" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={image} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />

	<meta name="robots" content="index, follow" />
	<link rel="canonical" href={url} />
</svelte:head>
```

### `src/lib/components/PrimaryButton.svelte`

```svelte
<script lang="ts">
	type PrimaryButtonProps = {
		href?: string;
		text?: string;
		primary?: boolean;
		type?: "button" | "submit" | "reset";
		onAction?: (event: MouseEvent) => void;
	};

	let { href, text = "Button", primary = true, type = "button", onAction }: PrimaryButtonProps = $props();

	let buttonEl: HTMLAnchorElement | HTMLButtonElement | undefined = $state();
	let mousePos = $state({ x: 0, y: 0 });

	// Ripple originates from where the cursor entered
	function getMousePos(event: MouseEvent) {
		if (!buttonEl) return;
		const rect = buttonEl.getBoundingClientRect();
		mousePos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
	}
</script>

{#if href}
	<a bind:this={buttonEl} {href} class={primary ? "primary" : "secondary"} onmouseenter={getMousePos} onclick={(e) => onAction?.(e)}>
		<span>{text}</span>
		<div style="--top: {mousePos.y}px; --left: {mousePos.x}px;"></div>
	</a>
{:else}
	<button bind:this={buttonEl} {type} class={primary ? "primary" : "secondary"} onmouseenter={getMousePos} onclick={(e) => onAction?.(e)}>
		<span>{text}</span>
		<div style="--top: {mousePos.y}px; --left: {mousePos.x}px;"></div>
	</button>
{/if}

<style>
	a,
	button {
		position: relative;
		display: inline-block;
		padding: 0.35rem 1.5rem 0.5rem 1.5rem;
		border: 0;
		border-radius: var(--border-radius);
		font-size: 16px;
		font-weight: 600;
		background-color: var(--color-primary);
		color: var(--color-white);
		overflow: hidden;
		transition: 0.25s ease-out;
		width: fit-content;
	}

	a span,
	button span {
		position: relative;
		z-index: 1;
		text-transform: capitalize;
	}

	a > div,
	button > div {
		position: absolute;
		top: var(--top);
		left: var(--left);
		transform: translate(-50%, -50%);
		width: 0;
		height: 0;
		border-radius: 50%;
		pointer-events: none;
		background-color: var(--color-primary-light);
		transition:
			width 0.4s ease-out,
			height 0.4s ease-out;
	}

	a.secondary,
	button.secondary {
		background-color: transparent;
		box-shadow: inset 0 0 0 var(--border-width) var(--color-primary);
		color: var(--color-primary);
		transition: color 0.4s ease-out;
	}

	a.secondary > div,
	button.secondary > div {
		background-color: var(--color-primary);
	}

	@media (hover: hover) {
		a:hover > div,
		button:hover > div {
			width: 30rem;
			height: 30rem;
		}

		a.secondary:hover,
		button.secondary:hover {
			color: var(--color-white);
		}
	}
</style>
```

### `src/lib/components/Nav.svelte`

Build it this way:

- Two `<header>` elements. `header.small-screens` shows below 1024px with a hamburger and a slide-down `<nav>`. `header.large-screens` shows at 1024px and up with inline links and a `PrimaryButton` CTA.
- Both headers are `position: fixed`, `z-index: 1000`, `width: 100vw`, `padding: var(--spacing-xs) var(--padding-inline)`. The `.scrolled` state gives them a `--color-background-white` background and a shadow.
- The mobile header uses `use:clickOutside onoutclick={() => (showMobileMenu = false)}`. Each mobile link closes the menu on click.
- The mobile menu uses `transition:slide`. Each link uses `in:fade={{ delay: n * 100 }}` with increasing delays and `<hr>` dividers in between.
- Desktop links get `class={page.url.pathname === "/about" ? "active" : ""}`. Inside `@media (hover: hover)`, `nav a::after` is an underline whose width animates from 0 to 100% on `.active` and on hover.
- The hamburger is an animated SVG with three `path.line` elements (`.top`, `.middle`, `.bottom`) that rotate into an X when `.active` is set.
- The logo is `<a href="/" aria-label="Home">` wrapping `/assets/svgs/logo.svg`.
- Generate the link list from `{{ROUTES}}`.

### `src/lib/components/Footer.svelte`

- `<footer>` → `div.footer-body` (a grid: `div.footer-heading` with logo and tagline, `div.footer-quick-links`, `div.footer-contact`, `div.footer-policy`) → `div.footer-bottom` (`div.footer-socials`, `<hr>`, `div.footer-copyright`).
- Each column has a `p.footer-subheading`. Contact rows are `<p><span class="material-icons">email</span><a href="mailto:…">…</a></p>`.
- External links use `target="_blank" rel="noopener noreferrer"`.

### `src/routes/+layout.svelte`

```svelte
<script lang="ts">
	import "material-icons/iconfont/filled.css";
	import Nav from "$lib/components/Nav.svelte";
	import Footer from "$lib/components/Footer.svelte";

	let { children } = $props();
</script>

<Nav />
{@render children()}
<Footer />
<!-- Global modals / CTAs shared by every page go here -->
```

### `src/routes/+page.svelte` and each route in `{{ROUTES}}`

Follow the page anatomy in Section 3.2. Each page has a `SeoHead` with a unique title (`Page | {{SITE_NAME}}`) and a description, a `section.hero`, and one or two placeholder content sections that demonstrate `.long-heading.heading-fade-in` + `SpanifyText`, `.scroll-fade-up` and `.group-stagger-fade`.

The `privacy` route is a plain text page. Its hero has no background image, so give that section `margin-top` for the fixed nav.

### `src/lib/data/faqs.ts` (pattern for content data)

```ts
export type FaqAnswer =
	{ element: "p"; content: string } | { element: "ul"; content: string[] } | { element: "a"; content: { href: string; text: string } };

export type Faq = { question: string; answer: FaqAnswer[] };

export const homeFaqs: Faq[] = [
	{
		question: "Placeholder question?",
		answer: [{ element: "p", content: "Placeholder answer." }]
	}
];
```

---

## 5. Done checklist

- [ ] `npm run check` passes with 0 errors.
- [ ] `npm run format` has been run.
- [ ] `npm run dev`: every route renders, the nav switches layout at 1024px, the mobile menu opens and closes (including on an outside click), and scroll animations trigger.
- [ ] `npm run build` succeeds with the Netlify adapter.
- [ ] No hard-coded colors, font sizes or spacing in components (tokens only).
- [ ] The user has been told which assets they still need to supply: fonts, favicon set, logo and OG image.
