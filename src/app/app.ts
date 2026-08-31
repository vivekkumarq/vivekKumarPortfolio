import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
      <app-projects />
      <app-skills />
      <app-education />
      <app-contact />
    </main>

    <app-footer />
  `,
})
export class App {
  constructor() {
    inject(SeoService).apply();
  }
}
