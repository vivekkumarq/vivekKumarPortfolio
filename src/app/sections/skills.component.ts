import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SectionComponent } from '../shared/section.component';
import { RevealDirective } from '../shared/reveal.directive';
import { IconComponent } from '../shared/icon.component';
import { TechIconComponent } from '../shared/tech-icon.component';
import { SkillFilterService } from '../shared/skill-filter.service';
import { COMPETENCIES, PROJECTS, SKILLS } from '../core/profile';

const BAR_TONES = ['blue', 'violet', 'teal', 'pink', 'amber', 'green'] as const;

/**
 * Skills & competencies.
 *
 *   1. "Where it shows up" — one bar per technology, its length the number of
 *      projects on this page that use it. A count, not a proficiency score:
 *      no meters or star ratings that encode nothing real. Bars, like the
 *      pills, filter the Projects section.
 *   2. Core competencies, beside it.
 *   3. Grouped skill pills. Pills that map onto at least one project are
 *      buttons; the rest stay plain text rather than offer a dead-end filter.
 */
@Component({
  selector: 'app-skills',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionComponent, RevealDirective, IconComponent, TechIconComponent],
  template: `
    <app-section
      sectionId="skills"
      index="04"
      eyebrow="Toolkit"
      heading="Skills &amp; Competencies"
      [lead]="lead"
    >
      <div class="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <!-- 1 ─ Where it shows up -->
        <div appReveal class="u-card p-5 md:p-6">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <h3 class="text-[0.95rem] font-semibold text-ink">Where it shows up</h3>
            <p class="text-[0.75rem] text-ink-faint">Projects using each · click to filter</p>
          </div>

          <ul class="mt-4 grid gap-1">
            @for (bar of bars; track bar.label; let i = $index) {
              <li>
                <button
                  type="button"
                  (click)="filter.toggle(bar.label)"
                  [attr.aria-pressed]="filter.isActive(bar.label)"
                  [attr.aria-label]="
                    bar.label + ': ' + bar.count + ' of ' + total + ' projects. Filter projects'
                  "
                  class="grid w-full grid-cols-[8.5rem_1fr_3rem] items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-raised sm:grid-cols-[10rem_1fr_3.25rem]"
                  [class.bg-raised]="filter.isActive(bar.label)"
                >
                  <span class="flex min-w-0 items-center gap-2 text-[0.85rem] font-medium text-ink">
                    <app-tech-icon [name]="bar.label" cls="h-3.5 w-3.5 shrink-0" />
                    <span class="truncate">{{ bar.label }}</span>
                  </span>
                  <span class="h-2.5 overflow-hidden rounded-full bg-raised">
                    <span
                      class="u-bar block h-full rounded-full"
                      [style.--i]="i"
                      [style.width.%]="(bar.count / total) * 100"
                      [style.background]="'var(--t-' + bar.tone + ')'"
                      [style.opacity]="filter.active() && !filter.isActive(bar.label) ? 0.35 : 1"
                    ></span>
                  </span>
                  <span class="u-num text-right text-[0.85rem] text-ink-dim">
                    {{ bar.count }}<span class="text-ink-faint">/{{ total }}</span>
                  </span>
                </button>
              </li>
            }
          </ul>
        </div>

        <!-- 2 ─ Competencies + filter state -->
        <div appReveal [i]="1" class="u-card flex flex-col p-5 md:p-6">
          <h3 class="text-[0.95rem] font-semibold text-ink">Core competencies</h3>
          <ul class="mt-4 flex flex-wrap gap-2">
            @for (item of competencies; track item) {
              <li
                class="rounded-full border border-line bg-raised px-3 py-1 text-[0.78rem] font-medium text-ink-dim"
              >
                {{ item }}
              </li>
            }
          </ul>

          <div class="mt-auto pt-5">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-raised p-3.5">
              <button
                type="button"
                (click)="filter.clear()"
                [attr.aria-pressed]="filter.active() === null"
                [class]="filter.active() === null ? pillActive : pillIdle"
              >
                All skills
              </button>
              @if (filter.active(); as active) {
                <p class="text-[0.8125rem] text-ink-dim" role="status">
                  Filtering projects by <b class="text-accent">{{ active }}</b> —
                  <a href="#projects" class="u-link-underline font-medium text-ink hover:text-accent"
                    >see them ↓</a
                  >
                </p>
              } @else {
                <p class="text-[0.8125rem] text-ink-faint">
                  Pick a bar or a counted skill to filter the projects.
                </p>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- 3 ─ Skill groups -->
      <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        @for (group of groups; track group.group; let i = $index) {
          <div appReveal [i]="i % 4" class="u-card min-w-0 p-5">
            <h3 class="flex items-center gap-2.5 text-[0.9rem] font-semibold text-ink">
              <span
                class="u-chip-ico h-8 w-8 rounded-[0.6rem]"
                [style.--tone]="'var(--t-' + tones[i % tones.length] + ')'"
              >
                <app-icon [name]="group.icon" cls="h-4 w-4" />
              </span>
              {{ group.group }}
            </h3>

            <ul class="mt-4 flex flex-wrap gap-1.5">
              @for (item of group.items; track item) {
                <!-- flex, not block: an inline pill with no icon sat on a
                     different baseline and rode lower than its neighbours. -->
                <li class="flex">
                  @if (filter.isFilterable(item)) {
                    <button
                      type="button"
                      (click)="filter.toggle(item)"
                      [attr.aria-pressed]="filter.isActive(item)"
                      [attr.aria-label]="
                        'Filter projects by ' + item + ' (' + filter.countFor(item) + ')'
                      "
                      [class]="filter.isActive(item) ? skillActive : skillIdle"
                    >
                      <app-tech-icon [name]="item" cls="h-3 w-3" />
                      {{ item }}
                      <span class="u-num text-[0.68rem] opacity-70">{{ filter.countFor(item) }}</span>
                    </button>
                  } @else {
                    <span class="{{ skillStatic }}">
                      <app-tech-icon [name]="item" cls="h-3 w-3" />
                      {{ item }}
                    </span>
                  }
                </li>
              }
            </ul>
          </div>
        }
      </div>
    </app-section>
  `,
})
export class SkillsComponent {
  protected readonly lead =
    'The stack I work in day to day — backend services, APIs and messaging, plus the build and deployment tooling around them.';

