import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionComponent } from '../shared/section.component';
import { RevealDirective } from '../shared/reveal.directive';
import { IconComponent } from '../shared/icon.component';
import { EDUCATION, AWARDS, CERTIFICATIONS } from '../core/profile';

/** Tone per issuing organisation, so a credential's colour means something. */
const ORG_TONES: Record<string, string> = {
  Confluent: 'var(--t-blue)',
  'Apollo GraphQL': 'var(--t-violet)',
  HackerRank: 'var(--t-green)',
};

/**
 * Education, recognition, and verifiable credentials.
 *
 * Degree and awards share a row of cards; certifications follow as a grid
 * of links to each public credential, so the claim is checkable rather than
 * asserted. `AWARDS` entries may carry an empty `year`, which is guarded.
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
      <div class="grid gap-4 lg:grid-cols-3">
        @for (entry of education; track entry.degree) {
          <div
            appReveal
            class="u-card overflow-hidden p-6"
            style="background-image: radial-gradient(420px 200px at 100% 0, color-mix(in srgb, var(--t-teal) 12%, transparent), transparent 70%)"
          >
            <div class="flex items-start justify-between gap-3">
              <span class="u-chip-ico h-12 w-12 rounded-2xl" style="--tone: var(--t-teal)">
                <app-icon name="graduation" cls="h-5 w-5" />
              </span>
              <span class="rounded-full bg-raised px-3 py-1 text-[0.72rem] font-medium text-ink-dim">
                {{ entry.period }}
              </span>
            </div>
            <h3 class="mt-5 text-[1.25rem] leading-snug font-bold tracking-tight text-ink">
              {{ entry.degree }}
            </h3>
            <p class="mt-1 text-[0.9rem] text-ink-dim">{{ entry.school }}</p>
            <p
              class="mt-4 inline-flex rounded-xl bg-teal/10 px-3 py-1.5 text-[0.8rem] font-semibold text-teal"
            >
              {{ entry.note }}
            </p>
          </div>
        }

        @for (award of awards; track award.title; let i = $index) {
          <div appReveal [i]="i + 1" class="u-card u-lift p-6">
            <div class="flex items-start justify-between gap-3">
              <span class="u-chip-ico h-12 w-12 rounded-2xl" style="--tone: var(--t-amber)">
                <app-icon name="award" cls="h-5 w-5" />
              </span>
              @if (award.year) {
                <span class="u-num rounded-full bg-amber/12 px-3 py-1 text-[0.78rem] text-amber">
                  {{ award.year }}
                </span>
              }
            </div>
            <h3 class="mt-5 text-[1.15rem] leading-snug font-bold tracking-tight text-ink">
              {{ award.title }}
            </h3>
            <p class="mt-1 text-[0.8rem] font-medium text-ink-faint">{{ award.org }}</p>
            <p class="mt-3 text-[0.9rem] leading-relaxed text-ink-dim">{{ award.note }}</p>
          </div>
        }
      </div>

      <!-- Certifications -->
      <div appReveal class="mt-8 flex flex-wrap items-baseline justify-between gap-2">
        <h3 class="text-[1.05rem] font-bold tracking-tight text-ink">Certifications</h3>
        <p class="text-[0.78rem] text-ink-faint">Each one links to its public credential</p>
      </div>
      <ul class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        @for (cert of certifications; track cert.url) {
          <li appReveal [i]="$index % 3">
            <a
              [href]="cert.url"
              target="_blank"
              rel="noopener noreferrer"
              class="group u-card u-lift flex h-full min-w-0 items-center gap-3.5 p-4"
            >
              <span class="u-chip-ico" [style.--tone]="tone(cert.org)">
                <app-icon name="check" cls="h-[1.1rem] w-[1.1rem]" />
              </span>
              <span class="min-w-0 flex-1">
                <span
                  class="block text-[0.925rem] leading-snug font-semibold text-ink transition-colors group-hover:text-accent"
                >
                  {{ cert.title }}
                </span>
                <span class="mt-0.5 block truncate text-[0.75rem] text-ink-faint">
                  {{ cert.org }} · {{ cert.year }}
                </span>
              </span>
              <app-icon
                name="arrow-up-right"
                cls="h-4 w-4 shrink-0 text-ink-faint transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
              />
            </a>
          </li>
        }
      </ul>
    </app-section>
  `,
})
export class EducationComponent {
  protected readonly lead =
    'Formal computer science background, the recognition received for work delivered since, and credentials anyone can verify.';

  protected readonly education: typeof EDUCATION = EDUCATION;
  protected readonly awards: typeof AWARDS = AWARDS;
  protected readonly certifications: typeof CERTIFICATIONS = CERTIFICATIONS;

  protected tone(org: string): string {
    const key = Object.keys(ORG_TONES).find((k) => org.startsWith(k));
    return key ? ORG_TONES[key] : 'var(--t-blue)';
  }
}
