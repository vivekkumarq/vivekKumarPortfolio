import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionComponent } from '../shared/section.component';
import { RevealDirective } from '../shared/reveal.directive';
import { IconComponent } from '../shared/icon.component';
import { EDUCATION, AWARDS, CERTIFICATIONS } from '../core/profile';

/**
 * Education, recognition, and verifiable credentials.
 *
 * Two restrained columns on `lg`, stacked below, with the certification grid
 * full-width beneath them. `AWARDS` entries may carry an empty `year`, so the
 * year is guarded — no dangling separators.
 */
@Component({
  selector: 'app-education',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionComponent, RevealDirective, IconComponent],
  template: `
    <app-section
      sectionId="education"
      index="06"
      eyebrow="Background"
      heading="Education, Recognition &amp; Credentials"
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

      <!-- Certifications. Each card is a link to its public credential, so
           the claim is checkable rather than asserted. -->
      <div appReveal class="mt-12 border-t border-line-soft pt-10">
        <p class="u-eyebrow">Certifications</p>

        <ul class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          @for (cert of certifications; track cert.url) {
            <li appReveal [i]="$index">
              <a
                [href]="cert.url"
                target="_blank"
                rel="noopener noreferrer"
                class="group u-card u-lift flex h-full min-w-0 items-start gap-3 p-4 hover:border-accent"
              >
                <span
                  class="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-accent/40 text-accent"
                >
                  <app-icon name="check" cls="h-3.5 w-3.5" />
                </span>

                <span class="min-w-0 flex-1">
                  <span
                    class="block text-[0.9375rem] leading-snug font-medium text-ink transition-colors group-hover:text-accent"
                  >
                    {{ cert.title }}
                  </span>
                  <span
                    class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.65rem] tracking-[0.12em] text-ink-faint uppercase"
                  >
                    <span class="truncate">{{ cert.org }}</span>
                    <span class="h-1 w-1 shrink-0 rounded-full bg-accent opacity-50"></span>
                    <span>{{ cert.year }}</span>
                  </span>
                </span>

                <app-icon
                  name="arrow-up-right"
                  cls="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-faint transition-all group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </li>
          }
        </ul>
      </div>
    </app-section>
  `,
})
export class EducationComponent {
  protected readonly lead =
    'Formal computer science background, the recognition received for work delivered since, and credentials anyone can verify.';

  protected readonly education: typeof EDUCATION = EDUCATION;
  protected readonly awards: typeof AWARDS = AWARDS;
  protected readonly certifications: typeof CERTIFICATIONS = CERTIFICATIONS;
}
