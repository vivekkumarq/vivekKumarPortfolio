import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  viewChild,
  inject,
  signal,
} from '@angular/core';
import { NAV_LINKS, PROFILE } from '../core/profile';
import { IconComponent } from '../shared/icon.component';
import { FontMenuComponent } from '../shared/font-menu.component';
import { ThemeMenuComponent } from '../shared/theme-menu.component';
import { PaletteService } from '../shared/command-palette.component';

/**
 * Sticky header: monogram, anchor nav with scroll-spy, typography and theme
 * menus, resume link, a reading-progress rail, and a mobile sheet.
 *
 * Scroll-spy, progress, and the scrolled-state border are wired in
 * `afterNextRender`, which only runs in the browser — the prerendered HTML
 * is unaffected.
 */
@Component({
  selector: 'app-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, FontMenuComponent, ThemeMenuComponent],
  template: `
    <!-- Over the always-dark hero the header switches its colour tokens to
         light-on-dark (u-on-hero); past the hero it becomes a frosted bar
         in the page theme. -->
    <header
      class="u-enter-down fixed inset-x-0 top-0 z-50 transition-colors duration-300"
      [class.u-on-hero]="onHero()"
      [class.border-b]="!onHero()"
      [class.border-line]="!onHero()"
      [style.background-color]="
        onHero()
          ? scrolled()
            ? 'rgb(6 9 18 / 0.55)'
            : 'transparent'
          : 'color-mix(in srgb, var(--c-canvas) 82%, transparent)'
      "
      [style.backdrop-filter]="scrolled() ? 'blur(14px) saturate(140%)' : 'none'"
    >
      <nav class="u-shell flex h-16 items-center justify-between gap-4" aria-label="Primary">
        <!-- Monogram -->
        <!-- Negative margin keeps the visual position while the padding
             gives the link a full-size tap target. -->
        <a
          href="#top"
          class="-m-2 inline-flex min-h-11 items-center gap-2.5 p-2 text-ink"
          aria-label="Back to top"
        >
          <span
            class="grid h-8 w-8 place-items-center rounded-[0.6rem] bg-linear-to-br from-teal-300 via-sky-300 to-violet-400 text-[0.78rem] font-extrabold text-[#0b1020] shadow-lg shadow-black/30"
            aria-hidden="true"
          >
            {{ initials }}
          </span>
          <span class="hidden text-[0.95rem] font-bold tracking-tight sm:inline">{{ name }}</span>
        </a>

        <!-- Desktop links -->
        <ul #linkList class="relative hidden items-center gap-1 md:flex" (mouseleave)="hover(null)">
          <!-- Sliding highlight. Sits under the links (they are z-[1]). -->
          <span
            aria-hidden="true"
            class="u-nav-pill pointer-events-none absolute top-1/2 left-0 h-8 -translate-y-1/2 rounded-full border border-line-soft bg-raised"
            [style.width.px]="pill().width"
            [style.transform]="'translateX(' + pill().x + 'px)'"
            [style.opacity]="pill().width ? 1 : 0"
          ></span>
          @for (link of links; track link.href) {
            <li class="relative z-[1]">
              <a
                [href]="link.href"
                (mouseenter)="hover(link.href)"
                (focus)="hover(link.href)"
                (blur)="hover(null)"
                class="rounded-full px-3 py-2 text-[0.8125rem] transition-colors"
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
          <!-- Command menu trigger. Desktop only: the shortcut is the point,
               and phones have the menu sheet. -->
          <button
            type="button"
            (click)="palette.open()"
            class="hidden min-h-9 items-center gap-2 rounded-full border border-line pr-2 pl-3 text-ink-dim transition-colors hover:border-accent hover:text-accent lg:inline-flex"
            aria-label="Open command menu"
            aria-keyshortcuts="Control+K Meta+K"
          >
            <app-icon name="search" cls="h-3.5 w-3.5" />
            <kbd class="u-kbd">{{ shortcut() }}</kbd>
          </button>

          <!-- Hidden between md and lg, where the inline links need the room. -->
          <a
            [href]="resumePath"
            download
            class="hidden min-h-11 items-center gap-2 rounded-full border border-line px-4 text-[0.8rem] font-semibold text-ink-dim transition-colors hover:border-accent hover:text-accent sm:inline-flex md:hidden md:min-h-9 lg:inline-flex"
          >
            <app-icon name="download" cls="h-3.5 w-3.5" />
            Résumé
          </a>

          <app-font-menu />

          <app-theme-menu />

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

      <!-- Reading progress. Purely decorative, so it is hidden from
           assistive tech and sits flush with the header's bottom edge. -->
      <div class="absolute inset-x-0 bottom-0 h-px" aria-hidden="true">
        <div
          class="h-full origin-left bg-accent transition-opacity duration-300"
          [style.transform]="'scaleX(' + progress() + ')'"
          [style.opacity]="scrolled() ? 1 : 0"
        ></div>
      </div>

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
  private readonly destroyRef = inject(DestroyRef);
  protected readonly palette = inject(PaletteService);
  /** ⌘K on Apple platforms, Ctrl K elsewhere — decided in the browser. */
  protected readonly shortcut = signal('⌘K');

  protected readonly links = NAV_LINKS;
  protected readonly initials = PROFILE.initials;
  protected readonly name = PROFILE.name;
  /** True while the header still sits over the dark hero. */
  protected readonly onHero = signal(true);
  protected readonly resumePath = PROFILE.resumePath;

  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);
  protected readonly active = signal<string>('');
  /** 0–1 share of the scrollable page already read. */
  protected readonly progress = signal(0);

  private readonly linkList = viewChild<ElementRef<HTMLElement>>('linkList');
  private hovered: string | null = null;
  /** Position of the sliding highlight, relative to the link list. */
  protected readonly pill = signal({ x: 0, width: 0 });

  constructor() {
    afterNextRender(() => {
      if (!/Mac|iPhone|iPad/.test(navigator.platform)) this.shortcut.set('Ctrl K');
      this.watchScroll();
      this.watchSections();
      this.watchLinkSizes();
    });
  }

  protected hover(href: string | null): void {
    this.hovered = href;
    this.movePill();
  }

  /** Glides the highlight to the hovered link, else the active one, else hides it. */
  private movePill(): void {
    const list = this.linkList()?.nativeElement;
    const target = this.hovered ?? this.active();
    const link = target ? list?.querySelector<HTMLElement>(`a[href="${target}"]`) : null;
    if (!list || !link) {
      this.pill.update((p) => ({ ...p, width: 0 }));
      return;
    }
    const box = link.getBoundingClientRect();
    this.pill.set({ x: box.left - list.getBoundingClientRect().left, width: box.width });
  }

  /** Link widths change with the typography style and the viewport; follow them. */
  private watchLinkSizes(): void {
    const list = this.linkList()?.nativeElement;
    if (!list || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => this.movePill());
    observer.observe(list);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  /** Header grows a border and a blur once the page leaves the top, and the
   *  progress rail tracks how far down the document the reader is. */
  private watchScroll(): void {
    const onScroll = () => {
      this.scrolled.set(window.scrollY > 12);
      const hero = document.getElementById('top');
      this.onHero.set(!!hero && window.scrollY < hero.offsetHeight - 72);
      if (this.onHero() && this.active()) {
        this.active.set('');
        this.movePill();
      }
      // A page shorter than the viewport has nothing to scroll; treat it as
      // fully read rather than dividing by zero.
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      this.progress.set(
        scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 1,
      );
    };
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
            this.movePill();
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
