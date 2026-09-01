import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ABOUT, PROFILE, experienceYearsWord } from '../core/profile';
import { SectionComponent } from '../shared/section.component';
import { RevealDirective } from '../shared/reveal.directive';
import { RichTextComponent } from '../shared/rich-text.component';
import { IconComponent } from '../shared/icon.component';
import { CountUpDirective } from '../shared/count-up.directive';

/**
 * Narrative introduction plus a small block of defensible stats.
 * Every figure here comes from ABOUT.stats in the content file.
 */
@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SectionComponent,
    RevealDirective,
    RichTextComponent,
    IconComponent,
    CountUpDirective,
  ],
  template: `
    <app-section
      sectionId="about"
      index="01"
      eyebrow="Who I am"
      heading="About"
      [lead]="lead"
    >
      <div class="grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
        <!-- Narrative -->
        <div class="space-y-5">
          @for (para of paragraphs; track $index) {
            <p
              appReveal
              [i]="$index"
              class="text-[1.0125rem] leading-[1.75] text-ink-dim"
            >
              <app-rich [text]="para" />
            </p>
          }

          <div appReveal [i]="paragraphs.length" class="pt-3">
            <a
              [href]="'mailto:' + profile.email"
              class="group -mx-2 inline-flex min-h-11 items-center gap-2 px-2 font-mono text-[0.8125rem] text-accent"
            >
              <span class="u-link-underline">{{ profile.availability }}</span>
              <app-icon
                name="arrow-up-right"
                cls="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </div>
        </div>

        <!-- Stats -->
        <div appReveal [i]="2" class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line self-start">
          @for (stat of stats; track stat.label) {
            <div class="bg-surface px-5 py-7">
              <p class="u-display text-4xl text-accent" [appCountUp]="stat.value">
                {{ stat.value }}
              </p>
              <p class="mt-2 font-mono text-[0.6875rem] leading-4 tracking-[0.1em] text-ink-faint uppercase">
                {{ stat.label }}
              </p>
            </div>
          }
        </div>
      </div>
    </app-section>
  `,
})
export class AboutComponent {
  protected readonly profile = PROFILE;
  protected readonly paragraphs = ABOUT.paragraphs;
  protected readonly stats = ABOUT.stats;

  protected readonly lead = (() => {
    const years = experienceYearsWord();
    return `${years[0].toUpperCase()}${years.slice(1)} years of backend work in enterprise telecom, and a standing interest in the parts of a system that decide whether it survives contact with production.`;
  })();
}
