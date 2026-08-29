import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PROFILE, PROJECTS, type Project } from '../core/profile';
import { SectionComponent } from '../shared/section.component';
import { RevealDirective } from '../shared/reveal.directive';
import { IconComponent } from '../shared/icon.component';

/**
 * Projects showcase. Everything renders from `PROJECTS` in core/profile —
 * featured entries get full cards, the rest collapse into slim rows.
 *
 * Each card is a single <a> wrapping its content, so nothing inside may be
 * another anchor: the "View source" affordance is a <span>.
 */
@Component({
  selector: 'app-projects',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionComponent, RevealDirective, IconComponent],
  template: `
    <app-section
      sectionId="projects"
      index="03"
      eyebrow="Things I've built"
      heading="Projects"
      [lead]="lead"
    >
      <!-- Featured -->
      <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
        @for (p of featured; track p.name; let i = $index) {
          <a
            appReveal
            [i]="i"
            [href]="p.repo"
            target="_blank"
            rel="noopener noreferrer"
            [attr.aria-label]="'View the ' + p.name + ' source on GitHub'"
            class="group u-card flex flex-col p-6 hover:-translate-y-0.5 hover:border-accent/60 md:p-7"
          >
            <div class="flex items-center gap-3">
              <span class="font-mono text-[0.6875rem] tracking-[0.18em] text-ink-faint">
                {{ pad(i) }}
              </span>
              <span class="h-px w-5 bg-line"></span>
            </div>

            <h3 class="u-display mt-4 text-2xl text-ink">{{ p.name }}</h3>

            <p class="mt-2 text-[0.95rem] leading-relaxed text-ink">{{ p.blurb }}</p>

            <p class="mt-3 text-[0.85rem] leading-relaxed text-ink-dim">{{ p.detail }}</p>

            <ul class="mt-5 flex flex-wrap gap-1.5">
              @for (t of p.tags; track t) {
                <li
                  class="rounded-full border border-line-soft bg-raised px-2.5 py-1 font-mono text-[0.625rem] tracking-[0.12em] text-ink-faint uppercase"
                >
                  {{ t }}
                </li>
              }
            </ul>

            <span
              class="mt-6 flex items-center gap-2 border-t border-line-soft pt-4 font-mono text-[0.6875rem] tracking-[0.14em] text-ink-dim uppercase transition-colors group-hover:text-accent"
            >
              <app-icon name="github" cls="h-3.5 w-3.5" />
              View source
              <app-icon
                name="arrow-up-right"
                cls="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
          </a>
        }
      </div>

      <!-- Secondary -->
      @if (others.length) {
        <div appReveal class="mt-14">
          <p class="font-mono text-[0.6875rem] tracking-[0.18em] text-ink-faint uppercase">
            Also built
          </p>

          <ul class="mt-4 border-t border-line-soft">
            @for (p of others; track p.name) {
              <li>
                <a
                  [href]="p.repo"
                  target="_blank"
                  rel="noopener noreferrer"
                  [attr.aria-label]="'View the ' + p.name + ' source on GitHub'"
                  class="group flex flex-col gap-2 border-b border-line-soft py-5 transition-colors hover:border-accent/50 sm:flex-row sm:items-baseline sm:gap-6"
                >
                  <div class="min-w-0 sm:flex-1">
                    <h3
                      class="flex items-center gap-2 text-[0.95rem] font-medium text-ink transition-colors group-hover:text-accent"
                    >
                      {{ p.name }}
                      <app-icon
                        name="arrow-up-right"
                        cls="h-3.5 w-3.5 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </h3>
                    <p class="mt-1 text-[0.85rem] leading-relaxed text-ink-dim">{{ p.blurb }}</p>
                  </div>

                  <ul class="flex flex-wrap gap-1.5 sm:max-w-[18rem] sm:justify-end">
                    @for (t of p.tags; track t) {
                      <li
                        class="rounded-full border border-line-soft px-2 py-0.5 font-mono text-[0.625rem] tracking-[0.12em] text-ink-faint uppercase"
                      >
                        {{ t }}
                      </li>
                    }
                  </ul>
                </a>
              </li>
            }
          </ul>
        </div>
      }

      <!-- Closing link -->
      <div appReveal class="mt-10">
        <a
          [href]="github"
          target="_blank"
          rel="noopener noreferrer"
          class="u-link-underline -mx-2 inline-flex min-h-11 items-center gap-2 px-2 text-[0.9rem] text-ink transition-colors hover:text-accent"
        >
          All repositories on GitHub
          <app-icon name="arrow-up-right" cls="h-4 w-4" />
        </a>
      </div>
    </app-section>
  `,
})
export class ProjectsComponent {
  protected readonly lead =
    'Side projects I build to keep working through backend architecture problems end to end — messaging, billing logic, API tooling.';

  protected readonly featured: Project[] = PROJECTS.filter((p) => p.featured);
  protected readonly others: Project[] = PROJECTS.filter((p) => !p.featured);
  protected readonly github = PROFILE.github;

  /** 0 → "01". Keeps the mono index aligned with the section eyebrow style. */
  protected pad(i: number): string {
    return String(i + 1).padStart(2, '0');
  }
}
