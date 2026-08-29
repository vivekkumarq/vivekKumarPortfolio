# Vivek Kumar — Portfolio

Personal portfolio site. Angular 22 (standalone, zoneless, signals) + Tailwind CSS v4,
prerendered to static HTML and hosted on GitHub Pages.

**Live:** https://vivekkumarq.github.io

---

## Editing content

**Everything on the site comes from one file: [`src/app/core/profile.ts`](src/app/core/profile.ts).**
Change text there and it propagates — no component edits needed. That file drives the
copy, the projects list, the skills, the nav, and the `<head>` tags (title, description,
Open Graph, schema.org JSON-LD).

### The metric placeholders

The résumé these bullets came from has unfilled `[X]%` placeholders. Nothing on this site
invents a number. Instead, each experience bullet carries a `metric` field:

```ts
{
  text: 'Implemented **Kafka-based event-driven communication** …',
  metric: null,                                  // nothing renders
  // metric: { value: '2x', label: 'system throughput' },   // renders a stat chip
}
```

Fill in a figure you can defend in an interview and it renders automatically as a
highlighted stat chip next to the bullet. Leave it `null` and the bullet reads cleanly
with no gap. Recruiters respond to concrete numbers, so these are worth filling in — but
only with real ones.

### Swapping the résumé PDF

Replace `public/resume/Vivek_Kumar_Resume.pdf`. If you rename it, update
`PROFILE.resumePath` in the content file to match.

---

## Running it

```bash
npm install
```

```bash
npm start
```

Dev server on http://localhost:4200 with hot reload.

```bash
npm run build
```

Production build. Output lands in `dist/vivek-portfolio/browser/` as plain static files —
the page is prerendered at build time, so crawlers and link unfurlers see the full content
and metadata without running any JavaScript.

---

## Deploying

Pushing to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which builds and publishes to GitHub Pages.

**One-time setup:** in the repo, go to **Settings → Pages → Build and deployment** and set
**Source** to **GitHub Actions**.

### Base href

The build needs to know what path the site is served from. The workflow reads a repository
variable `BASE_HREF` and falls back to `/`:

| Hosting | Repo name | `BASE_HREF` |
| --- | --- | --- |
| User site | `vivekkumarq.github.io` | `/` (default — nothing to do) |
| Project site | anything else, e.g. `portfolio` | `/portfolio/` |
| Custom domain | either | `/` |

Set it under **Settings → Secrets and variables → Actions → Variables** if you need
something other than `/`.

### Moving to a custom domain later

1. Add a file `public/CNAME` containing just the domain, e.g. `vivekkumar.dev`.
   It gets copied into the build output automatically.
2. Point the domain's DNS at GitHub Pages (`A` records to GitHub's four Pages IPs, or a
   `CNAME` record to `vivekkumarq.github.io`).
3. Set the domain under **Settings → Pages → Custom domain** and enable **Enforce HTTPS**.
4. Update `PROFILE.siteUrl` in `src/app/core/profile.ts` so the canonical URL, Open Graph
   tags and JSON-LD point at the new domain. Ship it — otherwise search engines keep
   crediting the old address.

---

## Structure

```
src/
  index.html                    fonts, no-flash theme bootstrap
  styles.css                    design tokens (light + dark), shared utilities
  app/
    app.ts                      page composition
    core/
      profile.ts                ← all content lives here
      seo.service.ts            drives <head> from profile.ts
    shared/
      section.component.ts      the section shell every section uses
      reveal.directive.ts       scroll-triggered fade-in (IntersectionObserver)
      theme.service.ts          light/dark preference
      icon.component.ts         inline SVG icon set
      rich-text.component.ts    renders **bold** in content strings
    sections/
      nav / hero / about / experience / projects / skills / education / contact / footer
```

### Theming

Colours are CSS custom properties on `:root`, overridden under `[data-theme="light"]`, and
exposed to Tailwind through `@theme` in `styles.css`. Components only ever use the token
utilities (`text-ink`, `bg-surface`, `border-line`, `text-accent`, …), never raw hex — so
changing the palette is a one-file edit and both themes stay in sync.

The initial theme is applied by a small inline script in `index.html` before first paint,
so there is no flash of the wrong theme on load.

### Accessibility & motion

Semantic headings, a skip link, visible focus rings, `aria-expanded` on the disclosure
controls, and `aria-hidden` on decorative icons. Every animation is disabled under
`prefers-reduced-motion: reduce`.
