import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ABOUT, EXPERIENCE, PROFILE, experienceYearsWord } from '../core/profile';
import { SectionComponent } from '../shared/section.component';
import { RevealDirective } from '../shared/reveal.directive';
import { RichTextComponent } from '../shared/rich-text.component';
import { IconComponent, type IconName } from '../shared/icon.component';
import { CountUpDirective } from '../shared/count-up.directive';

/** Presentation for each of ABOUT.stats, in the same order. */
const STAT_STYLE: { icon: IconName; tone: string; note: string }[] = [
  { icon: 'briefcase', tone: 'var(--t-blue)', note: 'since September 2022' },
  { icon: 'layers', tone: 'var(--t-violet)', note: 'REST APIs owned at Netcracker' },
  { icon: 'graduation', tone: 'var(--t-teal)', note: 'B.E. CSE, First Class with Distinction' },
  { icon: 'award', tone: 'var(--t-amber)', note: 'Netcracker Technology, 2025' },
];

/**
 * Introduction: stat tiles first (the at-a-glance numbers, each from
 * ABOUT.stats), then the narrative beside a compact "currently" card.
 */
@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionComponent, RevealDirective, RichTextComponent, IconComponent, CountUpDirective],
  template: `
    <app-section sectionId="about" index="01" eyebrow="Who I am" heading="About" [lead]="lead">
      <!-- Stat tiles -->
      <ul class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        @for (stat of stats; track stat.label; let i = $index) {
          <li appReveal [i]="i" class="u-card u-lift overflow-hidden p-4 sm:p-5">
            <span class="u-chip-ico absolute top-4 right-4" [style.--tone]="style[i].tone">
              <app-icon [name]="style[i].icon" cls="h-[1.15rem] w-[1.15rem]" />
            </span>
            <p class="pr-12 text-[0.8rem] text-ink-dim">{{ stat.label }}</p>
            <p class="u-num mt-1.5 text-[2.1rem] leading-tight text-ink" [appCountUp]="stat.value">
              {{ stat.value }}
            </p>
            <p class="mt-1 truncate text-[0.75rem] text-ink-faint">{{ style[i].note }}</p>
          </li>
        }
      </ul>

      <div class="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <!-- Narrative -->
        <div appReveal class="u-card p-6 md:p-8">
          <div class="space-y-4">
            @for (para of paragraphs; track $index) {
              <p class="text-[1rem] leading-[1.75] text-ink-dim">
                <app-rich [text]="para" />
              </p>
            }
          </div>
        </div>

        <!-- Currently -->
        <aside appReveal [i]="1" class="u-card flex flex-col p-6 md:p-7">
          <p class="u-eyebrow">Currently</p>
          <dl class="mt-4 space-y-3.5 text-[0.9rem]">
            @for (row of now; track row.k) {
              <div class="flex items-start gap-3">
                <span class="u-chip-ico h-8 w-8 rounded-[0.6rem]" [style.--tone]="row.tone">
                  <app-icon [name]="row.icon" cls="h-4 w-4" />
                </span>
                <div class="min-w-0">
                  <dt class="text-[0.75rem] text-ink-faint">{{ row.k }}</dt>
                  <dd class="font-medium text-ink">{{ row.v }}</dd>
                </div>
              </div>
            }
          </dl>

          <a
            [href]="profile.emailUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="u-btn u-btn-accent mt-6 self-start whitespace-normal"
          >
            <span class="u-live"></span>
            {{ profile.availability }}
          </a>
        </aside>
      </div>
    </app-section>
  `,
})
export class AboutComponent {
  protected readonly profile = PROFILE;
  protected readonly paragraphs = ABOUT.paragraphs;
  protected readonly stats = ABOUT.stats;
  protected readonly style = STAT_STYLE;

  protected readonly now: { k: string; v: string; icon: IconName; tone: string }[] = [
    {
      k: 'Role',
      v: `${EXPERIENCE[0].title}, ${EXPERIENCE[0].company}`,
      icon: 'briefcase',
      tone: 'var(--t-blue)',
    },
    { k: 'Based in', v: PROFILE.location, icon: 'pin', tone: 'var(--t-pink)' },
    { k: 'Focus', v: 'Backend and distributed systems', icon: 'server', tone: 'var(--t-violet)' },
    { k: 'Stack', v: PROFILE.subtitle, icon: 'code', tone: 'var(--t-teal)' },
  ];

  protected readonly lead = (() => {
    const years = experienceYearsWord();
    return `${years[0].toUpperCase()}${years.slice(1)} years of backend work in enterprise telecom, and a standing interest in the parts of a system that decide whether it survives contact with production.`;
  })();
}
