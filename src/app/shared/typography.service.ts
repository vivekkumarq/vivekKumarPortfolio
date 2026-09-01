import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type FontStyle = 'sans' | 'mono' | 'serif';

const STORAGE_KEY = 'vk-font';

/**
 * The three typography styles offered by the header control. Every option
 * maps onto a family that index.html already loads for another purpose
 * (Inter for body, JetBrains Mono for code, Fraunces for display), so
 * switching styles never costs an extra font download.
 *
 * `stack` is used by the menu to preview each option in its own face.
 */
export const FONT_OPTIONS: ReadonlyArray<{
  id: FontStyle;
  label: string;
  family: string;
  stack: string;
}> = [
  {
    id: 'sans',
    label: 'Modern Sans',
    family: 'Inter',
    stack: '"Inter", ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: 'mono',
    label: 'Developer Mono',
    family: 'JetBrains Mono',
    stack: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  {
    id: 'serif',
    label: 'Editorial Serif',
    family: 'Fraunces',
    stack: '"Fraunces", Georgia, "Times New Roman", serif',
  },
];

/**
 * Owns the typography preference, mirroring ThemeService exactly: the
 * *initial* style is applied by the inline script in index.html before
 * first paint (so a stored "mono" preference never flashes Inter), and
 * this service only reads what that script decided and handles toggles.
 *
 * The style itself is pure CSS — a `data-font` attribute on <html> remaps
 * the font custom properties in styles.css, so the whole page reflows
 * instantly with no component involvement.
 */
@Injectable({ providedIn: 'root' })
export class TypographyService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _font = signal<FontStyle>(this.readInitial());
  readonly font = this._font.asReadonly();

  set(font: FontStyle): void {
    this._font.set(font);
    if (!this.isBrowser) return;

    document.documentElement.setAttribute('data-font', font);
    try {
      localStorage.setItem(STORAGE_KEY, font);
    } catch {
      // Storage can be unavailable (private mode, blocked cookies).
      // The style still applies for this page view.
    }
  }

  private readInitial(): FontStyle {
    if (!this.isBrowser) return 'sans';

    const fromDom = document.documentElement.getAttribute('data-font');
    if (fromDom === 'sans' || fromDom === 'mono' || fromDom === 'serif') {
      return fromDom;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'sans' || stored === 'mono' || stored === 'serif') {
        return stored;
      }
    } catch {
      /* ignore */
    }

    return 'sans';
  }
}
