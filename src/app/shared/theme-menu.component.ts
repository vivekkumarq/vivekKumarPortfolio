import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { THEME_OPTIONS, ThemeService, type Theme } from './theme.service';
import { IconComponent } from './icon.component';

/**
 * Colour-theme selector for the header, sharing the typography menu's
 * structure and visual language: a round trigger opening a small menu whose
 * options are menuitemradio, closing on outside click, Escape, and selection.
 *
 * Each row carries a real two-tone swatch built from that theme's own canvas
 * and accent values, so the menu previews the palette instead of naming it.
 */
@Component({
  selector: 'app-theme-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'open.set(false)',
  },
  template: `
    <div class="relative">
      <button
        type="button"
        (click)="open.set(!open())"
        class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-dim transition-colors hover:border-accent hover:text-accent md:h-9 md:w-9"
        [class.border-accent]="open()"
        [class.text-accent]="open()"
        aria-haspopup="menu"
        [attr.aria-expanded]="open()"
        aria-label="Choose colour theme"
      >
        @if (theme.isLight()) {
          <app-icon name="moon" cls="h-4 w-4" />
        } @else {
          <app-icon name="sun" cls="h-4 w-4" />
        }
      </button>

      @if (open()) {
        <div
          role="menu"
          aria-label="Colour theme"
          class="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-line bg-surface p-1.5 shadow-xl shadow-black/25"
        >
          <p
            class="px-3 pt-2 pb-1 font-mono text-[0.625rem] tracking-[0.16em] text-ink-faint uppercase"
          >
            Theme
          </p>

          @for (option of options; track option.id) {
            <button
              type="button"
              role="menuitemradio"
              [attr.aria-checked]="theme.theme() === option.id"
              (click)="pick(option.id)"
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-raised"
            >
              <span
                class="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line"
                [style.background-color]="option.canvas"
              >
                <span
                  class="h-2.5 w-2.5 rounded-full"
                  [style.background-color]="option.accent"
                ></span>
              </span>

              <span class="min-w-0 flex-1">
                <span
                  class="block text-[0.875rem] leading-tight"
                  [class.text-accent]="theme.theme() === option.id"
                  [class.text-ink]="theme.theme() !== option.id"
                >
                  {{ option.label }}
                </span>
                <span
                  class="mt-1 block font-mono text-[0.625rem] tracking-[0.08em] text-ink-faint"
                >
                  {{ option.hint }}
                </span>
              </span>

              @if (theme.theme() === option.id) {
                <app-icon name="check" cls="h-3.5 w-3.5 shrink-0 text-accent" />
              }
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class ThemeMenuComponent {
  protected readonly theme = inject(ThemeService);
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly options = THEME_OPTIONS;
  protected readonly open = signal(false);

  protected pick(id: Theme): void {
    this.theme.set(id);
    this.open.set(false);
  }

  protected onDocumentClick(event: Event): void {
    if (!this.open()) return;
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}
