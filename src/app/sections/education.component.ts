import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionComponent } from '../shared/section.component';
import { RevealDirective } from '../shared/reveal.directive';
import { IconComponent } from '../shared/icon.component';
import { EDUCATION, AWARDS } from '../core/profile';

/**
 * Education & recognition.
 *
 * Two restrained columns on `lg`, stacked below. `AWARDS` entries may carry an
 * empty `year`, so the year is guarded — no dangling separators.
 */
@Component({
  selector: 'app-education',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionComponent, RevealDirective, IconComponent],
  template: `
    <app-section
      sectionId="education"
      index="05"
      eyebrow="Background"
      heading="Education &amp; Recognition"
      [lead]="lead"
    >
      <div class="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
        <!-- Education -->
        <div appReveal class="min-w-0">
          <p class="u-eyebrow">Education</p>

          <ul class="mt-5 space-y-5">
            @for (entry of education; track entry.degree) {
              <li class="u-card min-w-0 p-5 md:p-6">
                <p class="font-mono text-[0.6875rem] tracking-[0.18em] text-ink-faint uppercase">
                  {{ entry.period }}
                </p>

                <h3 class="u-display mt-3 text-xl text-ink md:text-2xl">
                  {{ entry.degree }}
                </h3>

                <p class="mt-1.5 text-[0.9rem] text-ink-dim">{{ entry.school }}</p>

                <p class="mt-4 border-t border-line-soft pt-4 font-mono text-[0.75rem] text-accent">
                  {{ entry.note }}
                </p>
              </li>
            }
          </ul>
        </div>

        <!-- Awards -->
        <div appReveal [i]="1" class="min-w-0">
          <p class="u-eyebrow">Recognition</p>

          <ul class="mt-5 space-y-5">
            @for (award of awards; track award.title) {
              <li class="u-card min-w-0 p-5 md:p-6">
                <div class="flex min-w-0 items-start gap-3">
                  <app-icon name="award" cls="mt-1 h-4 w-4 shrink-0 text-gold" />

                  <div class="min-w-0">
                    <h3 class="text-[1.0625rem] leading-snug font-medium text-ink">
                      {{ award.title }}
                    </h3>

                    <p
                      class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1
                             font-mono text-[0.7rem] tracking-[0.12em] text-ink-faint uppercase"
                    >
                      <span>{{ award.org }}</span>
                      @if (award.year) {
                        <span class="h-1 w-1 shrink-0 rounded-full bg-gold opacity-60"></span>
                        <span class="text-gold">{{ award.year }}</span>
                      }
                    </p>

                    <p class="mt-3 text-[0.9rem] leading-relaxed text-ink-dim">
                      {{ award.note }}
                    </p>
                  </div>
                </div>
              </li>
            }
          </ul>
        </div>
      </div>
    </app-section>
  `,
})
export class EducationComponent {
  protected readonly lead =
    'Formal computer science background, and the recognition received for work delivered since.';

  protected readonly education: typeof EDUCATION = EDUCATION;
  protected readonly awards: typeof AWARDS = AWARDS;
}
