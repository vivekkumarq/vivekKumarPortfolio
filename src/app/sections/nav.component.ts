import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { NAV_LINKS, PROFILE } from '../core/profile';
import { ThemeService } from '../shared/theme.service';
import { IconComponent } from '../shared/icon.component';
import { FontMenuComponent } from '../shared/font-menu.component';

/**
 * Sticky header: monogram, anchor nav with scroll-spy, theme toggle,
 * resume link, and a mobile sheet.
 *
 * Scroll-spy and the scrolled-state border are wired in `afterNextRender`,
 * which only runs in the browser — the prerendered HTML is unaffected.
 */
@Component({
  selector: 'app-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, FontMenuComponent],
  template: `
    <header
      class="fixed inset-x-0 top-0 z-50 transition-colors duration-300"
      [class.border-b]="scrolled()"
      [class.border-line]="scrolled()"
      [style.background-color]="scrolled() ? 'color-mix(in srgb, var(--c-canvas) 82%, transparent)' : 'transparent'"
      [style.backdrop-filter]="scrolled() ? 'blur(12px)' : 'none'"
    >
      <nav class="u-shell flex h-16 items-center justify-between gap-4" aria-label="Primary">
        <!-- Monogram -->
        <!-- Negative margin keeps the visual position while the padding
             gives the link a full-size tap target. -->
        <a
          href="#top"
          class="-m-2 inline-flex min-h-11 items-center p-2 u-display text-xl tracking-tight text-ink transition-colors hover:text-accent"
          aria-label="Back to top"
        >
          {{ initials }}<span class="text-accent">.</span>
        </a>

        <!-- Desktop links -->
        <ul class="hidden items-center gap-1 md:flex">
          @for (link of links; track link.href) {
            <li>
              <a
                [href]="link.href"
                class="rounded-md px-3 py-2 text-[0.8125rem] transition-colors"
                [class.text-accent]="active() === link.href"
                [class.text-ink-dim]="active() !== link.href"
                [class.hover:text-ink]="active() !== link.href"
                [attr.aria-current]="active() === link.href ? 'true' : null"
              >
                {{ link.label }}
              </a>
            </li>
          }
        </ul>

        <div class="flex items-center gap-2">
          <a
            [href]="resumePath"
            download
            class="hidden min-h-11 items-center gap-2 rounded-full border border-line px-4 font-mono text-[0.6875rem] tracking-[0.12em] text-ink-dim uppercase transition-colors hover:border-accent hover:text-accent sm:inline-flex md:min-h-9"
          >
            <app-icon name="download" cls="h-3.5 w-3.5" />
            Résumé
          </a>

          <app-font-menu />

          <button
            type="button"
            (click)="theme.toggle()"
            class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-dim transition-colors hover:border-accent hover:text-accent md:h-9 md:w-9"
            [attr.aria-label]="
              theme.theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
            "
          >
            @if (theme.theme() === 'dark') {
              <app-icon name="sun" cls="h-4 w-4" />
            } @else {
              <app-icon name="moon" cls="h-4 w-4" />
            }
          </button>

          <button
            type="button"
            (click)="menuOpen.set(!menuOpen())"
            class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-dim transition-colors hover:border-accent hover:text-accent md:hidden"
            [attr.aria-expanded]="menuOpen()"
            aria-controls="mobile-menu"
            [attr.aria-label]="menuOpen() ? 'Close menu' : 'Open menu'"
          >
            @if (menuOpen()) {
              <app-icon name="close" cls="h-4 w-4" />
            } @else {
              <app-icon name="menu" cls="h-4 w-4" />
            }
          </button>
        </div>
      </nav>

      <!-- Mobile sheet -->
      @if (menuOpen()) {
        <div
          id="mobile-menu"
          class="border-t border-line bg-surface md:hidden"
        >
          <ul class="u-shell flex flex-col py-2">
            @for (link of links; track link.href) {
              <li>
                <a
                  [href]="link.href"
                  (click)="menuOpen.set(false)"
                  class="block border-b border-line-soft py-3 text-sm transition-colors"
                  [class.text-accent]="active() === link.href"
                  [class.text-ink-dim]="active() !== link.href"
                >
                  {{ link.label }}
                </a>
              </li>
            }
            <li>
              <a
                [href]="resumePath"
                download
                (click)="menuOpen.set(false)"
                class="flex items-center gap-2 py-3 text-sm text-ink-dim transition-colors hover:text-accent"
              >
                <app-icon name="download" cls="h-4 w-4" />
                Download résumé
              </a>
            </li>
          </ul>
        </div>
      }
    </header>
  `,
})
export class NavComponent {
  protected readonly theme = inject(ThemeService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly links = NAV_LINKS;
  protected readonly initials = PROFILE.initials;
  protected readonly resumePath = PROFILE.resumePath;

  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);
  protected readonly active = signal<string>('');

  constructor() {
    afterNextRender(() => {
      this.watchScroll();
      this.watchSections();
    });
  }

  /** Header grows a border and a blur once the page leaves the top. */
  private watchScroll(): void {
    const onScroll = () => this.scrolled.set(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));
  }

  /** Scroll-spy: highlights whichever section currently owns the viewport. */
  private watchSections(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    const sections = this.links
      .map((link) => document.querySelector<HTMLElement>(link.href))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.active.set(`#${entry.target.id}`);
          }
        }
      },
      // A band across the upper-middle of the viewport, so the highlight
      // changes when a section reaches reading position rather than when
      // it first peeks in at the bottom.
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    );

    for (const section of sections) observer.observe(section);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
