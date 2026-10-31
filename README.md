# Aaditya Adhikari portfolio

An Astro static site built from the `portfolio/` content package.

```sh
npm install
npm run dev
npm run build
npm test
npm run preview
```

The development server runs at `http://localhost:4321`. Production files are in `dist/`. A static host must serve `404.html` for missing URLs.

`portfolio/` remains the content authority. `scripts/sync-content.mjs` extracts only bounded public copy before development and builds. Home and project summaries read the same source files through Vite. Update those Markdown files to update the copy. The CT numerical-results section is withheld according to its publication notes.

The visual theme is a field notebook crossed with a terminal. It uses warm paper, ink, sindoor red, haldi yellow, Devanagari numerals, and hand-drawn SVG project diagrams in `src/components/Diagram.astro`, built from the icon set in `src/sketch.ts`. Coconat sets headings, Google Sans Flex sets body copy, JetBrains Mono sets diagrams and labels, and Gaengu sets short handwritten notes. Coconat, Google Sans Flex, and Gaengu are self-hosted. JetBrains Mono and Tiro Devanagari Hindi load from Google Fonts. Motion lives in `src/scripts/site.ts`. It covers a first-visit loader, Lenis smooth scroll, scroll reveals, a custom cursor, and hand-drawn underlines that draw in on the hero and the How I work section. All of it stops under reduced-motion settings.

No fabricated email, resume, personal biography, research chart, or app screenshot is included. Writing remains outside the main navigation until articles exist. The site is marked `noindex, nofollow` while the factual and publication checks in `portfolio/launch-checklist.md` remain open. Set the real domain and indexing metadata before a public launch.

Artwork is decorative. Project diagrams are conceptual and do not establish measured performance. The earlier hero image in `public/art/` is no longer used on the homepage.
