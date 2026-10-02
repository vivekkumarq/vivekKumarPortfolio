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
        class="pointer-events-none absolute inset-0 -z-[2] h-full w-full"
        aria-hidden="true"
      ></canvas>
      <div class="u-hero-grid" aria-hidden="true"></div>
      <div class="u-hero-tint" aria-hidden="true"></div>

      <div class="u-shell flex flex-1 flex-col pt-24 sm:pt-28">
        <div
          class="grid flex-1 items-center gap-12 pb-12 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-14"
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
    afterNextRender(() => {
      this.startClock(destroyRef);
      startNetwork(this.net().nativeElement, destroyRef);
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

/**
 * The hero backdrop: service nodes drifting slowly, linked when they come
 * within range, with event packets travelling along the links — a quiet
 * picture of a distributed system. Nodes near the pointer link to it.
 *
 * ponytail: O(n²) link search per frame; n stays under 50, so it is about a
 * thousand distance checks. A spatial grid would only matter far beyond that.
 *
 * Runs only while the hero is on screen and the tab is visible; under
 * reduced motion it draws a single still frame.
 */
function startNetwork(canvas: HTMLCanvasElement, destroyRef: DestroyRef): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LINK = 165;
  type Node = { x: number; y: number; vx: number; vy: number; hub: boolean };
  type Packet = { a: number; b: number; t: number; speed: number };

  let w = 0;
  let h = 0;
  let nodes: Node[] = [];
  let packets: Packet[] = [];
  let pointer: { x: number; y: number } | null = null;
  let frame = 0;
  let onScreen = true;

  const seed = () => {
    const count = Math.round(Math.min(48, Math.max(18, (w * h) / 24000)));
    nodes = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      hub: i % 6 === 0,
    }));
    packets = [];
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);

    if (!still) {
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
    }

    // Links between nearby nodes.
    const links: [number, number][] = [];
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (d < LINK) {
          links.push([i, j]);
          ctx.strokeStyle = `rgba(148, 163, 255, ${(1 - d / LINK) * 0.28})`;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Links to the pointer.
    if (pointer) {
      for (const n of nodes) {
        const d = Math.hypot(n.x - pointer.x, n.y - pointer.y);
        if (d < 190) {
          ctx.strokeStyle = `rgba(94, 234, 212, ${(1 - d / 190) * 0.45})`;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }
    }

    // Event packets: spawn on a random live link, travel, expire.
    if (!still && links.length && packets.length < 16 && Math.random() < 0.08) {
      const [a, b] = links[Math.floor(Math.random() * links.length)];
      const speed = 0.006 + Math.random() * 0.01;
      packets.push(Math.random() < 0.5 ? { a, b, t: 0, speed } : { a: b, b: a, t: 0, speed });
    }
    packets = packets.filter((p) => {
      const A = nodes[p.a];
      const B = nodes[p.b];
      p.t += p.speed;
      if (p.t >= 1 || Math.hypot(A.x - B.x, A.y - B.y) > LINK) return false;
      const x = A.x + (B.x - A.x) * p.t;
      const y = A.y + (B.y - A.y) * p.t;
      ctx.fillStyle = 'rgba(94, 234, 212, 0.18)';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(167, 243, 230, 0.95)';
      ctx.beginPath();
      ctx.arc(x, y, 1.7, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });

    // Nodes; hubs are larger, violet, with a halo.
    for (const n of nodes) {
      if (n.hub) {
        ctx.fillStyle = 'rgba(192, 132, 252, 0.16)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = n.hub ? 'rgba(216, 180, 254, 0.9)' : 'rgba(186, 198, 255, 0.55)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.hub ? 2.6 : 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const resize = () => {
    const box = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = box.width;
    h = box.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    if (still) draw();
  };

  const loop = () => {
    draw();
    frame = requestAnimationFrame(loop);
  };
  const start = () => {
    if (!still && !frame && onScreen && !document.hidden) frame = requestAnimationFrame(loop);
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const host = canvas.parentElement ?? canvas;
  const onMove = (e: PointerEvent) => {
    const box = canvas.getBoundingClientRect();
    pointer = { x: e.clientX - box.left, y: e.clientY - box.top };
  };
  const onLeave = () => (pointer = null);
  const onVisibility = () => (document.hidden ? stop() : start());

  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(canvas);
  const viewObserver = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (onScreen) start();
    else stop();
  });
  viewObserver.observe(canvas);
  host.addEventListener('pointermove', onMove, { passive: true });
  host.addEventListener('pointerleave', onLeave);
  document.addEventListener('visibilitychange', onVisibility);

  resize();
  start();

  destroyRef.onDestroy(() => {
    stop();
    sizeObserver.disconnect();
    viewObserver.disconnect();
    host.removeEventListener('pointermove', onMove);
    host.removeEventListener('pointerleave', onLeave);
    document.removeEventListener('visibilitychange', onVisibility);
  });
}