  protected readonly filter = inject(SkillFilterService);

  protected readonly groups = SKILLS;
  protected readonly competencies = COMPETENCIES;
  protected readonly tones = BAR_TONES;
  protected readonly total = PROJECTS.length;

  /**
   * Skills used by at least two projects, most-used first. Ties keep the
   * order of the skills list, so the chart reads like the résumé.
   */
  protected readonly bars = SKILLS.flatMap((g) => g.items)
    .map((label) => ({ label, count: this.filter.countFor(label) }))
    .filter((b) => b.count >= 2)
    .sort((a, b) => b.count - a.count)
    .map((b, i) => ({ ...b, tone: BAR_TONES[i % BAR_TONES.length] }));

  /* Pill styling, shared between the reset control and the skill buttons. */
  protected readonly pillActive =
    'rounded-full border border-accent bg-accent/12 px-3.5 py-1 text-[0.78rem] font-semibold text-accent transition-colors';
  protected readonly pillIdle =
    'rounded-full border border-line bg-surface px-3.5 py-1 text-[0.78rem] font-medium text-ink-dim transition-colors hover:border-accent hover:text-accent';
  protected readonly skillActive =
    'inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent/12 px-2.5 py-1 text-[0.78rem] font-semibold text-accent transition-colors';
  protected readonly skillIdle =
    'inline-flex items-center gap-1.5 rounded-full border border-line bg-raised px-2.5 py-1 text-[0.78rem] font-medium text-ink-dim transition-colors hover:border-accent hover:text-accent';
  protected readonly skillStatic =
    'inline-flex items-center gap-1.5 rounded-full border border-line-soft px-2.5 py-1 text-[0.78rem] text-ink-faint';
}
