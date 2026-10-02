import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

import { EXPERIENCE, type Role } from '../core/profile';
import { IconComponent } from '../shared/icon.component';
import { TechIconComponent } from '../shared/tech-icon.component';
import { RevealDirective } from '../shared/reveal.directive';
import { RichTextComponent } from '../shared/rich-text.component';
import { SectionComponent } from '../shared/section.component';

/** Section-level detail switch, owned by ExperienceComponent. */
export type ExperienceView = 'quick' | 'deep';

/**
 * One role, as a dashboard card.
 *
 * Renders both cuts of the role and lets the animated `.u-collapse`
 * containers swap between them: `quick` is the recruiter scan (two lines,
 * no summary), `deep` is the full record — summary, every bullet with its
 * metric chip, and the architecture detail. Both blocks stay in the DOM so
 * the prerendered HTML always carries the complete content; the collapsed
 * one is `inert`, keeping it out of tab order and screen readers.
 */
@Component({
  selector: 'app-role-entry',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TechIconComponent, RichTextComponent],
  template: `
    <article
      class="u-card overflow-hidden p-6 md:p-8"
      style="background-image: radial-gradient(700px 260px at 100% 0, color-mix(in srgb, var(--c-accent) 10%, transparent), transparent 70%)"
    >
      <header class="flex flex-wrap items-start gap-4">
        <span class="u-chip-ico h-12 w-12 rounded-2xl" style="--tone: var(--t-blue)">
          <app-icon name="briefcase" cls="h-5 w-5" />
        </span>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 class="u-display text-[1.6rem] leading-tight text-ink sm:text-[1.9rem]">
              {{ role().title }}
            </h3>
            @if (role().current) {
              <span
                class="inline-flex items-center gap-1.5 rounded-full bg-green/12 px-2.5 py-1 text-[0.7rem] font-semibold text-green"
              >
                <span class="u-live h-1.5 w-1.5"></span>
                Current
              </span>
            }
          </div>

          <p class="mt-1 text-[0.95rem] text-ink-dim">
            @if (role().companyUrl; as url) {
              <a
                [href]="url"
                target="_blank"
                rel="noopener noreferrer"
                class="u-link-underline font-semibold text-ink transition-colors hover:text-accent"
              >
                {{ role().company }}
              </a>
            } @else {
              <span class="font-semibold text-ink">{{ role().company }}</span>
            }
          </p>
        </div>

        <ul class="flex flex-wrap gap-2 text-[0.75rem]">
          @for (m of meta(); track m) {
            <li
              class="rounded-full border border-line bg-raised px-3 py-1 font-medium text-ink-dim"
            >
              {{ m }}
            </li>
          }
        </ul>
      </header>

      <!-- Quick view: the 30-second scan -->
      <div
        class="u-collapse"
        [class.is-open]="mode() === 'quick'"
        [attr.inert]="mode() === 'quick' ? null : ''"
      >
        <div>
          <ul class="mt-6 grid gap-3 md:grid-cols-2">
            @for (line of role().quick; track line) {
              <li class="flex gap-3 rounded-2xl border border-line bg-raised p-4">
                <span class="mt-0.5 shrink-0 text-accent">
                  <app-icon name="check" cls="h-4 w-4" />
                </span>
                <p class="text-[0.925rem] leading-relaxed text-ink-dim">
                  <app-rich [text]="line" />
                </p>
              </li>
            }
          </ul>
        </div>
      </div>

      <!-- Deep dive: summary, every bullet, metric chips -->
      <div
        class="u-collapse"
        [class.is-open]="mode() === 'deep'"
        [attr.inert]="mode() === 'deep' ? null : ''"
      >
        <div>
          <p class="mt-6 max-w-3xl text-[0.95rem] leading-relaxed text-ink-dim">
            {{ role().summary }}
          </p>

          <ul class="mt-5 grid gap-3 md:grid-cols-2">
            @for (bullet of role().bullets; track bullet.text) {
              <li class="flex gap-3 rounded-2xl border border-line bg-raised p-4">
                <span class="mt-0.5 shrink-0 text-accent">
                  <app-icon name="chevron-right" cls="h-4 w-4" />
                </span>
                <div class="min-w-0">
                  <p class="text-[0.9rem] leading-relaxed text-ink-dim">
                    <app-rich [text]="bullet.text" />
                  </p>
                  @if (bullet.metric; as metric) {
                    <span
                      class="mt-2 inline-flex flex-wrap items-baseline gap-x-2 rounded-lg bg-accent/10 px-2.5 py-1"
                    >
                      <span class="u-num text-sm text-accent">{{ metric.value }}</span>
                      <span class="text-[0.72rem] text-ink-dim">{{ metric.label }}</span>
                    </span>
                  }
                </div>
              </li>
            }
          </ul>
        </div>
      </div>

      <ul class="mt-6 flex flex-wrap gap-2 border-t border-line pt-5">
        @for (tech of role().stack; track tech) {
          <li
            class="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-[0.78rem] font-medium text-ink-dim transition-colors hover:border-accent hover:text-accent"
          >
            <app-tech-icon [name]="tech" cls="h-3.5 w-3.5" />
            {{ tech }}
          </li>
        }
      </ul>
    </article>
  `,
})
export class RoleEntryComponent {
  readonly role = input.required<Role>();
  readonly mode = input.required<ExperienceView>();

  protected meta(): string[] {
    const r = this.role();
    return [r.period, r.employment, r.location];
  }
}

/**
 * Experience section — role cards over `EXPERIENCE`, with a section-level
 * switch between the recruiter cut and the full record.
 */
@Component({
  selector: 'app-experience',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionComponent, RevealDirective, RoleEntryComponent],
  template: `
    <app-section
      sectionId="experience"
      index="02"
      eyebrow="Where I've worked"
      heading="Experience"
      [lead]="lead"
    >
      <div sectionActions class="flex flex-col items-start gap-2 sm:items-end">
        <div role="group" aria-label="Experience detail level" class="u-seg">
          <button
            type="button"
            (click)="mode.set('quick')"
            [attr.aria-pressed]="mode() === 'quick'"
          >
            Quick view
          </button>
          <button type="button" (click)="mode.set('deep')" [attr.aria-pressed]="mode() === 'deep'">
            Deep dive
          </button>
        </div>
        <p class="text-[0.75rem] text-ink-faint" role="status">
          {{ mode() === 'quick' ? 'The 30-second scan' : 'Architecture, ownership and detail' }}
        </p>
      </div>

      <div class="space-y-5">
        @for (role of experience; track role.company) {
          <div appReveal [i]="$index">
            <app-role-entry [role]="role" [mode]="mode()" />
          </div>
        }
      </div>
    </app-section>
  `,
})
export class ExperienceComponent {
  protected readonly lead =
    'Software Engineer at Netcracker Technology since September 2022, building backend microservices for enterprise telecom BSS/OSS platforms.';

  protected readonly experience: Role[] = EXPERIENCE;

  protected readonly mode = signal<ExperienceView>('quick');
}
