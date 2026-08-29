import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';

import { EXPERIENCE, type Bullet, type Role } from '../core/profile';
import { IconComponent } from '../shared/icon.component';
import { RevealDirective } from '../shared/reveal.directive';
import { RichTextComponent } from '../shared/rich-text.component';
import { SectionComponent } from '../shared/section.component';

/**
 * One entry on the experience timeline.
 *
 * Lives here rather than in `shared/` because nothing else needs it. It is a
 * separate component purely so that the "show all / show less" state is owned
 * per role — with N roles a single shared flag would expand every one of them
 * at once.
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

      <p class="mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-ink-dim">
        {{ role().summary }}
      </p>

      <ul class="mt-7 space-y-3.5">
        @for (bullet of visibleBullets(); track bullet.text) {
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

      @if (role().bullets.length > preview) {
        <button
          type="button"
          (click)="toggle()"
          [attr.aria-expanded]="expanded()"
          class="mt-3 -mx-2 inline-flex min-h-11 items-center gap-2 px-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-faint transition-colors hover:text-accent"
        >
          @if (expanded()) {
            Show less
          } @else {
            Show all {{ role().bullets.length }}
          }
          <span
            class="inline-flex transition-transform duration-300"
            [class.-rotate-90]="expanded()"
            [class.rotate-90]="!expanded()"
          >
            <app-icon name="chevron-right" cls="h-3.5 w-3.5" />
          </span>
        </button>
      }

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

  /** Bullets shown before the reader asks for the rest. */
  protected readonly preview = 5;

  protected readonly expanded = signal<boolean>(false);

  protected readonly visibleBullets = computed<Bullet[]>(() => {
    const bullets = this.role().bullets;
    return this.expanded() ? bullets : bullets.slice(0, this.preview);
  });

  protected toggle(): void {
    this.expanded.update((open) => !open);
  }
}

/**
 * Experience section — a vertical timeline over `EXPERIENCE`.
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
      <div class="space-y-16">
        @for (role of experience; track role.company) {
          <div appReveal [i]="$index">
            <app-role-entry [role]="role" />
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
}
