import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injectable,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NAV_LINKS, PROFILE, PROJECTS } from '../core/profile';
import { IconComponent, type IconName } from './icon.component';
import { THEME_OPTIONS, ThemeService } from './theme.service';
import { FONT_OPTIONS, TypographyService } from './typography.service';

/**
 * Shared open state, so the header button, the footer hint and the global
 * shortcut all drive one palette.
 */
@Injectable({ providedIn: 'root' })
export class PaletteService {
  readonly isOpen = signal(false);

  open(): void {
    this.isOpen.set(true);
  }
}

type Command = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  /** Extra words that should match, beyond the label and group. */
  keywords?: string;
  icon: IconName;
  /** Returns a short confirmation to flash before closing, if any. */
  run: () => string | void;
};

/**
 * ⌘K / Ctrl+K command palette — jump to any section, open a project, copy
 * the email address, grab the résumé, or change theme and typography
 * without leaving the keyboard.
 *
 * Built on the native <dialog>: showModal() supplies the top layer, the
 * backdrop, inert page content and Escape-to-close for free. The input is
 * an ARIA combobox driving a listbox through aria-activedescendant, so
 * focus never leaves the text field while the arrows move the selection.
 */
@Component({
  selector: 'app-command-palette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  host: { '(document:keydown)': 'onGlobalKey($event)' },
  template: `
    <dialog
      #dialog
      class="u-palette"
      aria-label="Command menu"
      (close)="palette.isOpen.set(false)"
      (click)="onDialogClick($event)"
    >
      <div class="overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-black/40">
        <div class="flex items-center gap-3 border-b border-line px-4">
          <app-icon name="search" cls="h-4 w-4 shrink-0 text-ink-faint" />
          <input
            #input
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-autocomplete="list"
            aria-label="Search commands"
            name="palette-query"
            [attr.aria-activedescendant]="activeId()"
            placeholder="Search sections, projects, actions…"
            autocomplete="off"
            spellcheck="false"
            class="u-bare h-14 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-faint sm:text-[0.95rem]"
            [value]="query()"
            (input)="onInput($event)"
            (keydown)="onInputKey($event)"
          />
          <kbd class="u-kbd hidden sm:inline-block">esc</kbd>
        </div>

        <div
          id="palette-list"
          role="listbox"
          aria-label="Commands"
          class="max-h-[min(60vh,26rem)] overflow-y-auto overscroll-contain p-2"
        >
          @for (group of groups(); track group.name) {
            <div role="group" [attr.aria-label]="group.name">
              <div
                aria-hidden="true"
                class="px-3 pt-3 pb-1.5 font-mono text-[0.625rem] tracking-[0.16em] text-ink-faint uppercase"
              >
                {{ group.name }}
              </div>
              @for (entry of group.items; track entry.cmd.id) {
                <div
                  role="option"
                  [id]="'palette-' + entry.cmd.id"
                  [attr.aria-selected]="entry.index === cursor()"
                  (click)="run(entry.cmd)"
                  (pointermove)="cursor.set(entry.index)"
                  class="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-[0.875rem] transition-colors"
                  [class.bg-raised]="entry.index === cursor()"
                  [class.text-ink]="entry.index === cursor()"
                  [class.text-ink-dim]="entry.index !== cursor()"
                >
                  <span class="shrink-0" [class.text-accent]="entry.index === cursor()">
                    <app-icon [name]="entry.cmd.icon" cls="h-4 w-4" />
                  </span>
                  <span class="min-w-0 flex-1 truncate">{{ entry.cmd.label }}</span>
                  @if (entry.cmd.hint) {
                    <span
                      class="hidden shrink-0 font-mono text-[0.625rem] tracking-[0.08em] text-ink-faint sm:inline"
                    >
                      {{ entry.cmd.hint }}
                    </span>
                  }
                </div>
              }
            </div>
          } @empty {
            <p class="px-3 py-10 text-center text-sm text-ink-faint">
              Nothing matches “{{ query() }}”.
            </p>
          }
        </div>

        <div
          class="flex items-center justify-between gap-4 border-t border-line px-4 py-2.5 font-mono text-[0.625rem] tracking-[0.06em] text-ink-faint"
        >
          <span class="hidden items-center gap-1.5 sm:flex">
            <kbd class="u-kbd">↑</kbd><kbd class="u-kbd">↓</kbd> move
            <kbd class="u-kbd ml-2">↵</kbd> select
          </span>
          <span role="status" aria-live="polite" class="ml-auto" [class.text-accent]="flash()">
            {{ flash() || 'vivekkumar.duckdns.org' }}
          </span>
        </div>
      </div>
    </dialog>
  `,
})
export class CommandPaletteComponent {
  protected readonly palette = inject(PaletteService);
  private readonly theme = inject(ThemeService);
  private readonly typography = inject(TypographyService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  protected readonly query = signal('');
  protected readonly cursor = signal(0);
  protected readonly flash = signal('');

  private readonly commands: Command[] = [
    ...NAV_LINKS.map((link) => ({
      id: `go-${link.href.slice(1)}`,
      group: 'Go to',
      label: link.label,
      icon: 'hash' as const,
      run: () => this.scrollTo(link.href),
    })),
    ...PROJECTS.map((p) => ({
      id: `project-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      group: 'Projects',
      label: p.name,
      hint: p.live ? 'live site' : 'source',
      keywords: `${p.blurb} ${p.tags.join(' ')}`,
      icon: (p.live ? 'monitor' : 'github') as IconName,
      run: () => this.openUrl(p.live ?? p.repo),
    })),
    {
      id: 'copy-email',
      group: 'Actions',
      label: 'Copy email address',
      hint: PROFILE.email,
      keywords: 'contact mail clipboard',
      icon: 'copy',
      run: () => this.copyEmail(),
    },
    {
      id: 'send-email',
      group: 'Actions',
      label: 'Send an email',
      keywords: 'contact mail gmail hire',
      icon: 'mail',
      run: () => this.openUrl(PROFILE.emailUrl),
    },
    {
      id: 'resume',
      group: 'Actions',
      label: 'Download résumé',
      hint: 'PDF',
      keywords: 'resume cv',
      icon: 'download',
      run: () => this.download(),
    },
    {
      id: 'github',
      group: 'Actions',
      label: 'GitHub profile',
      hint: `@${PROFILE.githubHandle}`,
      keywords: 'code repositories',
      icon: 'github',
      run: () => this.openUrl(PROFILE.github),
    },
    {
      id: 'linkedin',
      group: 'Actions',
      label: 'LinkedIn profile',
      icon: 'linkedin',
      run: () => this.openUrl(PROFILE.linkedin),
    },
    ...THEME_OPTIONS.map((t) => ({
      id: `theme-${t.id}`,
      group: 'Theme',
      label: t.label,
      hint: t.hint,
      keywords: `theme colour color palette ${t.id}`,
      icon: (t.id === 'light' || t.id === 'sand' ? 'sun' : 'moon') as IconName,
      // Deferred a frame so the dialog is gone and the reveal animates the page.
      run: () => {
        requestAnimationFrame(() => this.theme.set(t.id));
      },
    })),
    ...FONT_OPTIONS.map((f) => ({
      id: `font-${f.id}`,
      group: 'Typography',
      label: f.label,
      hint: f.family,
      keywords: `font typeface typography ${f.id}`,
      icon: 'type' as const,
      run: () => this.typography.set(f.id),
    })),
  ];

  /** Filtered commands, grouped, each tagged with its flat index for the cursor. */
  protected readonly groups = computed(() => {
    const words = this.query().toLowerCase().split(/\s+/).filter(Boolean);
    const matches = this.commands.filter((c) => {
      const hay = `${c.label} ${c.group} ${c.hint ?? ''} ${c.keywords ?? ''}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });

    const groups: { name: string; items: { cmd: Command; index: number }[] }[] = [];
    matches.forEach((cmd, index) => {
      let group = groups.find((g) => g.name === cmd.group);
      if (!group) groups.push((group = { name: cmd.group, items: [] }));
      group.items.push({ cmd, index });
    });
    return groups;
  });

  private readonly flat = computed(() => this.groups().flatMap((g) => g.items.map((i) => i.cmd)));

  protected readonly activeId = computed(() => {
    const cmd = this.flat()[this.cursor()];
    return cmd ? `palette-${cmd.id}` : null;
  });

  constructor() {
    effect(() => {
      if (!this.isBrowser) return;
      const dialog = this.dialog().nativeElement;
      if (this.palette.isOpen() && !dialog.open) {
        this.query.set('');
        this.cursor.set(0);
        this.flash.set('');
        dialog.showModal();
        this.input().nativeElement.focus();
      } else if (!this.palette.isOpen() && dialog.open) {
        dialog.close();
      }
    });
  }

  /** ⌘K / Ctrl+K toggles from anywhere; "/" opens unless the user is typing. */
  protected onGlobalKey(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.palette.isOpen.update((open) => !open);
      return;
    }
    if (event.key === '/' && !this.palette.isOpen() && !isTyping(event.target)) {
      event.preventDefault();
      this.palette.open();
    }
  }

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.cursor.set(0);
  }

  protected onInputKey(event: KeyboardEvent): void {
    const count = this.flat().length;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!count) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      this.cursor.set((this.cursor() + step + count) % count);
      const id = this.activeId();
      if (id) document.getElementById(id)?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const cmd = this.flat()[this.cursor()];
      if (cmd) this.run(cmd);
    }
  }

  /** A click on the dialog box itself, outside the panel, is a backdrop click. */
  protected onDialogClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.palette.isOpen.set(false);
  }

  protected run(cmd: Command): void {
    const message = cmd.run();
    if (message) {
      this.flash.set(message);
      setTimeout(() => this.palette.isOpen.set(false), 750);
    } else {
      this.palette.isOpen.set(false);
    }
  }

  private scrollTo(selector: string): void {
    // Next frame, once the modal has released the page.
    requestAnimationFrame(() => document.querySelector(selector)?.scrollIntoView());
  }

  private openUrl(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  private download(): void {
    const a = document.createElement('a');
    a.href = PROFILE.resumePath;
    a.download = '';
    a.click();
  }

  private copyEmail(): string {
    navigator.clipboard?.writeText(PROFILE.email).catch(() => {});
    return 'Email copied ✓';
  }
}

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
}
