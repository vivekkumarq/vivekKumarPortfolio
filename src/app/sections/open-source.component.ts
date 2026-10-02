import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  OPEN_SOURCE,
  type Contribution,
  type ContributionStatus,
  type OpenSourceProject,
} from '../core/profile';
import { SectionComponent } from '../shared/section.component';
import { RevealDirective } from '../shared/reveal.directive';
import { IconComponent, type IconName } from '../shared/icon.component';
import { CountUpDirective } from '../shared/count-up.directive';

/** "26.7k" → 26700. Stars are rounded snapshots in the content file. */
const parseStars = (s: string): number => {
  const n = parseFloat(s);
  return /k$/i.test(s.trim()) ? n * 1000 : n;
};

/**
 * Upstream contributions, rendered from `OPEN_SOURCE` in core/profile.
 *
 * Summary tiles on top are computed from the same data. The status pill is
 * driven by the data — an approved-but-unmerged PR must not read as merged,
 * so the label comes from `statusLabel` rather than being hardcoded here.
 */
@Component({
  selector: 'app-open-source',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionComponent, RevealDirective, IconComponent, CountUpDirective],
  template: `
    <app-section
      sectionId="open-source"
      index="03"
      eyebrow="Upstream work"
      heading="Open Source"
      [lead]="lead"
    >
      <a
        sectionActions
        [href]="prSearch"
        target="_blank"
        rel="noopener noreferrer"
        class="u-btn u-btn-soft"
      >
        <app-icon name="github" cls="h-4 w-4" />
        Every pull request
        <app-icon name="arrow-up-right" cls="h-3.5 w-3.5" />
      </a>

      <!-- Summary tiles -->
      <ul class="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        @for (t of tiles; track t.label; let i = $index) {
          <li appReveal [i]="i" class="u-card u-lift flex items-center gap-4 p-5">
            <span class="u-chip-ico h-12 w-12 rounded-2xl" [style.--tone]="t.tone">
              <app-icon [name]="t.icon" cls="h-5 w-5" />
            </span>
            <div>
              <p class="u-num text-[1.9rem] leading-none text-ink" [appCountUp]="t.value">
                {{ t.value }}
              </p>
              <p class="mt-1.5 text-[0.8rem] text-ink-dim">{{ t.label }}</p>
            </div>
          </li>
        }
      </ul>

      <div class="mt-4 grid gap-4">
        @for (p of projects; track p.project; let i = $index) {
          <div appReveal [i]="i" class="u-card p-5 md:p-7">
            <!-- Repository header -->
            <div class="flex flex-wrap items-center justify-between gap-3">
              <a
                [href]="p.repoUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="group inline-flex min-w-0 items-center gap-3"
                [attr.aria-label]="'Open ' + p.owner + '/' + p.project + ' on GitHub'"
              >
                <span class="u-chip-ico h-10 w-10" style="--tone: var(--t-violet)">
                  <app-icon name="github" cls="h-5 w-5" />
                </span>
                <span class="min-w-0">
                  <span class="block text-[0.78rem] text-ink-faint">{{ p.owner }}</span>
                  <h3
                    class="truncate text-[1.25rem] font-bold tracking-tight text-ink transition-colors group-hover:text-accent"
                  >
                    {{ p.project }}
                  </h3>
                </span>
              </a>

              <span
                class="inline-flex items-center gap-1.5 rounded-full bg-amber/12 px-3 py-1 text-[0.78rem] font-semibold text-amber"
              >
                <app-icon name="star" cls="h-3.5 w-3.5" />
                {{ p.stars }}
              </span>
            </div>

            <p class="mt-3 text-[0.925rem] leading-relaxed text-ink-dim">{{ p.description }}</p>

            <ul class="mt-3 flex flex-wrap gap-1.5">
              @for (t of p.tags; track t) {
                <li
                  class="rounded-full border border-line bg-raised px-2.5 py-0.5 text-[0.72rem] font-medium text-ink-dim"
                >
                  {{ t }}
                </li>
              }
            </ul>

            <!-- Contributions -->
            <ul class="mt-5 grid gap-3">
              @for (c of p.contributions; track c.url) {
                <li>
                  <a
                    [href]="c.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="group block rounded-2xl border border-line bg-raised p-4 transition-colors hover:border-accent/60 md:p-5"
                  >
                    <div class="flex flex-wrap items-center gap-2">
                      <span
                        class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-bold tracking-wide uppercase"
                        [style.color]="statusTone(c.status)"
                        [style.background]="'color-mix(in srgb, ' + statusTone(c.status) + ' 14%, transparent)'"
                      >
                        <app-icon [name]="statusIcon(c)" cls="h-3.5 w-3.5" />
                        {{ statusLabel(c.status) }}
                      </span>
                      <span class="u-num text-[0.8rem] text-ink-dim">{{ ref(c) }}</span>
                      @if (c.diff) {
                        <span class="text-[0.75rem] text-ink-faint">· {{ c.diff }}</span>
                      }
                      <app-icon
                        name="arrow-up-right"
                        cls="ml-auto h-4 w-4 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                      />
                    </div>

                    <p
                      class="mt-2.5 text-[1rem] leading-snug font-semibold text-ink transition-colors group-hover:text-accent"
                    >
                      {{ c.title }}
                    </p>
                    <p class="mt-2 max-w-4xl text-[0.875rem] leading-relaxed text-ink-dim">
                      {{ c.detail }}
                    </p>
                    @if (c.meta) {
                      <p class="mt-2.5 text-[0.75rem] font-medium text-ink-faint">{{ c.meta }}</p>
                    }
                  </a>
                </li>
              }
            </ul>
          </div>
        }
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

  private readonly merged = OPEN_SOURCE.flatMap((p) => p.contributions).filter(
    (c) => c.kind === 'pr' && c.status === 'merged',
  ).length;
  private readonly stars = OPEN_SOURCE.reduce((sum, p) => sum + parseStars(p.stars), 0);

  protected readonly tiles: { value: string; label: string; icon: IconName; tone: string }[] = [
    { value: String(this.merged), label: 'pull requests merged', icon: 'git-merge', tone: 'var(--t-green)' },
    {
      value: String(OPEN_SOURCE.length),
      label: 'upstream projects',
      icon: 'layers',
      tone: 'var(--t-violet)',
    },
    {
      value: `${(this.stars / 1000).toFixed(1)}k`,
      label: 'combined GitHub stars',
      icon: 'star',
      tone: 'var(--t-amber)',
    },
  ];

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

  protected statusTone(s: ContributionStatus): string {
    return s === 'merged' ? 'var(--t-green)' : s === 'approved' ? 'var(--t-amber)' : 'var(--t-blue)';
  }

  protected statusIcon(c: Contribution): IconName {
    return c.kind === 'pr' ? 'git-merge' : 'check';
  }
}
