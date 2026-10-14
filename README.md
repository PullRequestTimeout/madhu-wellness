# Madhu Wellness Collective

Marketing site for [madhucollective.ca](https://madhucollective.ca). Built with SvelteKit (Svelte 5 runes) and TypeScript, styled with plain CSS, deployed on Netlify.

## Development

```sh
npm install
npm run dev       # start the dev server
npm run check     # type-check
npm run format    # format with Prettier
npm run build     # production build (Netlify adapter)
```

## Project layout

- `src/routes/`: pages (home, about, classes-events, treatments-practitioners, privacy)
- `src/lib/components/`: shared components (Nav, Footer, SeoHead, PrimaryButton, SpanifyText)
- `src/lib/data/`: site content and nav links
- `static/global.css`: design tokens and critical styles; `static/global-noncritical.css` holds scroll animations
- `static/assets/`: fonts, images, logo and favicons

Colours, font sizes and spacing come from the CSS variables in `global.css`, not from values written into components. See `SVELTEKIT_STARTER.md` for the full conventions.

## Deployment

Netlify builds with `npm run build` and publishes `build/`. `_redirects` proxies the Plausible analytics script.
