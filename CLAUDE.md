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
- `static/global.css` holds the critical CSS: fonts (Strong Heart Script for headings, General Sans for body), the reset, design tokens, utilities, hero styles and above-the-fold animations.
- `static/global-noncritical.css` holds the scroll animations and is linked at the end of `<body>`.
- `src/lib/utils/` holds the Svelte actions and the shared runes state.
- `design/figma/` is a local-only (gitignored) offline copy of the Figma design. Its `README.md` indexes what's there. Read it before calling the Figma MCP, because the Starter plan has a low call limit. Save any new Figma responses there too.
- The SVAR MCP server (`svar-mcp` in `.mcp.json`) is the source of truth for `@svar-ui/svelte-calendar` APIs. Query it before writing or changing calendar code.

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

## Git

- Work happens on feature branches (currently `figma-restyle`), and `master` is the main branch.
- Start every commit subject with a gitmoji emoji, for example `💫` for animation, `♻️` for refactors and `🔧` for config.
