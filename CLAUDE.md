# CLAUDE.md

Marketing site for Madhu Wellness Collective (madhucollective.ca). It uses SvelteKit with Svelte 5 runes, TypeScript and plain CSS, and deploys to Netlify. There's no CSS framework or animation library; don't add one unless asked.

## Commands

```sh
npm run dev      # dev server on http://localhost:5173
npm run check    # svelte-check type check (run after changes; should report 0 errors)
npm run format   # Prettier: tabs, double quotes, no trailing commas, print width 150
npm run build    # production build via adapter-netlify
```

There are no tests. Check visual and animation work in a browser. The Playwright MCP server is configured in `.mcp.json` for that.

After making UI changes (any `.svelte`, `.css` or `.html` file), run the `ui-ux-reviewer` subagent on the uncommitted changes without waiting to be asked. Fix what it finds, or tell the user about any findings you've left unfixed.

## Where things live

- `SVELTEKIT_STARTER.md` is the full conventions spec this project was built from. It covers naming, page anatomy, CSS rules and tokens. Follow it.
- The SvelteKit config, including the Netlify adapter and forced runes mode, is in `vite.config.ts`. There is no `svelte.config.js`.
- `src/lib/styles/global.css` holds the global CSS: fonts (Strong Heart Script for headings, General Sans for body), the reset, design tokens, utilities, hero styles, and the entrance and scroll animations. `+layout.svelte` imports it.
- All CSS is inlined: `inlineStyleThreshold: Infinity` puts global.css and every component's styles in a `<style>` in the SSR `<head>`. Don't link stylesheets from `app.html` or `static/`, and don't write `%sveltekit.head%` inside an `app.html` comment, because it gets replaced there too.
- Hero photos are listed per route in `src/lib/data/heroImages.ts`. On client-side navigation the layout's `onNavigate` waits (up to 1s) for `preloadImage()` to decode the next page's hero, so it never pops in. The layout starts that download early, when a link is hovered, touched or focused. A new page with a hero must add its photo there, and the hero `<img>` needs `fetchpriority="high"` plus a `<link rel="preload" as="image">` in `<svelte:head>` (`PageHero` does both).
- `src/lib/utils/` holds the Svelte actions and the shared runes state.
- `design/figma/` is a local-only (gitignored) offline copy of the Figma design. Its `README.md` indexes what's there. Read it before calling the Figma MCP, because the Starter plan has a low call limit. Save any new Figma responses there too.
- The SVAR MCP server (`svar-mcp` in `.mcp.json`) is the source of truth for `@svar-ui/svelte-calendar` APIs. Query it before writing or changing calendar code.

## Photos

- Site photos are the client's own, saved as WebP in `static/assets/images/` and named for their role: `hero-<page>`, `card-*`, `space-*`, `treatment-*`, `event-*`. A replacement takes the old file's name, so paths don't change. `todo.md` lists the slots still on stock images.
- Convert new photos to WebP at about quality 75. Use at most 2048px wide for heroes and full-width cards, 800px for the homepage cards and 1000–1400px for gallery tiles and treatment or event images. Aim for under about 350KB. Detailed foliage compresses badly, so narrow it rather than dropping the quality further.
  - No image tool is installed. Install `sharp` in a scratch folder rather than adding it to the project.
- Keep the full-size originals in `design/photos/` (gitignored). Never ship them from `static/`.
- Crops are tuned per photo, so recheck them at 390px and 1440px whenever a photo changes. Phones crop heroes from the sides, and wide screens crop them top and bottom.
  - Anchor with `object-position`: `PageHero`'s `focus` prop, the homepage's `img.hero-image` rule, or a homepage offering's `focus` field.
- White text over a photo must meet 4.5:1, or 3:1 for large text, at both widths. `--color-overlay-hero` is only a flat 35% tint. Measure the pixels behind the text rather than judging by eye.
- Hero, card, treatment and event photos are decorative (`alt=""`). The About page's Space gallery photos get descriptive alt text.

## Conventions worth knowing up front

- Icons come from `phosphor-svelte`. Import each one from its own path, for example `import XIcon from "phosphor-svelte/lib/XIcon"`. Icons are `1em` in `currentColor`, so size and colour them with `font-size` and `color` on a wrapper. Decorative icons need `aria-hidden="true"`, because Phosphor renders `role="img"`.

