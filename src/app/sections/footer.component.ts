import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { PROFILE } from '../core/profile';
import { IconComponent } from '../shared/icon.component';
import { PaletteService } from '../shared/command-palette.component';

/**
 * Footer, plus the floating back-to-top button that appears once the reader
 * is well past the hero.
 */
@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <footer class="border-t border-line pt-10 pb-24 sm:pb-12">
      <div class="u-shell flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div class="flex items-center gap-3 text-center sm:text-left">
          <span
            class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-teal-300 via-sky-300 to-violet-400 text-[0.85rem] font-extrabold text-[#0b1020]"
            aria-hidden="true"
          >
            {{ profile.initials }}
          </span>
          <div>
            <p class="font-bold tracking-tight text-ink">{{ profile.name }}</p>
            <p class="text-[0.78rem] text-ink-faint">Built with Angular &amp; Tailwind · © {{ year }}</p>
          </div>
        </div>

        <button
          type="button"
          (click)="palette.open()"
          class="hidden items-center gap-2 text-[0.8rem] text-ink-faint transition-colors hover:text-accent lg:inline-flex"
        >
          Press <kbd class="u-kbd">/</kbd> to jump anywhere
        </button>

        <div class="flex items-center gap-2">
          @for (l of links; track l.label) {
            <a
              [href]="l.href"
              target="_blank"
              rel="noopener noreferrer"
              class="u-btn u-btn-soft w-11 px-0"
              [attr.aria-label]="l.label"
            >
              <app-icon [name]="l.icon" cls="h-4 w-4" />
            </a>
          }
        </div>
      </div>
    </footer>

    <button
      type="button"
      class="u-fab"
      [class.is-shown]="showFab()"
      (click)="toTop()"
      aria-label="Back to top"
      [attr.tabindex]="showFab() ? null : -1"
    >
      <app-icon name="arrow-down" cls="h-5 w-5 rotate-180" />
    </button>
  `,
})
export class FooterComponent {
  protected readonly profile = PROFILE;
  protected readonly palette = inject(PaletteService);
  /** Evaluated at build time during prerender; fine for a copyright line. */
  protected readonly year = new Date().getFullYear();

  protected readonly links = [
    { label: 'GitHub profile', href: PROFILE.github, icon: 'github' as const },
    { label: 'LinkedIn profile', href: PROFILE.linkedin, icon: 'linkedin' as const },
    { label: 'Send an email', href: PROFILE.emailUrl, icon: 'mail' as const },
  ];

  protected readonly showFab = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const onScroll = () => this.showFab.set(window.scrollY > window.innerHeight * 1.2);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));
    });
  }

  protected toTop(): void {
    document.getElementById('top')?.scrollIntoView();
  }
}
