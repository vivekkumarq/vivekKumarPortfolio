import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  AWARDS,
  CERTIFICATIONS,
  OPEN_SOURCE,
  PROFILE,
  PROJECTS,
  experienceLabel,
} from '../core/profile';
import { IconComponent } from '../shared/icon.component';
import { TechIconComponent } from '../shared/tech-icon.component';
import { CountUpDirective } from '../shared/count-up.directive';
import { BACKGROUNDS, BackgroundService, startBackground } from '../shared/hero-backgrounds';

/**
 * One odometer digit. The strip holds 0…max plus a second 0, so a 9 → 0
 * (or 5 → 0) step keeps rolling forward onto the extra 0 and then snaps
 * back to the first one with no transition.
 */
@Component({
  selector: 'app-roll-digit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="u-roll">
      <span
        class="u-roll-strip"
        [class.is-moving]="moving()"
        [style.transform]="'translateY(' + (-pos() * 100) / (max() + 2) + '%)'"
      >
        @for (d of digits(); track $index) {
          <span>{{ d }}</span>
        }
      </span>
    </span>
  `,
})
export class RollDigitComponent {
  readonly value = input.required<number>();
  readonly max = input(9);

  protected readonly digits = computed(() =>
    Array.from({ length: this.max() + 2 }, (_, i) => i % (this.max() + 1)),
  );
  protected readonly pos = signal(0);
  protected readonly moving = signal(false);

  private prev = -1;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    effect(() => {
      const v = this.value();
      const max = this.max();
      untracked(() => this.step(v, max));
    });
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  private step(v: number, max: number): void {
    if (this.prev === -1) {
      this.pos.set(v);
    } else if (v !== this.prev) {
      clearTimeout(this.timer);
      this.moving.set(true);
      if (v === 0 && this.prev === max) {
        this.pos.set(max + 1);
        this.timer = setTimeout(() => {
          this.moving.set(false);
          this.pos.set(0);
        }, 650);
      } else {
        this.pos.set(v);
      }
    }
    this.prev = v;
  }
}

type Tone = 'teal' | 'violet' | 'pink' | 'amber' | 'green' | 'blue';
type Highlight = { label: string; value: string; tone: Tone; href: string; external: boolean };

const IST_OFFSET_MIN = 330;

/**
 * Opening screen, always dark whatever the theme: an animated network of
 * service nodes with events travelling between them, aurora light, the
 * headline, count-up stats, a glass status card with a live Bengaluru clock,
 * and a ticker of real highlights along the foot.
 *
 * Everything above the ticker enters through the pure-CSS u-enter / u-mask
 * sequence, so the hero paints from the prerendered HTML without waiting for
 * JavaScript. The canvas and the clock start after hydration.
 */
@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TechIconComponent, CountUpDirective, RollDigitComponent],
  template: `
    <section id="top" class="u-hero flex min-h-[min(880px,100svh)] flex-col">
      <canvas
        #net
        class="pointer-events-none absolute inset-0 -z-[2] h-full w-full transition-opacity duration-300"
        aria-hidden="true"
      ></canvas>
      <div class="u-hero-grid" aria-hidden="true"></div>
      <div class="u-hero-tint" aria-hidden="true"></div>

      <div class="u-shell flex flex-1 flex-col pt-24 sm:pt-28">
        <div
          class="grid flex-1 items-center gap-12 pb-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-14"
        >
          <!-- Left: statement -->
          <div class="min-w-0">
            <span
              class="u-enter u-glass inline-flex max-w-full items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.78rem] font-medium text-white/90"
            >
              <span class="u-live"></span>
              <span class="truncate">{{ profile.availability }}</span>
            </span>

            <h1
              class="u-mask u-display mt-6 text-[clamp(2.6rem,6.6vw,5.1rem)] leading-[1.02] text-balance"
              style="--d: 120ms"
            >
              <span class="block">{{ profile.name }}</span>
              <span class="u-grad block pb-[0.1em]">builds systems that stay&nbsp;up.</span>
            </h1>

            <p
              class="u-enter mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-white/78"
              style="--d: 420ms"
            >
              {{ profile.role }} at <b class="font-semibold text-white">{{ profile.company }}</b>.
              Java and Spring Boot microservices, Kafka event pipelines, and GraphQL and REST APIs on
              Kubernetes, inside enterprise telecom platforms.
            </p>

            <div class="u-enter mt-8 flex flex-wrap items-center gap-3" style="--d: 520ms">
              <a
                [href]="profile.emailUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="u-btn u-btn-light"
              >
                <app-icon name="mail" cls="h-4 w-4" />
                Get in touch
              </a>
              <a [href]="profile.resumePath" download class="u-btn u-btn-glass">
                <app-icon name="download" cls="h-4 w-4" />
                Résumé
              </a>
              <a
                [href]="profile.github"
                target="_blank"
                rel="noopener noreferrer"
                class="u-btn u-btn-glass w-11 px-0"
                aria-label="GitHub profile"
              >
                <app-icon name="github" cls="h-4 w-4" />
              </a>
              <a
                [href]="profile.linkedin"
                target="_blank"
                rel="noopener noreferrer"
                class="u-btn u-btn-glass w-11 px-0"
                aria-label="LinkedIn profile"
              >
                <app-icon name="linkedin" cls="h-4 w-4" />
              </a>
            </div>

            <ul
              class="u-enter mt-11 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-6 sm:flex sm:flex-wrap sm:gap-x-10"
              style="--d: 640ms"
            >
              @for (stat of stats; track stat.label) {
                <li>
                  <p class="u-num text-[1.95rem] leading-none text-white" [appCountUp]="stat.value">
                    {{ stat.value }}
                  </p>
                  <p class="mt-2 text-[0.78rem] text-white/62">{{ stat.label }}</p>
                </li>
              }
            </ul>
          </div>

          <!-- Right: status card -->
          <aside
            class="u-enter u-enter-card u-glass u-conic relative rounded-[1.75rem] p-5 text-white sm:p-6"
            style="--d: 300ms"
            aria-label="Availability and local time"
          >
            <div class="flex items-center gap-3">
              <span
                class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-teal-300 via-sky-300 to-violet-400 text-[0.95rem] font-extrabold text-[#0b1020]"
                aria-hidden="true"
              >
                {{ profile.initials }}
              </span>
              <div class="min-w-0">
                <p class="truncate font-semibold">{{ profile.name }}</p>
                <p class="truncate text-[0.78rem] text-white/62">{{ profile.company }}</p>
              </div>
              <span
                class="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[0.7rem] font-semibold text-emerald-300"
              >
                <span class="u-live h-1.5 w-1.5"></span>
                Available
              </span>
            </div>

            <div class="mt-6 text-center">
              <p class="text-[0.68rem] font-semibold tracking-[0.16em] text-white/55 uppercase">
                Local time in Bengaluru
              </p>

              <div
                class="u-num mt-3 flex h-[4.25rem] items-end justify-center text-[4.25rem] leading-none"
                aria-hidden="true"
              >
                @if (clock(); as c) {
                  <app-roll-digit [value]="c.h1" [max]="1" />
                  <app-roll-digit [value]="c.h2" />
                  <span class="u-blink w-[0.32em] self-center pb-[0.12em] text-center">:</span>
                  <app-roll-digit [value]="c.m1" [max]="5" />
                  <app-roll-digit [value]="c.m2" />
                  <span class="mb-[0.1em] ml-1.5 flex flex-col items-start gap-1">
                    <span class="font-sans text-[0.75rem] font-bold tracking-[0.12em] text-white/60">
                      {{ c.ampm }}
                    </span>
                    <span class="flex text-[1.6rem] text-teal-300">
                      <app-roll-digit [value]="c.s1" [max]="5" />
                      <app-roll-digit [value]="c.s2" />
                    </span>
                  </span>
                } @else {
                  <span class="text-white/40">--:--</span>
                }
              </div>
              <p class="sr-only">{{ clockText() }}</p>

              <div class="mx-auto mt-5 h-1 w-4/5 overflow-hidden rounded-full bg-white/12">
                <i
                  class="block h-full origin-left rounded-full bg-linear-to-r from-teal-300 to-violet-400 transition-transform duration-1000 ease-linear"
                  [style.transform]="'scaleX(' + (clock()?.frac ?? 0) + ')'"
                ></i>
              </div>

              <p class="mt-4 min-h-[1.35rem] text-[0.9rem] font-semibold">{{ dateText() }}</p>
              <p class="text-[0.75rem] text-white/58">India Standard Time · UTC+5:30</p>
            </div>

            <div class="mt-5 border-t border-white/12 pt-4">
              <div class="flex items-center justify-between gap-3 text-[0.8rem] text-white/72">
                <span class="inline-flex items-center gap-2">
                  <app-icon name="clock" cls="h-3.5 w-3.5" />
                  Your time
                </span>
                <b class="u-num text-[0.95rem] text-white">{{ visitorTime() || '—' }}</b>
              </div>
              <p class="mt-1 min-h-[1.1rem] text-right text-[0.72rem] text-white/55">
                {{ offsetText() }}
              </p>
            </div>

            <ul class="mt-4 flex flex-wrap gap-1.5" aria-label="Core stack">
              @for (item of stack; track item) {
                <li
                  class="inline-flex items-center gap-1.5 rounded-full border border-white/14 bg-white/6 px-2.5 py-1 text-[0.7rem] font-medium text-white/85"
                >
                  <app-tech-icon [name]="item" cls="h-3 w-3" />
                  {{ item }}
                </li>
              }
            </ul>
          </aside>
        </div>

        <!-- Background switcher: the caption steps to the next scene; one dot
             per scene picks it directly. -->
        <div
          class="u-enter flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pb-4"
          style="--d: 900ms"
        >
          <button
            type="button"
            (click)="bg.step(1)"
            class="u-glass inline-flex min-h-9 max-w-full items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.78rem] text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            [attr.aria-label]="'Background: ' + current().label + '. Show the next one'"
          >
            <app-icon name="sparkles" cls="h-3.5 w-3.5 text-teal-300" />
            <b class="font-semibold text-white">{{ current().label }}</b>
            <span class="hidden truncate text-white/60 sm:inline">· {{ current().hint }}</span>
            <app-icon name="chevron-right" cls="h-3.5 w-3.5" />
          </button>

          <div role="group" aria-label="Choose a background" class="flex flex-wrap">
            @for (b of backgrounds; track b.id) {
              <button
                type="button"
                class="u-bgdot"
                [attr.aria-pressed]="bg.kind() === b.id"
                [attr.aria-label]="b.label"
                [title]="b.label"
                (click)="bg.set(b.id)"
              ></button>
            }
          </div>
        </div>
      </div>

      <!-- Highlights ticker. The list is rendered twice for a seamless loop;
           the copy is hidden from assistive tech and the tab order. -->
      <div
        class="u-enter u-ticker border-t border-white/10 bg-[#050712]/60 backdrop-blur-md"
        style="--d: 820ms"
        aria-label="Highlights"
      >
        <div class="u-ticker-track">
          @for (copy of [0, 1]; track copy) {
            <ul class="flex shrink-0" [attr.aria-hidden]="copy === 1 ? 'true' : null">
              @for (h of highlights; track h.label + h.value) {
                <li>
                  <a
                    [href]="h.href"
                    [attr.target]="h.external ? '_blank' : null"
                    [attr.rel]="h.external ? 'noopener noreferrer' : null"
                    [attr.tabindex]="copy === 1 ? -1 : null"
                    class="inline-flex items-center gap-2 px-5 py-3 text-[0.8rem] whitespace-nowrap text-white/72 transition-colors hover:text-white"
                  >
                    <span class="h-2 w-2 rounded-full" [style.background]="toneVar(h.tone)"></span>
                    {{ h.label }}
                    <b class="font-semibold text-white">{{ h.value }}</b>
                  </a>
                </li>
              }
            </ul>
          }
        </div>
      </div>
    </section>
  `,
})
export class HeroComponent {
  protected readonly profile = PROFILE;

  private readonly net = viewChild.required<ElementRef<HTMLCanvasElement>>('net');

  protected readonly bg = inject(BackgroundService);
  protected readonly backgrounds = BACKGROUNDS;
  protected readonly current = computed(
    () => BACKGROUNDS.find((b) => b.id === this.bg.kind()) ?? BACKGROUNDS[0],
  );

  private readonly mergedPrs = OPEN_SOURCE.flatMap((p) =>
    p.contributions
      .filter((c) => c.kind === 'pr' && c.status === 'merged')
      .map((c) => ({ project: p.project, number: c.number, url: c.url })),
  );

  /** Every figure is derived from the content file, never typed in. */
  protected readonly stats = [
    { value: experienceLabel(), label: 'years in backend engineering' },
    { value: String(this.mergedPrs.length), label: 'merged upstream pull requests' },
    { value: String(PROJECTS.length), label: 'projects built end to end' },
    { value: String(PROJECTS.filter((p) => p.live).length), label: 'live sites' },
  ];

  protected readonly stack = ['Java', 'Spring Boot', 'Kafka', 'GraphQL', 'PostgreSQL', 'Kubernetes'];

  protected readonly highlights: Highlight[] = [
    ...this.mergedPrs.map((c) => ({
      label: `${c.project} #${c.number}`,
      value: 'merged',
      tone: 'green' as const,
      href: c.url,
      external: true,
    })),
    ...PROJECTS.filter((p) => p.live).map((p) => ({
      label: p.name,
      value: 'live',
      tone: 'teal' as const,
      href: p.live ?? p.repo,
      external: true,
    })),
    ...AWARDS.filter((a) => a.year).map((a) => ({
      label: a.title,
      value: a.year,
      tone: 'amber' as const,
      href: '#education',
      external: false,
    })),
    ...CERTIFICATIONS.slice(0, 3).map((c) => ({
      label: c.org.split(',')[0],
      value: c.title,
      tone: 'violet' as const,
      href: c.url,
      external: true,
    })),
    {
      label: PROFILE.company,
      value: `${experienceLabel()} years`,
      tone: 'blue' as const,
      href: '#experience',
      external: false,
    },
  ];

  /** Clock digits, set every second after hydration. Null on the server. */
  protected readonly clock = signal<{
    h1: number;
    h2: number;
    m1: number;
    m2: number;
    s1: number;
    s2: number;
    ampm: string;
    frac: number;
  } | null>(null);
  protected readonly clockText = signal('');
  protected readonly dateText = signal('');
  protected readonly visitorTime = signal('');
  protected readonly offsetText = signal('');

  constructor() {
    const destroyRef = inject(DestroyRef);
    let scene: { use(kind: ReturnType<BackgroundService['kind']>): void } | undefined;
    afterNextRender(() => {
      this.startClock(destroyRef);
      scene = startBackground(this.net().nativeElement, destroyRef, this.bg.kind());
    });
    // Switch scenes when the choice changes (from the dots, the caption or
    // the command menu). The first run happens before the canvas starts and
    // does nothing.
    effect(() => {
      const kind = this.bg.kind();
      untracked(() => scene?.use(kind));
    });
  }

  protected toneVar(tone: Tone): string {
    return `var(--t-${tone})`;
  }

  private startClock(destroyRef: DestroyRef): void {
    const ist = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    const istDate = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const mine = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

    // How far Bengaluru is from the visitor, fixed for the page view.
    const diff = IST_OFFSET_MIN + new Date().getTimezoneOffset();
    const span = (m: number) => {
      const h = Math.floor(Math.abs(m) / 60);
      const r = Math.abs(m) % 60;
      return [h ? `${h}h` : '', r ? `${r}m` : ''].filter(Boolean).join(' ');
    };
    this.offsetText.set(
      diff === 0
        ? 'Same time zone as Bengaluru'
        : `Bengaluru is ${span(diff)} ${diff > 0 ? 'ahead of' : 'behind'} you`,
    );

    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const now = new Date();
      const parts = Object.fromEntries(ist.formatToParts(now).map((p) => [p.type, p.value]));
      const h = Number(parts['hour']);
      const m = Number(parts['minute']);
      const s = Number(parts['second']);
      this.clock.set({
        h1: Math.floor(h / 10),
        h2: h % 10,
        m1: Math.floor(m / 10),
        m2: m % 10,
        s1: Math.floor(s / 10),
        s2: s % 10,
        ampm: (parts['dayPeriod'] ?? '').toUpperCase(),
        frac: (s + 1) / 60,
      });
      this.clockText.set(`${h}:${parts['minute']} ${parts['dayPeriod']} in Bengaluru`);
      this.dateText.set(istDate.format(now));
      this.visitorTime.set(mine.format(now));
      // Re-arm on the next whole second so the digits change on the beat.
      timer = setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
    };
    tick();
    destroyRef.onDestroy(() => clearTimeout(timer));
  }
}