- Selectors are qualified with the element type and use kebab-case classes with a section prefix, for example `section.offerings`, `div.offering-cards`, `a.offering-card`. Don't use BEM.
- Use tokens, never hard-coded values. Colours come from `--color-*`, which is the brown/peach/tan/cream palette with `--color-text` as dark brown. Spacing comes from `--spacing-xs…xl`, and sizes from `--font-body-*` and `--font-heading-*`. Responsive changes redefine tokens in `global.css` media queries.
- Breakpoints are mobile-first `min-width` queries at 768, 1024 (desktop nav), 1280, 1440 and 1600px. An off-scale breakpoint (such as the offering cards' 640px) is fine when the content needs it, with a comment saying why.
- Global CSS gives every `<section>` and the `<footer>` `padding-inline: var(--padding-inline)` and `padding-block: var(--padding-block)`. A full-bleed section must explicitly set `padding: 0`.

## Spacing

- To change section padding at a breakpoint, redefine `--padding-block` or `--padding-inline` in `global.css`. Don't hard-code `padding-block` on individual sections, even where existing code once did. `--padding-block` is `--spacing-l` on mobile, `--spacing-xl` from 768px and 6rem (the design's 96px) from 1280px.
- Mobile gaps step down one size from desktop:
  - Use `--spacing-m` between closely related items: a heading and its paragraph, the cards in a group, and stacked buttons.
  - Use `--spacing-l` between groups, such as an intro and the cards below it, or text and the buttons under it.
  - Keep the larger desktop gaps from 768px.
- When one flex or grid container needs two different gaps, give the container the smaller gap. Top up the one exception with `margin-top: calc(larger - smaller)` and a comment. The hero buttons do this.
- Content that animates or scales toward the screen edge on mobile still finishes `--spacing-m` (1rem) from the edge.
- Logos are single SVG files sized with CSS. The nav and footer logos are 120px wide, and the footer logo grows to 210px from 1024px. Don't add size variants of an SVG.
- Use `var(--vh)` for viewport heights. `app.html` sets it to 1% of `innerHeight`. Example: `calc(var(--vh, 1vh) * 50)`.
- Wrap hover effects in `@media (hover: hover)`. Give every motion effect a `prefers-reduced-motion` fallback.

## Animation system

- **Triggered on entry:** add `use:isIntersecting`, which adds `.show` and pairs with `.heading-fade-in` (wrap the text in `<SpanifyText>`), `.scroll-fade-up` or `.group-stagger-fade`.
- **Scrubbed by scroll:** the actions set a CSS custom property from 0 to 1, and CSS derives everything from it with `calc()` and `clamp()`. Neither uses JS animation loops.
  - `scrollProgress` sets `--progress` on a tall track whose first child is a `position: sticky` stage. It's used for the pinned offerings-to-testimonial spread on the homepage.
  - `enterProgress` sets `--enter` as an element scrolls into view, from its top at the viewport bottom until `end` (default 20%) of it is visible. It's used for the homepage video frame.
- Scrubbed motion uses the individual `translate` property, not `transform`. That way it doesn't fight the transitioned `transform` used by `group-stagger-fade` on the same elements.
- Because `calc()` can't branch, easing curves are built piecewise from `clamp()` segments. See the `--ease` definition in `src/routes/+page.svelte`.

## Shared UI feedback

- **Toasts:** `toast.success / error / info(message)` from `$lib/utils/toast.svelte`, rendered by `<Toaster />` in the root layout. Use them for the result of async actions such as login, logout and saves. Don't raise one while a modal is open; show the error inline instead, or toast after the modal closes.
- **Confirmations:** `if (await confirmDialog({ title, message?, confirmText?, cancelText?, danger? }))` from `$lib/utils/confirm.svelte`. It's rendered by `<ConfirmDialog />` in the layout. Never use `window.confirm()`. Use `danger: true` for destructive actions.
- **Modals:** use the native `<dialog>` with the `modal` action from `$lib/utils/modal.ts`. ContactPanel, AdminLoginPanel and ConfirmDialog all do. Anything modal-like that isn't a `<dialog>`, such as SVAR's editor, calls `lockScroll()` directly. It's reference-counted, so stacked modals don't fight.
- No ancestor of a `position: fixed` overlay may keep a `transform`, because it traps the overlay. That's why the calendar's `.scroll-fade-up.show` ends on `transform: none`.

