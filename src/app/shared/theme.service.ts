import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * `dark` and `light` keep their original names so preferences stored by
 * earlier visitors still resolve, and so the existing `[data-theme="light"]`
 * palette in styles.css needs no rewrite. The rest are additive.
 */
export type Theme = 'dark' | 'light' | 'ocean' | 'ember' | 'violet' | 'sand';

const STORAGE_KEY = 'vk-theme';

export const THEMES: ReadonlyArray<Theme> = [
  'dark',
  'light',
  'ocean',
  'ember',
  'violet',
  'sand',
];

/**
 * Menu entries. `accent` and `canvas` are the real palette values, so the
 * swatch in the menu previews the theme rather than approximating it.
 */
export const THEME_OPTIONS: ReadonlyArray<{
  id: Theme;
  label: string;
  hint: string;
  accent: string;
  canvas: string;
}> = [
  { id: 'dark', label: 'Midnight', hint: 'Default dark', accent: '#5ec8ad', canvas: '#0a0c0e' },
  { id: 'light', label: 'Daylight', hint: 'Default light', accent: '#16806a', canvas: '#faf9f7' },
  { id: 'ocean', label: 'Ocean', hint: 'Deep blue', accent: '#4cc4f0', canvas: '#080d14' },
  { id: 'ember', label: 'Ember', hint: 'Warm dark', accent: '#f0a35e', canvas: '#100c0a' },
  { id: 'violet', label: 'Violet', hint: 'Cool dark', accent: '#a78bfa', canvas: '#0b0a11' },
  { id: 'sand', label: 'Sand', hint: 'Warm light', accent: '#9a5b2c', canvas: '#f7f3ec' },
];

/** Themes that paint on a light ground — decides the header icon. */
const LIGHT_THEMES: ReadonlySet<Theme> = new Set<Theme>(['light', 'sand']);

/**
 * Owns the colour-theme preference.
 *
 * The *initial* theme is applied by an inline script in index.html before
 * first paint — this service only reads what that script decided and handles
 * subsequent changes, so there is never a flash of the wrong theme.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _theme = signal<Theme>(this.readInitial());
  readonly theme = this._theme.asReadonly();

  /** Whether the active theme paints on a light ground. */
  isLight(): boolean {
    return LIGHT_THEMES.has(this._theme());
  }

  set(theme: Theme): void {
    this._theme.set(theme);
    if (!this.isBrowser) return;

    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable (private mode, blocked cookies).
      // The theme still applies for this page view.
    }
  }

  private readInitial(): Theme {
    if (!this.isBrowser) return 'dark';

    const fromDom = document.documentElement.getAttribute('data-theme');
    if (THEMES.includes(fromDom as Theme)) return fromDom as Theme;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (THEMES.includes(stored as Theme)) return stored as Theme;
    } catch {
      /* ignore */
    }

    return window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
  }
}
