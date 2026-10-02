import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { PROFILE } from '../core/profile';
import { SectionComponent } from '../shared/section.component';
import { RevealDirective } from '../shared/reveal.directive';
import { IconComponent, type IconName } from '../shared/icon.component';

type Channel = {
  icon: IconName;
  label: string;
  value: string;
  href: string;
  tone: string;
};

/**
 * Contact section, as a dark aurora card that echoes the hero.
 *
 * Deliberately has no form — a static site has nowhere to POST to, and a
 * form that silently drops messages is worse than none. Direct channels
 * only, with copy-to-clipboard on the address.
 */
@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionComponent, RevealDirective, IconComponent],
  template: `
    <app-section
      sectionId="contact"
      index="07"
      eyebrow="Get in touch"
      heading="Contact"
      [lead]="lead"
    >
      <div
        appReveal
        class="u-hero rounded-[1.75rem] border border-white/10 p-6 shadow-2xl shadow-black/30 sm:p-8 md:p-10"
      >
        <div class="u-hero-grid" aria-hidden="true"></div>
        <div class="u-hero-tint" aria-hidden="true"></div>

        <div class="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div>
            <span
              class="u-glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.78rem] font-medium text-white/90"
            >
              <span class="u-live"></span>
              {{ profile.availability }}
            </span>
            <p
              class="u-display mt-5 text-[clamp(1.9rem,4vw,2.9rem)] leading-[1.05] text-balance text-white"
            >
              Have a backend problem <span class="u-grad">worth solving?</span>
            </p>
            <p class="mt-4 max-w-md text-[0.975rem] leading-relaxed text-white/75">
              I'm open to backend and platform engineering roles, and happy to talk through system
              design, API architecture, or anything Java and Spring. The fastest way to reach me is
              email.
            </p>

            <div class="mt-7 flex flex-wrap gap-3">
              <a
                [href]="profile.emailUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="u-btn u-btn-light"
              >
                <app-icon name="mail" cls="h-4 w-4" />
                Send an email
              </a>
              <a [href]="profile.resumePath" download class="u-btn u-btn-glass">
                <app-icon name="download" cls="h-4 w-4" />
                Download résumé
              </a>
            </div>
          </div>

          <ul class="grid gap-2.5 self-center">
            @for (channel of channels; track channel.label) {
              <li class="u-glass group relative flex items-center gap-4 rounded-2xl px-4 py-3.5">
                <span class="u-chip-ico" [style.--tone]="channel.tone">
                  <app-icon [name]="channel.icon" cls="h-[1.1rem] w-[1.1rem]" />
                </span>

                <div class="min-w-0 flex-1">
                  <p class="text-[0.72rem] font-medium text-white/55">{{ channel.label }}</p>
                  <a
                    [href]="channel.href"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block truncate text-[0.95rem] font-semibold text-white after:absolute after:inset-0 after:rounded-2xl after:content-['']"
                  >
                    {{ channel.value }}
                  </a>
                </div>

                @if (channel.label === 'Email') {
                  <button
                    type="button"
                    (click)="copyEmail()"
                    class="relative z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                    [attr.aria-label]="copied() ? 'Email address copied' : 'Copy email address'"
                  >
                    @if (copied()) {
                      <app-icon name="check" cls="h-4 w-4" />
                    } @else {
                      <app-icon name="copy" cls="h-4 w-4" />
                    }
                  </button>
                } @else {
                  <app-icon
                    name="arrow-up-right"
                    cls="h-4 w-4 shrink-0 text-white/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
                  />
                }
              </li>
            }
          </ul>
        </div>
      </div>

      <!-- Polite live region for the copy confirmation -->
      <p class="sr-only" role="status" aria-live="polite">
        {{ copied() ? 'Email address copied to clipboard' : '' }}
      </p>
    </app-section>
  `,
})
export class ContactComponent {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly profile = PROFILE;
  protected readonly copied = signal(false);

  protected readonly lead = 'The quickest route is email — I read everything that arrives there.';

  protected readonly channels: Channel[] = [
    {
      icon: 'mail',
      label: 'Email',
      value: PROFILE.email,
      href: PROFILE.emailUrl,
      tone: '#5eead4',
    },
    {
      icon: 'linkedin',
      label: 'LinkedIn',
      // Shown handle derived from the URL, so the two can never disagree.
      value: PROFILE.linkedin.replace(/^https:\/\/www\.linkedin\.com\/|\/$/g, ''),
      href: PROFILE.linkedin,
      tone: '#93c5fd',
    },
    {
      icon: 'github',
      label: 'GitHub',
      value: `github.com/${PROFILE.githubHandle}`,
      href: PROFILE.github,
      tone: '#c4b5fd',
    },
    {
      icon: 'pin',
      label: 'Location',
      value: PROFILE.location,
      href: 'https://www.google.com/maps/place/Bengaluru',
      tone: '#f9a8d4',
    },
  ];

  private timer: ReturnType<typeof setTimeout> | undefined;

  protected async copyEmail(): Promise<void> {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      this.copied.set(true);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.copied.set(false), 2000);
      this.destroyRef.onDestroy(() => clearTimeout(this.timer));
    } catch {
      // Clipboard can be blocked (insecure context, denied permission).
      // The address is visible and selectable either way, so there is
      // nothing useful to recover — just leave the button unchanged.
    }
  }
}