## Admin auth (Firebase)

- Firebase email/password auth is for admins only. Sign-up is disabled in the console, and admins are an allowlist of UIDs.
  - The allowlist lives in `PUBLIC_ADMIN_UIDS` in `.env` and Netlify, and in `isAdmin()` in `firestore.rules`. Keep the two in sync.
  - Deploy rules with `firebase deploy --only firestore:rules`. The project is `madhu-wellness-collective`.
- Stay on the `firebase` 12.x SDK. 13.x needs Node 24, and this machine has Node 22.
- `src/lib/firebase/` holds the config, lazy `loadAuth()` / `loadDb()` dynamic imports and `adminWrite()`. `src/lib/auth/` holds `authStore` (`ready`, `isAdmin`), the actions and `LogoutButton`.
- Firebase is never loaded for ordinary visitors. A localStorage hint (`madhu-admin-session`) tells the layout to restore a returning admin's session.
- Admins log in through the footer's "Admin" link (it becomes "Log out" when signed in), or through `?admin` on any URL. The Firestore rules are the real protection; hiding the UI is cosmetic.

## Calendar (SVAR)

- `@svar-ui/svelte-calendar` (MIT) shows a month view on `/classes-events`. Events live in the Firestore `events` collection (`src/lib/calendar/events.ts`). Anyone can read them; only admins can write, and the rules validate the event's shape.
- `EventCalendar.svelte` renders an SSR placeholder, then lazy-imports `CalendarView.svelte`, which holds all the SVAR wiring. Admins get an "Edit mode" switch above it, and the calendar is read-only until it's on.
- Query `svar-mcp` before changing calendar code. Only its `Search` tool with `mode: "sparse"` works; Inference and dense search return a 429 on SVAR's side. The package source in `node_modules/@svar-ui/` is the fallback.
- SVAR quirks the code works around (don't undo these without checking):
  - **Snapshot resets.** A new `events` array re-inits the store and snaps back to the `date` prop. Set `date` from `api.getState().currentDate` before replacing events.
  - **Editor autosave.** `autoSave` writes on every keystroke, so the Editor runs with `autoSave={false}` and a custom bottom bar (Delete, Duplicate, Cancel, Save). Closing it mid-save throws, so the close is deferred.
  - **Month-view creation.** Month view has no click-to-create; `onGridClick` adds an all-day event. Clicking a day number tries to open Day view, so the `navigate-to` intercept blocks it.
  - **All-day end dates.** An all-day event's `end` is the exclusive next midnight. `EventDatesField` shows and edits the inclusive "Last day". Do date arithmetic in calendar days, not milliseconds, because of DST.
  - **Theme and icons.** Willow's `fonts={false}` also drops the `wxi` icon font, and the upstream prev/next buttons have no labels. The toolbar therefore uses custom `CalendarNavButtons` and `CalendarAddButton`.
  - **Category field.** It's a native `<select>` (`CategorySelect`), because SVAR's RichSelect is unlabelled.
  - **Payload typing.** Action payloads are typed as unions, so use the typed `intercept` / `on` helpers in CalendarView.
  - **Theme variables.** They go on `:global(:root .wx-willow-theme)`. Popup and modal z-index is 1050, above the nav's 1000.
- The studio is Canadian. Editor date pickers use day/month/year (`%d/%m/%Y`), and the display text in `format.ts` uses the `en-CA` locale. Weeks start on Sunday.
- The event popup isn't keyboard-reachable, so the accessible list of the month's events below the grid must stay.

## Git

- Work happens on feature branches (currently `calendar`), and `master` is the main branch.
- This is a Windows checkout with `core.autocrlf` on, and `npm run format` rewrites every file's line endings. Run `npx prettier --write` on only the files you changed.
- Start every commit subject with a gitmoji emoji, for example `💫` for animation, `♻️` for refactors and `🔧` for config.
