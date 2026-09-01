import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';

import { EXPERIENCE, type Role } from '../core/profile';
import { IconComponent } from '../shared/icon.component';
import { RevealDirective } from '../shared/reveal.directive';
import { RichTextComponent } from '../shared/rich-text.component';
import { SectionComponent } from '../shared/section.component';

/** Section-level detail switch, owned by ExperienceComponent. */
export type ExperienceView = 'quick' | 'deep';

/**
 * One entry on the experience timeline.
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
  imports: [IconComponent, RichTextComponent],
  template: `
    <article class="relative border-l border-line pl-6 sm:pl-9">
      <!-- Timeline node, aligned to the role title -->
      <span
        class="absolute left-0 top-2 flex h-2.5 w-2.5 -translate-x-1/2 items-center justify-center"
      >
        @if (role().current) {
          <span
            class="u-pulse-ring absolute inline-flex h-2.5 w-2.5 rounded-full bg-accent/50"
          ></span>
          <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent"></span>
        } @else {
          <span
            class="relative inline-flex h-2.5 w-2.5 rounded-full border border-line bg-canvas"
          ></span>
        }
      </span>

      <header>
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h3 class="u-display text-2xl text-ink sm:text-3xl">{{ role().title }}</h3>

          @if (role().current) {
            <span
              class="rounded-full border border-accent/40 px-2.5 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-accent"
            >
              Current
            </span>
          }
        </div>

        <p class="mt-1.5 text-[0.95rem] text-ink-dim">
          @if (role().companyUrl; as url) {
            <a
              [href]="url"
              target="_blank"
              rel="noopener noreferrer"
              class="u-link-underline text-ink transition-colors hover:text-accent"
            >
              {{ role().company }}
            </a>
          } @else {
            <span class="text-ink">{{ role().company }}</span>
          }
        </p>

        <div
          class="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-faint"
        >
          <span>{{ role().period }}</span>
          <span class="h-px w-3 bg-line"></span>
          <span>{{ role().employment }}</span>
          <span class="h-px w-3 bg-line"></span>
          <span>{{ role().location }}</span>
        </div>
      </header>

      <!-- Quick view: the 30-second scan -->
      <div
        class="u-collapse"
        [class.is-open]="mode() === 'quick'"
        [attr.inert]="mode() === 'quick' ? null : ''"
      >
        <div>
          <ul class="mt-6 space-y-3">
            @for (line of role().quick; track line) {
              <li class="flex gap-3">
                <span class="mt-[0.3rem] shrink-0 text-accent">
                  <app-icon name="chevron-right" cls="h-3.5 w-3.5" />
                </span>
                <p class="text-[0.95rem] leading-relaxed text-ink-dim">
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
          <p class="mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-ink-dim">
            {{ role().summary }}
          </p>

          <ul class="mt-6 space-y-3.5">
            @for (bullet of role().bullets; track bullet.text) {
              <li class="flex gap-3">
                <span class="mt-[0.3rem] shrink-0 text-accent">
                  <app-icon name="chevron-right" cls="h-3.5 w-3.5" />
                </span>

                <div class="min-w-0">
                  <p class="text-[0.925rem] leading-relaxed text-ink-dim">
                    <app-rich [text]="bullet.text" />
                  </p>

                  @if (bullet.metric; as metric) {
                    <span
                      class="mt-2 inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-md border border-line bg-raised px-2.5 py-1"
                    >
                      <span class="font-mono text-sm text-accent">{{ metric.value }}</span>
                      <span class="text-[0.6875rem] text-ink-faint">{{ metric.label }}</span>
                    </span>
                  }
                </div>
              </li>
            }
          </ul>
        </div>
      </div>

      <ul class="mt-8 flex flex-wrap gap-2">
        @for (tech of role().stack; track tech) {
          <li
            class="rounded-full border border-line bg-raised px-3 py-1 font-mono text-[0.6875rem] tracking-[0.06em] text-ink-dim transition-colors hover:border-accent hover:text-accent"
          >
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
}

/**
 * Experience section — a vertical timeline over `EXPERIENCE`, with a
 * section-level switch between the recruiter cut and the full record.
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
      <!-- View-mode switch -->
      <div appReveal class="mb-10 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div
          role="group"
          aria-label="Experience detail level"
          class="inline-flex rounded-full border border-line bg-surface p-1"
        >
          <button
            type="button"
            (click)="mode.set('quick')"
            [attr.aria-pressed]="mode() === 'quick'"
            [class]="mode() === 'quick' ? segActive : segIdle"
          >
            Quick view
          </button>
          <button
            type="button"
            (click)="mode.set('deep')"
            [attr.aria-pressed]="mode() === 'deep'"
            [class]="mode() === 'deep' ? segActive : segIdle"
          >
            Deep dive
          </button>
        </div>

        <p
          class="font-mono text-[0.6875rem] tracking-[0.12em] text-ink-faint uppercase"
          role="status"
        >
          {{ mode() === 'quick' ? 'The 30-second scan' : 'Architecture, ownership and detail' }}
        </p>
      </div>

      <div class="space-y-16">
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

  protected readonly segActive =
    'rounded-full bg-accent px-4 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-canvas transition-colors';
  protected readonly segIdle =
    'rounded-full px-4 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-dim transition-colors hover:text-ink';
}
