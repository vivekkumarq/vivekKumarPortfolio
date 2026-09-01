import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SectionComponent } from '../shared/section.component';
import { RevealDirective } from '../shared/reveal.directive';
import { IconComponent } from '../shared/icon.component';
import { TechIconComponent } from '../shared/tech-icon.component';
import { SkillFilterService } from '../shared/skill-filter.service';
import { SKILLS, SKILL_TICKER, COMPETENCIES } from '../core/profile';

/**
 * Skills & competencies.
 *
 * Three blocks, deliberately decreasing in weight:
 *   1. grouped skill pills (the substance) — pills that map onto at least
 *      one project are buttons that filter the Projects section below;
 *      the rest stay plain text rather than offering a dead-end filter
 *   2. a slow marquee strip (texture — the list is rendered twice because
 *      `.u-marquee` translates -50%)
 *   3. core competencies as a light footnote row
 *
 * No proficiency bars, meters or star ratings — they encode nothing real.
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
      <!-- Filter state row -->
      <div appReveal class="mb-6 flex min-h-9 flex-wrap items-center gap-x-3 gap-y-2">
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
            Filtering projects by
            <span class="font-mono text-accent">{{ active }}</span>
            —
            <a href="#projects" class="u-link-underline text-ink transition-colors hover:text-accent">
              see them below ↓
            </a>
          </p>
        } @else {
          <p class="text-[0.8125rem] text-ink-faint">
            Skills with a
            <span class="font-mono text-ink-dim">count</span>
            filter the projects section — click one.
          </p>
        }
      </div>

      <!-- 1 ─ Skill groups -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        @for (group of groups; track group.group) {
          <div
            appReveal
            [i]="$index"
            class="u-card min-w-0 p-5 md:p-6"
          >
            <h3 class="u-eyebrow flex items-center gap-2">
              <app-icon [name]="group.icon" cls="h-3.5 w-3.5" />
              {{ group.group }}
            </h3>

            <ul class="mt-4 flex flex-wrap gap-2">
              @for (item of group.items; track item) {
                <li>
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
                      <span class="text-[0.6rem] opacity-70">{{ filter.countFor(item) }}</span>
                    </button>
                  } @else {
                    <span
                      class="inline-flex items-center gap-1.5 rounded-full border border-line bg-raised px-3 py-1 font-mono text-[0.72rem] text-ink-dim"
                    >
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

      <!-- 2 ─ Ticker -->
      <div
        appReveal
        class="u-marquee-host relative mt-10 overflow-hidden border-y border-line-soft py-4"
      >
        <div class="u-marquee flex w-max items-center">
          <ul class="flex shrink-0 items-center">
            @for (chip of ticker; track chip) {
              <li class="flex shrink-0 items-center gap-5 px-5">
                <span
                  class="font-mono text-[0.7rem] tracking-[0.16em] whitespace-nowrap
                         text-ink-faint uppercase"
                >
                  {{ chip }}
                </span>
                <span class="h-1 w-1 shrink-0 rounded-full bg-accent opacity-40"></span>
              </li>
            }
          </ul>

          <ul aria-hidden="true" class="flex shrink-0 items-center">
            @for (chip of ticker; track chip) {
              <li class="flex shrink-0 items-center gap-5 px-5">
                <span
                  class="font-mono text-[0.7rem] tracking-[0.16em] whitespace-nowrap
                         text-ink-faint uppercase"
                >
                  {{ chip }}
                </span>
                <span class="h-1 w-1 shrink-0 rounded-full bg-accent opacity-40"></span>
              </li>
            }
          </ul>
        </div>

        <!-- Edge fades. Inline gradients so both themes resolve from the token. -->
        <div
          class="pointer-events-none absolute inset-y-0 left-0 w-12 md:w-20"
          style="background-image: linear-gradient(to right, var(--c-canvas), transparent)"
          aria-hidden="true"
        ></div>
        <div
          class="pointer-events-none absolute inset-y-0 right-0 w-12 md:w-20"
          style="background-image: linear-gradient(to left, var(--c-canvas), transparent)"
          aria-hidden="true"
        ></div>
      </div>

      <!-- 3 ─ Core competencies (footnote weight) -->
      <div appReveal [i]="1" class="mt-10">
        <h3 class="font-mono text-[0.6875rem] tracking-[0.18em] text-ink-faint uppercase">
          Core Competencies
        </h3>

        <ul class="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
          @for (item of competencies; track item; let last = $last) {
            <li class="flex items-center gap-2">
              <span class="font-mono text-[0.72rem] text-ink-dim">{{ item }}</span>
              @if (!last) {
                <span class="text-[0.72rem] text-accent opacity-50" aria-hidden="true">/</span>
              }
            </li>
          }
        </ul>
      </div>
    </app-section>
  `,
})
export class SkillsComponent {
  protected readonly lead =
    'The stack I work in day to day — backend services, APIs and messaging, plus the build and deployment tooling around them.';

  protected readonly filter = inject(SkillFilterService);

  protected readonly groups = SKILLS;
  protected readonly ticker = SKILL_TICKER;
  protected readonly competencies = COMPETENCIES;

  /* Pill styling, shared between the reset control and the skill buttons. */
  protected readonly pillActive =
    'rounded-full border border-accent bg-accent/10 px-3.5 py-1 font-mono text-[0.72rem] text-accent transition-colors';
  protected readonly pillIdle =
    'rounded-full border border-line bg-raised px-3.5 py-1 font-mono text-[0.72rem] text-ink-dim transition-colors hover:border-accent hover:text-accent';
  protected readonly skillActive =
    'inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent/10 px-3 py-1 font-mono text-[0.72rem] text-accent transition-colors';
  protected readonly skillIdle =
    'inline-flex items-center gap-1.5 rounded-full border border-line bg-raised px-3 py-1 font-mono text-[0.72rem] text-ink-dim transition-colors hover:border-accent hover:text-accent';
}
