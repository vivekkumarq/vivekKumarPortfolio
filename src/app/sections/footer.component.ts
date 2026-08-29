import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PROFILE } from '../core/profile';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <footer class="border-t border-line-soft py-10">
      <div class="u-shell flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div class="text-center sm:text-left">
          <p class="u-display text-lg text-ink">
            {{ profile.name }}<span class="text-accent">.</span>
          </p>
          <p class="mt-1 font-mono text-[0.6875rem] tracking-[0.08em] text-ink-faint">
            Built with Angular &amp; Tailwind · © {{ year }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <a
            [href]="profile.github"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-faint transition-colors hover:border-accent hover:text-accent"
            aria-label="GitHub profile"
          >
            <app-icon name="github" cls="h-4 w-4" />
          </a>
          <a
            [href]="profile.linkedin"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-faint transition-colors hover:border-accent hover:text-accent"
            aria-label="LinkedIn profile"
          >
            <app-icon name="linkedin" cls="h-4 w-4" />
          </a>
          <a
            [href]="'mailto:' + profile.email"
            class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-faint transition-colors hover:border-accent hover:text-accent"
            aria-label="Send an email"
          >
            <app-icon name="mail" cls="h-4 w-4" />
          </a>
          <a
            href="#top"
            class="ml-2 inline-flex min-h-11 items-center font-mono text-[0.6875rem] tracking-[0.12em] text-ink-faint uppercase transition-colors hover:text-accent"
          >
            Back to top
          </a>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  protected readonly profile = PROFILE;
  /** Evaluated at build time during prerender; fine for a copyright line. */
  protected readonly year = new Date().getFullYear();
}
