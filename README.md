<div align="center">

# Vivek Kumar — Portfolio

**Software Engineer · Java · Spring Boot · Microservices · Bengaluru**

My personal portfolio. A single-page site built with Angular 22 and Tailwind CSS v4,
prerendered to static HTML and served from GitHub Pages.

### [→ vivekkumarq.github.io/vivekKumarPortfolio](https://vivekkumarq.github.io/vivekKumarPortfolio/)

[![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Deploy](https://github.com/vivekkumarq/vivekKumarPortfolio/actions/workflows/deploy.yml/badge.svg)](https://github.com/vivekkumarq/vivekKumarPortfolio/actions/workflows/deploy.yml)

</div>

---

## Contents

- [Why it's built this way](#why-its-built-this-way)
- [Stack](#stack)
- [Features](#features)
- [Project structure](#project-structure)
- [Running locally](#running-locally)
- [How the pieces fit](#how-the-pieces-fit)
- [Deployment](#deployment)
- [**Making changes**](#making-changes) ← start here for updates
- [Troubleshooting](#troubleshooting)

---

## Why it's built this way

I'm a backend engineer, so I built the site the way I'd build a service: keep the data
separate from the delivery, make the output cacheable, and ship nothing the runtime
doesn't need.

**Content is data, not markup.** Everything the site says lives in one typed file,
`src/app/core/profile.ts`. Components read from it; none of them hold copy. Updating the
site is a data edit, not a template edit — which is why the update guide below is mostly
"open one file".

**Prerendered, not client-rendered.** The build uses Angular's static output mode, so
`dist/` is plain HTML with the content already in it. Search crawlers, LinkedIn's link
unfurler, and anyone on a slow connection get the full page without executing a line of
JavaScript.

**One token set drives both themes.** Colours are CSS custom properties, and components
only reference semantic names — `text-ink`, `bg-surface`, `border-line`. No component
knows a hex value, so light and dark can't drift apart.

**About 69 kB over the wire.** No component library, no icon package, no animation
library. Icons are inline SVG, the scroll reveal is one directive over
`IntersectionObserver`, and the webfonts are the only third-party request.

## Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Angular 22 | Standalone components, zoneless, signals |
| Language | TypeScript 6 | `strict`, `strictTemplates`, `noUnusedLocals` |
| Styling | Tailwind CSS v4 | CSS-first config via `@theme` |
| Rendering | Static prerender | `outputMode: "static"` — no Node server at runtime |
| Type | Fraunces · Inter · JetBrains Mono | Display / body / mono |
| CI/CD | GitHub Actions | Builds and deploys on every push to `main` |
| Hosting | GitHub Pages | Served from `/vivekKumarPortfolio/` |

## Features

- Single-page layout with scroll-spy navigation and a mobile menu sheet
- Light and dark themes, remembered in `localStorage` and applied before first paint, so
  there's no flash of the wrong theme
- Scroll-triggered reveals that fully disable under `prefers-reduced-motion`
- Résumé served as a direct PDF download
- SEO generated at build time from the content file and baked into the HTML: title,
  description, Open Graph, Twitter card, canonical URL, and schema.org `Person` JSON-LD
- Accessibility: semantic heading order, skip link, visible focus rings, `aria-expanded`
  on disclosures, 44 px minimum touch targets, and a `<noscript>` fallback so the page is
  readable with JavaScript disabled
- Responsive from 320 px up, with no horizontal scroll at any width

## Project structure

```
.
├── .github/workflows/deploy.yml    build + deploy to GitHub Pages
├── public/
│   ├── favicon.svg
│   └── resume/
│       └── Vivek_Kumar_Resume.pdf  ← the downloadable résumé
└── src/
    ├── index.html                  fonts, theme bootstrap, no-JS fallback
    ├── styles.css                  design tokens (light + dark), shared utilities
    └── app/
        ├── app.ts                  page composition — the section order
        ├── core/
        │   ├── profile.ts          ← ALL site content lives here
        │   └── seo.service.ts      builds <head> from profile.ts
        ├── shared/
        │   ├── section.component.ts    shell used by every section
        │   ├── reveal.directive.ts     scroll reveal (IntersectionObserver)
        │   ├── theme.service.ts        light/dark preference
        │   ├── icon.component.ts       inline SVG icon set
        │   └── rich-text.component.ts  renders **bold** without innerHTML
        └── sections/
            nav · hero · about · experience · projects
            skills · education · contact · footer
```

## Running locally

Requires **Node 20.19+, 22.12+, or 24+**.

```bash
npm install
```

```bash
npm start
```

Dev server with hot reload at <http://localhost:4200>.

```bash
npm run build
```

Static output in `dist/vivek-portfolio/browser/`, deployable to any static host as-is.

## How the pieces fit

`profile.ts` exports typed constants. `app.ts` lists the sections in page order. Each
section component imports the constant it needs and renders it inside the shared
`<app-section>` shell, which supplies the numbered eyebrow, heading and spacing so every
section shares one rhythm.

`SeoService` reads the same file and writes the `<head>` tags. Because the build
prerenders, those tags end up in the shipped HTML rather than being set at runtime.

Styling is Tailwind utilities in templates, with tokens defined once in `styles.css` under
`@theme`. There is no per-component CSS file.

## Deployment

Every push to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which installs, builds and publishes to GitHub Pages. Deploys take roughly 40 seconds.

Repository setup, done once: **Settings → Pages → Build and deployment → Source: GitHub Actions.**

### Base href

Because this is a project site rather than a user site, the app is served from a subpath
and the build needs to know it. The workflow reads a repository variable `BASE_HREF`
(**Settings → Secrets and variables → Actions → Variables**), defaulting to `/`:

| Hosting | Live URL | `BASE_HREF` |
| --- | --- | --- |
| Project site *(current)* | `vivekkumarq.github.io/vivekKumarPortfolio/` | `/vivekKumarPortfolio/` |
| User site | `vivekkumarq.github.io` | `/` |
| Custom domain | `yourdomain.com` | `/` |

> **This is why paths in the code have no leading slash.** `resumePath` is
> `resume/…`, not `/resume/…`. A root-absolute path would resolve against the domain root
> and 404 under a subpath. If you add any new asset link, keep it relative.

---

# Making changes

Almost everything is a one-file edit. Below are the common tasks, then the publish step
that applies to all of them.

## 1. Update the résumé PDF

The most frequent change. The file lives at `public/resume/Vivek_Kumar_Resume.pdf`.

**Keeping the same filename** — just overwrite it. Nothing else to change:

```bash
cp /path/to/new-resume.pdf public/resume/Vivek_Kumar_Resume.pdf
```

**Using a different filename** — add the file, then update the pointer in
`src/app/core/profile.ts`:

```ts
resumePath: "resume/Vivek_Kumar_Resume_2027.pdf",   // no leading slash
```

> Visitors who opened the site before may get the old PDF from their browser cache. Adding
> the year to the filename sidesteps that entirely, which is why the rename path is worth
> the extra step.

## 2. Add or edit a job

Open `src/app/core/profile.ts` and find the `EXPERIENCE` array. Add a new object at the
**top** — the page renders them in array order, newest first:

```ts
export const EXPERIENCE: Role[] = [
  {
    company: "New Company",
    companyUrl: "https://example.com",     // optional; omit and it renders as plain text
    title: "Senior Software Engineer",
    employment: "Full time",
    period: "Jan 2027 — Present",
    current: true,                          // shows the "Current" pill + pulsing dot
    location: "Bengaluru, India",
    summary: "One line on what the role is about.",
    bullets: [
      { text: "What you did, with **key terms in bold**.", metric: null },
    ],
    stack: ["Java", "Spring Boot", "Kafka"],
  },
  // ...existing roles below
];
```

Set `current: false` on the previous role when you move on.

The timeline renders any number of roles — no component changes needed.

## 3. Fill in an impact metric

Each bullet has an optional `metric` that renders as a highlighted stat chip beside it:

```ts
{
  text: "Implemented **Kafka-based event-driven communication** across services.",
  metric: { value: "2x", label: "system throughput" },
}
```

Leave it as `metric: null` and nothing renders — the bullet reads cleanly with no gap. So
metrics can be added one at a time as you confirm real figures.

> Only put numbers here you can defend in an interview. Several bullets currently sit at
> `null` for exactly that reason.

## 4. Add a project

Find the `PROJECTS` array in `src/app/core/profile.ts`:

```ts
{
  name: "Project Name",
  blurb: "One line — what it is.",
  detail: "A paragraph on the design and what problem it solves.",
  tags: ["Java", "Spring Boot", "Redis"],
  repo: "https://github.com/vivekkumarq/project-name",
  featured: true,     // true = large card up top, false = compact row below
},
```

Featured projects render as large cards, the rest as compact rows. Keep three or four
featured — more and the section stops having a focal point.

## 5. Update skills

Two arrays in `src/app/core/profile.ts`, both in the same file:

```ts
// The grouped cards
export const SKILLS: SkillGroup[] = [
  { group: "Languages", items: ["Java", "SQL", "Groovy"] },
];

// The scrolling ticker strip — keep this to the headline technologies
export const SKILL_TICKER: string[] = ["Java", "Spring Boot", "Kafka"];
```

Add a whole new group by appending another `{ group, items }` object. The grid reflows on
its own.

## 6. Update education, awards, or contact details

Same file. `EDUCATION`, `AWARDS`, and the `PROFILE` object at the top hold these.

For awards, `year` may be an empty string — the template guards it, so no stray
punctuation appears:

```ts
{ title: "Award Name", org: "Organisation", year: "2027", note: "What it was for." },
```

## 7. Change the wording of the intro or About section

`PROFILE.subtitle` and the `ABOUT.paragraphs` array. Paragraphs support `**bold**`:

```ts
export const ABOUT = {
  paragraphs: [
    "I'm a backend engineer who **cares about the boring parts**.",
  ],
  stats: [
    { value: "4+", label: "Years Experience" },
  ],
};
```

Keep `ABOUT.stats` to four entries — the grid is 2×2.

## 8. Change the colours or fonts

All in `src/styles.css`. The tokens are defined twice — once for dark under `:root`, once
for light under `[data-theme="light"]`. **Change both**, or one theme breaks:

```css
:root {
  --c-accent: #5ec8ad;     /* dark theme accent */
}
[data-theme="light"] {
  --c-accent: #16806a;     /* light theme accent — needs more contrast on white */
}
```

For the display typeface, three things move together:

```css
--font-display: "Fraunces", Georgia, serif;
--display-weight: 500;
--display-track: -0.025em;
```

…and the font itself must be loaded in `src/index.html`. A 400-weight serif and a
600-weight sans need different tracking, which is why weight and tracking are tokens
rather than hardcoded.

## 9. Add a brand-new section

This is the only change that touches more than one file:

1. Add the content array to `src/app/core/profile.ts`.
2. Create `src/app/sections/yoursection.component.ts`, copying an existing section as a
   starting point. Wrap the content in `<app-section>` and give it the next `index`
   number.
3. Import it in `src/app/app.ts` and place `<app-yoursection />` in the template where it
   should appear.
4. Add `{ href: '#yoursection', label: 'Your Section' }` to `NAV_LINKS` in `profile.ts` so
   it appears in the nav and scroll-spy picks it up.

## 10. Publishing your change

Same for every task above. Check it locally first:

```bash
npm start
```

Then build once to be sure it compiles — CI runs the same command, so a failure here is a
failure there:

```bash
npm run build
```

Then commit and push:

```bash
git add -A
```

```bash
git commit -m "Update résumé to the December 2027 version"
```

```bash
git push
```

That's it. GitHub Actions rebuilds and redeploys automatically — watch it under the
[Actions tab](https://github.com/vivekkumarq/vivekKumarPortfolio/actions), and the live
site updates in about 40 seconds.

> If the site looks unchanged afterwards, it's almost always your own browser cache.
> Hard-refresh with **Ctrl+Shift+R** (or **Cmd+Shift+R**).

## 11. Moving to a custom domain

When you buy a domain:

1. Create `public/CNAME` containing only the domain, no protocol and no slash:
   ```
   vivekkumar.dev
   ```
2. Point DNS at GitHub Pages — either four `A` records to GitHub's Pages IPs, or a
   `CNAME` record for `www` pointing at `vivekkumarq.github.io`.
3. In **Settings → Pages**, set the custom domain, then enable **Enforce HTTPS** once the
   certificate is issued.
4. Set the `BASE_HREF` repository variable to `/` — a custom domain serves from the root,
   so the subpath is no longer correct.
5. Update `siteUrl` in `src/app/core/profile.ts`:
   ```ts
   siteUrl: "https://vivekkumar.dev",
   ```
   Skipping this leaves the canonical URL and Open Graph tags pointing at the old address,
   and search engines keep crediting it.

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Site shows an old version | Browser cache on `index.html` | Hard-refresh (Ctrl+Shift+R) |
| Styles or scripts 404 after a move | `BASE_HREF` doesn't match the URL | Update the repo variable, re-run the workflow |
| Résumé link 404s | Path written with a leading slash | Use `resume/…`, not `/resume/…` |
| Build fails on unused import | `noUnusedLocals` is on | Remove the unused import |
| Build fails in CI but works locally | Local build was incremental | `rm -rf dist .angular && npm run build` |
| Page renders blank | JS blocked and `<noscript>` block removed | Restore it in `src/index.html` |

---

## Contact

- **Email** — [vkumar.vivek222@gmail.com](mailto:vkumar.vivek222@gmail.com)
- **LinkedIn** — [vivek-k-87036b104](https://www.linkedin.com/in/vivek-k-87036b104/)
- **GitHub** — [@vivekkumarq](https://github.com/vivekkumarq)

---

<div align="center">
<sub>© 2026 Vivek Kumar</sub>
</div>
