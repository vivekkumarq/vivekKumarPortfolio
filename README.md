<div align="center">

# Vivek Kumar — Portfolio

**Software Engineer · Java · Spring Boot · Microservices**

My personal site. A single-page portfolio built with Angular 22 and Tailwind CSS v4,
prerendered to static HTML and served from GitHub Pages.

[**vivekkumarq.github.io**](https://vivekkumarq.github.io)

[![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Deploy](https://github.com/vivekkumarq/vivekkumarq.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/vivekkumarq/vivekkumarq.github.io/actions/workflows/deploy.yml)

</div>

---

## Why it's built this way

I'm a backend engineer, so I approached the site the way I'd approach a service: keep the
data separate from the delivery, make the output cacheable, and don't ship anything the
runtime doesn't need.

- **Content is data, not markup.** Everything the site says lives in one typed file,
  `src/app/core/profile.ts`. Components read from it; none of them hold copy. Updating
  the site is a data edit, not a template edit.
- **Prerendered, not client-rendered.** The build runs Angular's static output mode, so
  `dist/` is plain HTML with the content already in it. Crawlers, link unfurlers and
  anyone on a slow connection get the full page without executing a line of JavaScript.
- **One token set drives both themes.** Colours are CSS custom properties; components
  only ever reference the semantic names (`text-ink`, `bg-surface`, `border-line`). No
  component knows a hex value, so light and dark can't drift apart.
- **~69 kB over the wire.** No UI framework, no icon package, no animation library. The
  icons are inline SVG, the reveal animation is one directive over `IntersectionObserver`,
  and the fonts are the only third-party request.

## Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Angular 22 | Standalone components, zoneless, signals |
| Language | TypeScript 6 | `strict`, `strictTemplates`, `noUnusedLocals` |
| Styling | Tailwind CSS v4 | CSS-first config via `@theme` |
| Rendering | Static prerender | `outputMode: "static"` — no Node server at runtime |
| Type | Fraunces · Inter · JetBrains Mono | Display / body / mono |
| Hosting | GitHub Pages | Deployed by GitHub Actions on push to `main` |

## Features

- Single-page layout with scroll-spy navigation and a mobile sheet
- Light and dark themes, remembered in `localStorage`, applied before first paint so
  there's no flash of the wrong theme
- Scroll-triggered reveals that fully disable under `prefers-reduced-motion`
- Résumé available as a direct PDF download
- SEO handled at build time: title, description, Open Graph, Twitter card, canonical URL
  and schema.org `Person` JSON-LD, all generated from the content file and baked into the
  prerendered HTML
- Accessibility: semantic heading order, a skip link, visible focus rings, `aria-expanded`
  on disclosures, and 44 px minimum touch targets throughout
- Responsive from 320 px up, with no horizontal scroll at any width

## Project structure

```
src/
├── index.html                  fonts, theme bootstrap, no-JS fallback
├── styles.css                  design tokens (light + dark), shared utilities
└── app/
    ├── app.ts                  page composition
    ├── core/
    │   ├── profile.ts          ← all site content lives here
    │   └── seo.service.ts      builds <head> from profile.ts
    ├── shared/
    │   ├── section.component.ts    section shell used by every section
    │   ├── reveal.directive.ts     scroll reveal (IntersectionObserver)
    │   ├── theme.service.ts        light/dark preference
    │   ├── icon.component.ts       inline SVG icon set
    │   └── rich-text.component.ts  renders **bold** without innerHTML
    └── sections/
        nav · hero · about · experience · projects · skills · education · contact · footer
```

## Running locally

Requires Node 20.19+, 22.12+ or 24+.

```bash
npm install
```

```bash
npm start
```

Dev server with hot reload on <http://localhost:4200>.

```bash
npm run build
```

Static output in `dist/vivek-portfolio/browser/` — deployable to any static host as-is.

## Updating content

Everything is in `src/app/core/profile.ts`. Change it there and the whole site follows —
including the page metadata.

Experience bullets support an optional metric that renders as a highlighted stat chip:

```ts
{
  text: 'Implemented **Kafka-based event-driven communication** …',
  metric: null,                                          // renders nothing
  // metric: { value: '2x', label: 'system throughput' }, // renders a stat chip
}
```

Leaving it `null` renders the bullet cleanly with no gap, so metrics can be added one at a
time as they're confirmed.

To swap the résumé, replace `public/resume/Vivek_Kumar_Resume.pdf` and update
`PROFILE.resumePath` if the filename changes.

## Deployment

Every push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which builds the site and publishes it to GitHub Pages.

Repository setup, once: **Settings → Pages → Build and deployment → Source: GitHub Actions.**

The workflow reads an optional `BASE_HREF` repository variable, defaulting to `/`:

| Hosting | `BASE_HREF` |
| --- | --- |
| User site (`vivekkumarq.github.io`) | `/` — the default |
| Project site (e.g. `/portfolio`) | `/portfolio/` |
| Custom domain | `/` |

### Custom domain

1. Add `public/CNAME` containing only the domain — it's copied into the build output.
2. Point DNS at GitHub Pages (`A` records to GitHub's Pages IPs, or a `CNAME` to
   `vivekkumarq.github.io`).
3. Set the domain under **Settings → Pages**, then enable **Enforce HTTPS**.
4. Update `PROFILE.siteUrl` in `src/app/core/profile.ts` so the canonical URL, Open Graph
   tags and JSON-LD point at the new address.

## Contact

- **Email** — [vkumar.vivek222@gmail.com](mailto:vkumar.vivek222@gmail.com)
- **LinkedIn** — [vivek-k-87036b104](https://www.linkedin.com/in/vivek-k-87036b104/)
- **GitHub** — [@vivekkumarq](https://github.com/vivekkumarq)

---

<div align="center">
<sub>© 2026 Vivek Kumar</sub>
</div>
