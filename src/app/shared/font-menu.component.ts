import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { FONT_OPTIONS, TypographyService } from './typography.service';
import { IconComponent } from './icon.component';

/**
 * Typography selector for the header: an "Aa" button opening a small menu
 * of the three font styles, each previewed in its own face. Sits next to
 * the theme toggle and shares its visual language.
 *
 * The menu closes on outside click, on Escape, and on selection. Options
 * are menuitemradio so a screen reader announces which style is active.
 */
@Component({
  selector: 'app-font-menu',
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
        class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-[0.8125rem] text-ink-dim transition-colors hover:border-accent hover:text-accent md:h-9 md:w-9"
        [class.border-accent]="open()"
        [class.text-accent]="open()"
        aria-haspopup="menu"
        [attr.aria-expanded]="open()"
        aria-label="Choose typography style"
      >
        Aa
      </button>

      @if (open()) {
        <div
          role="menu"
          aria-label="Typography style"
          class="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-line bg-surface p-1.5 shadow-xl shadow-black/25"
        >
          <p
            class="px-3 pt-2 pb-1 font-mono text-[0.625rem] tracking-[0.16em] text-ink-faint uppercase"
          >
            Typography
          </p>

          @for (option of options; track option.id) {
            <button
              type="button"
              role="menuitemradio"
              [attr.aria-checked]="typography.font() === option.id"
              (click)="pick(option.id)"
              class="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-raised"
            >
              <span class="min-w-0">
                <span
                  class="block text-[0.875rem] leading-tight"
                  [style.font-family]="option.stack"
                  [class.text-accent]="typography.font() === option.id"
                  [class.text-ink]="typography.font() !== option.id"
                >
                  {{ option.label }}
                </span>
                <span
                  class="mt-1 block font-mono text-[0.625rem] tracking-[0.08em] text-ink-faint"
                >
                  {{ option.family }}
                </span>
              </span>

              @if (typography.font() === option.id) {
                <app-icon name="check" cls="h-3.5 w-3.5 shrink-0 text-accent" />
              }
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class FontMenuComponent {
  protected readonly typography = inject(TypographyService);
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly options = FONT_OPTIONS;
  protected readonly open = signal(false);

  protected pick(id: (typeof FONT_OPTIONS)[number]['id']): void {
    this.typography.set(id);
    this.open.set(false);
  }

  protected onDocumentClick(event: Event): void {
    if (!this.open()) return;
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}
