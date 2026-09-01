import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'github'
  | 'linkedin'
  | 'mail'
  | 'pin'
  | 'download'
  | 'arrow-up-right'
  | 'arrow-down'
  | 'sun'
  | 'moon'
  | 'menu'
  | 'close'
  | 'copy'
  | 'check'
  | 'chevron-right'
  | 'award';

/**
 * Inline SVG icon set. Stroke icons inherit `currentColor`, so colour comes
 * from the surrounding text utility. Always decorative — every icon is
 * aria-hidden and must sit next to a real text label.
 *
 *   <app-icon name="github" class="h-4 w-4" />
 */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    @switch (name()) {
      @case ('github') {
        <svg viewBox="0 0 24 24" fill="currentColor" [class]="cls()">
          <path
            d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.2.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z"
          />
        </svg>
      }
      @case ('linkedin') {
        <svg viewBox="0 0 24 24" fill="currentColor" [class]="cls()">
          <path
            d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z"
          />
        </svg>
      }
      @case ('mail') {
        <svg viewBox="0 0 24 24" [class]="cls()" [attr.style]="strokeStyle">
          <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
          <path d="m3 7 8.2 5.6a1.5 1.5 0 0 0 1.6 0L21 7" />
        </svg>
      }
      @case ('pin') {
        <svg viewBox="0 0 24 24" [class]="cls()" [attr.style]="strokeStyle">
          <path d="M20 10.5c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10.5" r="2.8" />
        </svg>
      }
      @case ('download') {
        <svg viewBox="0 0 24 24" [class]="cls()" [attr.style]="strokeStyle">
          <path d="M12 3v12" />
          <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
          <path d="M4 20h16" />
        </svg>
      }
      @case ('arrow-up-right') {
        <svg viewBox="0 0 24 24" [class]="cls()" [attr.style]="strokeStyle">
          <path d="M7 17 17 7" />
          <path d="M8 7h9v9" />
        </svg>
      }
      @case ('arrow-down') {
        <svg viewBox="0 0 24 24" [class]="cls()" [attr.style]="strokeStyle">
          <path d="M12 4v15" />
          <path d="m6 13.5 6 6 6-6" />
        </svg>
      }
      @case ('sun') {
        <svg viewBox="0 0 24 24" [class]="cls()" [attr.style]="strokeStyle">
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"
          />
        </svg>
      }
      @case ('moon') {
        <svg viewBox="0 0 24 24" [class]="cls()" [attr.style]="strokeStyle">
          <path d="M21 13.2A8.6 8.6 0 1 1 10.8 3a6.9 6.9 0 0 0 10.2 10.2Z" />
        </svg>
      }
      @case ('menu') {
        <svg viewBox="0 0 24 24" [class]="cls()" [attr.style]="strokeStyle">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      }
      @case ('close') {
        <svg viewBox="0 0 24 24" [class]="cls()" [attr.style]="strokeStyle">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      }
      @case ('copy') {
        <svg viewBox="0 0 24 24" [class]="cls()" [attr.style]="strokeStyle">
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" />
        </svg>
      }
      @case ('check') {
        <svg viewBox="0 0 24 24" [class]="cls()" [attr.style]="strokeStyle">
          <path d="m5 12.5 4.5 4.5L19 7" />
        </svg>
      }
      @case ('chevron-right') {
        <svg viewBox="0 0 24 24" [class]="cls()" [attr.style]="strokeStyle">
          <path d="m9 5 7 7-7 7" />
        </svg>
      }
      @case ('award') {
        <svg viewBox="0 0 24 24" [class]="cls()" [attr.style]="strokeStyle">
          <circle cx="12" cy="9" r="5.5" />
          <path d="m8.6 13.6-1.3 7.2 4.7-2.6 4.7 2.6-1.3-7.2" />
        </svg>
      }
    }
  `,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  /** Tailwind sizing/colour classes applied to the <svg>. */
  readonly cls = input<string>('h-4 w-4');

  protected readonly strokeStyle =
    'fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round';
}
