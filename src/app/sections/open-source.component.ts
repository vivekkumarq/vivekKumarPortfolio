import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  OPEN_SOURCE,
  type Contribution,
  type ContributionStatus,
  type OpenSourceProject,
} from '../core/profile';
import { SectionComponent } from '../shared/section.component';
import { RevealDirective } from '../shared/reveal.directive';
import { IconComponent } from '../shared/icon.component';

/**
 * Upstream contributions, rendered from `OPEN_SOURCE` in core/profile.
 *
 * One card per project, each listing its contributions. The status pill is
 * driven by the data — an approved-but-unmerged PR must not read as merged,
 * so the label comes from `statusLabel` rather than being hardcoded here.
 *
 * The card is a <div>, not an <a>: the repo link and each contribution link
 * are separate anchors, and anchors cannot nest.
 */
@Component({
  selector: 'app-open-source',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionComponent, RevealDirective, IconComponent],
  template: `
    <app-section
      sectionId="open-source"
      index="03"
      eyebrow="Upstream work"
      heading="Open Source"
      [lead]="lead"
    >
      <div class="flex flex-col gap-5">
        @for (p of projects; track p.project; let i = $index) {
          <div appReveal [i]="i" class="u-card p-6 md:p-7">
            <!-- Project header -->
            <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
              <a
                [href]="p.repoUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="group inline-flex items-baseline gap-2"
                [attr.aria-label]="'Open ' + p.owner + '/' + p.project + ' on GitHub'"
              >
                <span class="font-mono text-[0.75rem] text-ink-faint">{{ p.owner }}/</span>
                <h3 class="u-display text-xl text-ink transition-colors group-hover:text-accent">
                  {{ p.project }}
                </h3>
                <app-icon
                  name="arrow-up-right"
                  cls="h-3.5 w-3.5 shrink-0 self-center text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>

              <span
                class="inline-flex items-center gap-1.5 font-mono text-[0.6875rem] tracking-[0.12em] text-ink-faint"
              >
                <span class="h-1 w-1 rounded-full bg-gold opacity-70"></span>
                {{ p.stars }} stars
              </span>
            </div>

            <p class="mt-2 text-[0.9rem] leading-relaxed text-ink-dim">{{ p.description }}</p>

            <ul class="mt-4 flex flex-wrap gap-1.5">
              @for (t of p.tags; track t) {
                <li
                  class="rounded-full border border-line-soft bg-raised px-2.5 py-1 font-mono text-[0.625rem] tracking-[0.12em] text-ink-faint uppercase"
                >
                  {{ t }}
                </li>
              }
            </ul>

            <!-- Contributions -->
            <ul class="mt-6 border-t border-line-soft">
              @for (c of p.contributions; track c.url) {
                <li>
                  <a
                    [href]="c.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="group block border-b border-line-soft py-4 transition-colors hover:border-accent/50"
                  >
                    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span
                        class="rounded border border-line-soft bg-raised px-2 py-0.5 font-mono text-[0.6875rem] text-ink-dim"
                      >
                        {{ ref(c) }}
                      </span>

                      <span
                        class="inline-flex items-center gap-1.5 font-mono text-[0.625rem] tracking-[0.14em] uppercase"
                        [class]="statusClass(c.status)"
                      >
                        <span
                          class="h-1.5 w-1.5 rounded-full"
                          [class]="statusDotClass(c.status)"
                        ></span>
                        {{ statusLabel(c.status) }}
                      </span>

                      @if (c.diff) {
                        <span class="font-mono text-[0.6875rem] text-ink-faint">{{ c.diff }}</span>
                      }
                    </div>

                    <p
                      class="mt-2 text-[0.95rem] leading-snug font-medium text-ink transition-colors group-hover:text-accent"
                    >
                      {{ c.title }}
                    </p>

                    <p class="mt-2 max-w-3xl text-[0.85rem] leading-relaxed text-ink-dim">
                      {{ c.detail }}
                    </p>

                    @if (c.meta) {
                      <p
                        class="mt-2 font-mono text-[0.6875rem] tracking-[0.06em] text-ink-faint"
                      >
                        {{ c.meta }}
                      </p>
                    }
                  </a>
                </li>
              }
            </ul>
          </div>
        }
      </div>

      <div appReveal class="mt-10">
        <a
          [href]="prSearch"
          target="_blank"
          rel="noopener noreferrer"
          class="u-link-underline -mx-2 inline-flex min-h-11 items-center gap-2 px-2 text-[0.9rem] text-ink transition-colors hover:text-accent"
        >
          Every pull request on GitHub
          <app-icon name="arrow-up-right" cls="h-4 w-4" />
        </a>
      </div>
    </app-section>
  `,
})
export class OpenSourceComponent {
  protected readonly lead =
    'Fixes I have sent upstream to projects I use, and the review process that came with them.';

  protected readonly projects: OpenSourceProject[] = OPEN_SOURCE;

  protected readonly prSearch =
    'https://github.com/pulls?q=is%3Apr+author%3Avivekkumarq+-user%3Avivekkumarq';

  /** "PR #24810" / "Issue #56091". */
  protected ref(c: Contribution): string {
    return `${c.kind === 'pr' ? 'PR' : 'Issue'} #${c.number}`;
  }

  protected statusLabel(s: ContributionStatus): string {
    switch (s) {
      case 'merged':
        return 'Merged';
      case 'approved':
        return 'Approved · pending merge';
      case 'resolved':
        return 'Resolved';
    }
  }

  protected statusClass(s: ContributionStatus): string {
    return s === 'merged' ? 'text-accent' : s === 'approved' ? 'text-gold' : 'text-ink-faint';
  }

  protected statusDotClass(s: ContributionStatus): string {
    return s === 'merged' ? 'bg-accent' : s === 'approved' ? 'bg-gold' : 'bg-ink-faint';
  }
}
