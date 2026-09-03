import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { PROFILE } from '../core/profile';
import { SectionComponent } from '../shared/section.component';
import { RevealDirective } from '../shared/reveal.directive';
import { IconComponent, type IconName } from '../shared/icon.component';

type Channel = {
  icon: IconName;
  label: string;
  value: string;
  href: string;
  external: boolean;
};

/**
 * Contact section. Deliberately has no form — a static site has nowhere to
 * POST to, and a form that silently drops messages is worse than none.
 * Direct channels only, with copy-to-clipboard on the address.
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
      <div class="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <!-- Invitation -->
        <div appReveal>
          <p class="u-display text-3xl leading-tight text-ink md:text-4xl">
            Have a backend problem worth solving?
          </p>
          <p class="mt-5 max-w-md text-[0.975rem] leading-relaxed text-ink-dim">
            I'm open to backend and platform engineering roles, and happy to talk
            through system design, API architecture, or anything Java and Spring.
            The fastest way to reach me is email.
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <a
              [href]="profile.emailUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
            >
              <app-icon name="mail" cls="h-4 w-4" />
              Send an email
            </a>
            <a
              [href]="profile.resumePath"
              download
              class="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-5 text-sm text-ink-dim transition-colors hover:border-accent hover:text-accent"
            >
              <app-icon name="download" cls="h-4 w-4" />
              Download résumé
            </a>
          </div>
        </div>

        <!-- Channels -->
        <ul class="divide-y divide-line overflow-hidden rounded-xl border border-line">
          @for (channel of channels; track channel.label; let idx = $index) {
            <li appReveal [i]="idx" class="group relative bg-surface">
              <div class="flex items-center gap-4 px-5 py-4">
                <span class="text-ink-faint transition-colors group-hover:text-accent">
                  <app-icon [name]="channel.icon" cls="h-4 w-4" />
                </span>

                <div class="min-w-0 flex-1">
                  <p class="font-mono text-[0.625rem] tracking-[0.16em] text-ink-faint uppercase">
                    {{ channel.label }}
                  </p>
                  <a
                    [href]="channel.href"
                    [attr.target]="channel.external ? '_blank' : null"
                    [attr.rel]="channel.external ? 'noopener noreferrer' : null"
                    class="u-link-underline block truncate text-[0.9375rem] text-ink-dim transition-colors hover:text-accent after:absolute after:inset-0 after:content-['']"
                  >
                    {{ channel.value }}
                  </a>
                </div>

                @if (channel.label === 'Email') {
                  <button
                    type="button"
                    (click)="copyEmail()"
                    class="relative z-10 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line text-ink-faint transition-colors hover:border-accent hover:text-accent"
                    [attr.aria-label]="copied() ? 'Email address copied' : 'Copy email address'"
                  >
                    @if (copied()) {
                      <app-icon name="check" cls="h-3.5 w-3.5" />
                    } @else {
                      <app-icon name="copy" cls="h-3.5 w-3.5" />
                    }
                  </button>
                }
              </div>
            </li>
          }
        </ul>
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

  protected readonly lead =
    'The quickest route is email — I read everything that arrives there.';

  protected readonly channels: Channel[] = [
    {
      icon: 'mail',
      label: 'Email',
      value: PROFILE.email,
      href: PROFILE.emailUrl,
      external: true,
    },
    {
      icon: 'linkedin',
      label: 'LinkedIn',
      value: 'in/vivek-k-87036b104',
      href: PROFILE.linkedin,
      external: true,
    },
    {
      icon: 'github',
      label: 'GitHub',
      value: `github.com/${PROFILE.githubHandle}`,
      href: PROFILE.github,
      external: true,
    },
    {
      icon: 'pin',
      label: 'Location',
      value: PROFILE.location,
      href: 'https://www.google.com/maps/place/Bengaluru',
      external: true,
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
