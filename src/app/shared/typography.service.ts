import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type FontStyle =
  | 'sans'
  | 'grotesk'
  | 'mono'
  | 'serif'
  | 'rounded'
  | 'script';

const STORAGE_KEY = 'vk-font';

const STYLES: ReadonlyArray<FontStyle> = [
  'sans',
  'grotesk',
  'mono',
  'serif',
  'rounded',
  'script',
];

/**
 * The typography styles offered by the header control. Inter, JetBrains
 * Mono and Fraunces were already loaded for the base design; Space Grotesk
 * and Nunito are the only additions to the font request in index.html.
 * Each style also restyles the display face (see styles.css), so switching
 * changes the whole personality of the page, not just the body copy.
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
    family: 'Inter + Fraunces',
    stack: '"Inter", ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: 'grotesk',
    label: 'Geometric Grotesk',
    family: 'Space Grotesk',
    stack: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
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
  {
    id: 'rounded',
    label: 'Soft Rounded',
    family: 'Nunito',
    stack: '"Nunito", ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: 'script',
    label: 'Handwritten',
    family: 'Caveat + Nunito',
    stack: '"Caveat", "Segoe Script", cursive',
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
    if (STYLES.includes(fromDom as FontStyle)) return fromDom as FontStyle;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (STYLES.includes(stored as FontStyle)) return stored as FontStyle;
    } catch {
      /* ignore */
    }

    return 'sans';
  }
}
