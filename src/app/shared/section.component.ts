import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RevealDirective } from './reveal.directive';

/**
 * Standard section shell: numbered mono eyebrow, serif display title,
 * optional lead paragraph, then projected content. Every section uses this
 * so the vertical rhythm stays identical top to bottom.
 *
 *   <app-section id="projects" index="03" eyebrow="…" title="Projects" [lead]="…">
 *     …content…
 *   </app-section>
 */
@Component({
  selector: 'app-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section
      [id]="sectionId()"
      class="relative scroll-mt-20 border-t border-line-soft py-16 sm:py-20 md:py-28"
    >
      <div class="u-shell">
        <div appReveal class="mb-3 flex items-center gap-3">
          <span class="font-mono text-[0.6875rem] tracking-[0.18em] text-ink-faint">
            {{ index() }}
          </span>
          <span class="u-draw-rule h-px w-6 bg-line"></span>
          <span class="u-eyebrow">{{ eyebrow() }}</span>
        </div>

        <!-- The inner span does the masked rise. The clip cannot sit on the
             h2 itself: IntersectionObserver measures the clipped box, and a
             heading clipped to nothing never counts as in view. -->
        <h2 appReveal [i]="1" class="u-rise u-display text-[2rem] text-ink sm:text-4xl md:text-5xl">
          <span>{{ heading() }}</span>
        </h2>

        @if (lead()) {
          <p
            appReveal
            [i]="2"
            class="mt-4 max-w-2xl text-[0.975rem] leading-relaxed text-ink-dim"
          >
            {{ lead() }}
          </p>
        }

        <div class="mt-10 md:mt-12">
          <ng-content />
        </div>
      </div>
    </section>
  `,
})
export class SectionComponent {
  /** Anchor target, e.g. "projects". */
  readonly sectionId = input.required<string>();
  /** Two-digit ordinal shown before the eyebrow, e.g. "03". */
  readonly index = input.required<string>();
  readonly eyebrow = input.required<string>();
  readonly heading = input.required<string>();
  readonly lead = input<string>('');
}
