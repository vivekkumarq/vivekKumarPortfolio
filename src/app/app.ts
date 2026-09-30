import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
} from '@angular/core';
import { SeoService } from './core/seo.service';

import { NavComponent } from './sections/nav.component';
import { HeroComponent } from './sections/hero.component';
import { AboutComponent } from './sections/about.component';
import { ExperienceComponent } from './sections/experience.component';
import { OpenSourceComponent } from './sections/open-source.component';
import { ProjectsComponent } from './sections/projects.component';
import { SkillsComponent } from './sections/skills.component';
import { EducationComponent } from './sections/education.component';
import { ContactComponent } from './sections/contact.component';
import { FooterComponent } from './sections/footer.component';
import { CommandPaletteComponent } from './shared/command-palette.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NavComponent,
    HeroComponent,
    AboutComponent,
    ExperienceComponent,
    OpenSourceComponent,
    ProjectsComponent,
    SkillsComponent,
    EducationComponent,
    ContactComponent,
    FooterComponent,
    CommandPaletteComponent,
  ],
  template: `
    <a
      href="#main"
      class="sr-only rounded-lg bg-accent px-4 py-2 text-sm font-medium text-canvas focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]"
    >
      Skip to content
    </a>

    <app-nav />

    <main id="main">
      <app-hero />
      <app-about />
      <app-experience />
      <app-open-source />
      <!-- Skills come before Projects so the skill pills filter a section
           the reader is about to reach, not one they already scrolled past. -->
      <app-skills />
      <app-projects />
      <app-education />
      <app-contact />
    </main>

    <app-footer />

    <app-command-palette />

    <!-- Ambient light that follows the pointer across the canvas. Sits
         behind everything; cards are opaque, so it only shows between them. -->
    <div class="u-spotlight" aria-hidden="true"></div>
  `,
})
export class App {
  constructor() {
    inject(SeoService).apply();

    const destroyRef = inject(DestroyRef);
    afterNextRender(() => trackPointer(destroyRef));
  }
}

/**
 * Feeds the pointer position to the page spotlight (--mx/--my) and to the
 * card under it (--cx/--cy, card-relative) for the border glow in
 * styles.css. One listener, one write per animation frame, and each
 * property set on the element that uses it, so a move never restyles the
 * whole document. Skipped for touch and reduced-motion visitors.
 */
function trackPointer(destroyRef: DestroyRef): void {
  if (
    !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  const glow = document.querySelector<HTMLElement>('.u-spotlight');
  let frame = 0;
  let x = 0;
  let y = 0;
  let target: Element | null = null;

  const paint = () => {
    frame = 0;
    glow?.style.setProperty('--mx', `${x}px`);
    glow?.style.setProperty('--my', `${y}px`);
    const card = target?.closest<HTMLElement>('.u-card');
    if (card) {
      const box = card.getBoundingClientRect();
      card.style.setProperty('--cx', `${x - box.left}px`);
      card.style.setProperty('--cy', `${y - box.top}px`);
    }
  };

  const onMove = (event: PointerEvent) => {
    x = event.clientX;
    y = event.clientY;
    target = event.target as Element;
    frame ||= requestAnimationFrame(paint);
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  destroyRef.onDestroy(() => {
    window.removeEventListener('pointermove', onMove);
    cancelAnimationFrame(frame);
  });
}
