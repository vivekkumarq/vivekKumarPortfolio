import {
  Directive,
  ElementRef,
  afterNextRender,
  inject,
  input,
  DestroyRef,
} from '@angular/core';

/**
 * Scroll-triggered fade + rise.
 *
 * Adds `u-reveal` immediately (so the element starts hidden) and `is-in`
 * once it enters the viewport. All the motion lives in styles.css, which
 * also neutralises it under prefers-reduced-motion.
 *
 * SSR-safe: `afterNextRender` only ever runs in the browser, so the
 * prerendered HTML ships with the content present and un-animated.
 *
 * Usage:  <div appReveal>            → no delay
 *         <div appReveal [i]="2">    → staggered by 2 × 70ms
 */
@Directive({
  selector: '[appReveal]',
  host: { class: 'u-reveal' },
})
export class RevealDirective {
  /** Stagger index — multiplied by 70ms. */
  readonly i = input(0);
  /** Extra delay in milliseconds, added on top of the stagger. */
  readonly delay = input(0);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const el = this.host.nativeElement as HTMLElement;
      el.style.setProperty('--reveal-delay', `${this.delay() + this.i() * 70}ms`);

      // No IntersectionObserver (very old browser): show it and move on.
      if (typeof IntersectionObserver === 'undefined') {
        el.classList.add('is-in');
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              el.classList.add('is-in');
              observer.unobserve(el);
            }
          }
        },
        { rootMargin: '0px 0px -60px 0px', threshold: 0.05 },
      );

      observer.observe(el);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
