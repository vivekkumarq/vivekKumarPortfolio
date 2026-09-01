import {
  Directive,
  ElementRef,
  afterNextRender,
  inject,
  input,
  DestroyRef,
} from '@angular/core';

/**
 * Counts a stat up from zero when it scrolls into view.
 *
 * Takes the final display string ("3+", "8.5", "26.7k") and animates only
 * the numeric part, keeping any prefix/suffix — so "8.5" ticks through one
 * decimal place and "3+" keeps its plus throughout.
 *
 * The template keeps the final value as static text: that is what the
 * prerendered HTML ships (crawlers and no-JS visitors see real numbers,
 * never a zero), and it is also the value left in place under
 * prefers-reduced-motion, where no animation runs at all.
 *
 * Usage:  <p [appCountUp]="stat.value">{{ stat.value }}</p>
 */
@Directive({ selector: '[appCountUp]' })
export class CountUpDirective {
  /** Final rendered value, e.g. "3+" or "8.5". */
  readonly appCountUp = input.required<string>();

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const el = this.host.nativeElement as HTMLElement;
      const raw = this.appCountUp();

      const match = /^([^0-9]*)(\d+(?:\.\d+)?)(.*)$/.exec(raw);
      if (!match) return; // nothing numeric to animate — leave the text be

      const prefix = match[1];
      const target = parseFloat(match[2]);
      const suffix = match[3];
      const decimals = match[2].includes('.')
        ? match[2].split('.')[1].length
        : 0;

      if (
        window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        typeof IntersectionObserver === 'undefined'
      ) {
        return; // final value is already in the DOM
      }

      const render = (value: number): void => {
        el.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
      };
      render(0);

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            observer.unobserve(el);

            const started = performance.now();
            const duration = 1400;
            const tick = (now: number): void => {
              const t = Math.min((now - started) / duration, 1);
              const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
              render(target * eased);
              if (t < 1) {
                requestAnimationFrame(tick);
              } else {
                el.textContent = raw; // land on the exact original string
              }
            };
            requestAnimationFrame(tick);
          }
        },
        { threshold: 0.4 },
      );

      observer.observe(el);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
