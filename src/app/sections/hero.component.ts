import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { PROFILE, experienceLabel } from '../core/profile';
import { IconComponent } from '../shared/icon.component';
import { TechIconComponent } from '../shared/tech-icon.component';

/**
 * Opening screen. Editorial left column (name, pitch, actions) paired with a
 * service-manifest card on large viewports — a nod to the kind of systems the
 * rest of the page is about.
 *
 * The entrance is pure CSS (u-enter / u-mask / u-draw in styles.css), timed
 * through --d on each element, rather than the scroll-reveal directive the
 * sections use: the hero is on screen at load, so it animates from first
 * paint instead of sitting invisible until JavaScript hydrates.
 */
@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TechIconComponent],
  template: `
    <section id="top" class="relative overflow-hidden">
      <!-- Backdrop: dot grid, soft glow, faint outline motifs -->
      <div class="u-dots pointer-events-none absolute inset-0 opacity-70" aria-hidden="true"></div>
      <div class="u-glow pointer-events-none absolute -top-24 -left-32 h-96 w-96" aria-hidden="true"></div>
      <div class="u-glow pointer-events-none absolute top-40 right-0 h-80 w-80" aria-hidden="true"></div>

      <svg
        class="pointer-events-none absolute top-32 left-[6%] hidden h-24 w-24 text-line lg:block"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <ellipse cx="50" cy="24" rx="30" ry="11" />
        <path d="M20 24v52c0 6 13.4 11 30 11s30-5 30-11V24" />
        <path d="M20 50c0 6 13.4 11 30 11s30-5 30-11" />
      </svg>

      <svg
        class="pointer-events-none absolute right-[8%] bottom-32 hidden h-28 w-28 text-line lg:block"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <path d="M50 8 86 29v42L50 92 14 71V29Z" />
        <path d="M50 30 68 40v20L50 70 32 60V40Z" />
      </svg>

      <div
        class="u-shell relative grid items-center gap-12 py-24 sm:py-28 lg:min-h-[100svh] lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:py-32"
      >
        <!-- Left column -->
        <div>
          <div class="u-enter mb-9 inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/60 px-3.5 py-1.5">
            <span class="relative flex h-2 w-2">
              <span class="u-pulse-ring absolute inline-flex h-full w-full rounded-full bg-accent"></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
            </span>
            <!-- The full label wraps to a second line under ~400px, so the
                 lead-in shortens and the tracking relaxes on narrow screens.
                 The &nbsp; are load-bearing: Angular strips whitespace-only
                 text nodes between elements, which would glue the words to
                 the company name. -->
            <span
              class="font-mono text-[0.6875rem] tracking-[0.02em] whitespace-nowrap text-ink-dim sm:tracking-[0.1em]"
            >
              <span class="sm:hidden">Building&nbsp;at&nbsp;</span>
              <span class="hidden sm:inline">Currently&nbsp;building&nbsp;at&nbsp;</span>
              <span class="text-ink">{{ profile.company }}</span>
            </span>
          </div>

          <p class="u-enter u-eyebrow mb-6" style="--d: 80ms">{{ profile.role }}</p>

          <h1
            class="u-mask u-display u-gradient-text text-[clamp(3rem,10vw,5.5rem)] text-ink"
            style="--d: 160ms"
          >
            {{ profile.name }}
          </h1>

          <div class="mt-7 flex items-center gap-3 sm:gap-4">
            <span class="u-draw h-px w-8 shrink-0 bg-accent sm:w-10" style="--d: 420ms"></span>
            <!-- text-xs keeps the stack on one line at 375px; wrapping left
                 the rule stranded beside a two-line paragraph. -->
            <p
              class="u-enter font-mono text-xs tracking-[0.04em] text-ink-dim sm:text-sm"
              style="--d: 480ms"
            >
              {{ profile.subtitle }}
            </p>
          </div>

          <p
            class="u-enter mt-9 max-w-xl text-[1.0625rem] leading-relaxed text-ink-dim"
            style="--d: 560ms"
          >
            I build backend microservices that hold up in production — Java and Spring Boot
            services, Kafka event pipelines, and GraphQL and REST APIs running on Kubernetes
            inside enterprise telecom platforms.
          </p>

          <!-- Actions -->
          <div class="u-enter mt-10 flex flex-wrap items-center gap-3" style="--d: 640ms">
            <a
              [href]="profile.emailUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="u-shine u-press inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-canvas"
            >
              <app-icon name="mail" cls="h-4 w-4" />
              Get in touch
            </a>

            <a
              [href]="profile.resumePath"
              download
              class="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-5 text-sm text-ink-dim transition-colors hover:border-accent hover:text-accent"
            >
              <app-icon name="download" cls="h-4 w-4" />
              Résumé
            </a>

            <a
              [href]="profile.github"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-dim transition-colors hover:border-accent hover:text-accent"
              aria-label="GitHub profile"
            >
              <app-icon name="github" cls="h-4 w-4" />
            </a>

            <a
              [href]="profile.linkedin"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-dim transition-colors hover:border-accent hover:text-accent"
              aria-label="LinkedIn profile"
            >
              <app-icon name="linkedin" cls="h-4 w-4" />
            </a>
          </div>

          <p
            class="u-enter mt-7 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-ink-faint"
            style="--d: 720ms"
          >
            <app-icon name="pin" cls="h-3.5 w-3.5" />
            {{ profile.location }}
            @if (localTime(); as time) {
              <span class="h-1 w-1 rounded-full bg-line" aria-hidden="true"></span>
              <span>{{ time }} IST</span>
            }
          </p>
        </div>

        <!-- Right column on desktop; stacks under the intro on phones, where
             it is the most distinctive thing on the screen and worth keeping. -->
        <div class="u-enter u-enter-card" style="--d: 300ms">
          <div class="u-card overflow-hidden">
            <div class="flex items-center gap-2 border-b border-line px-4 py-3">
              <span class="h-2.5 w-2.5 rounded-full border border-line"></span>
              <span class="h-2.5 w-2.5 rounded-full border border-line"></span>
              <span class="h-2.5 w-2.5 rounded-full border border-line"></span>
              <span class="ml-2 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-faint">
                engineer.yaml
              </span>
            </div>

            <dl class="space-y-0 p-4 font-mono text-[0.7rem] leading-7 sm:p-5 sm:text-[0.78rem]">
              @for (row of manifest; track row.key) {
                <div class="u-enter flex gap-3" [style.--d.ms]="560 + $index * 35">
                  <dt class="shrink-0 text-ink-faint">{{ row.key }}:</dt>
                  <dd class="text-ink-dim">{{ row.value }}</dd>
                </div>
              }
              <div class="u-enter flex gap-3" [style.--d.ms]="560 + manifest.length * 35">
                <dt class="shrink-0 text-ink-faint">stack:</dt>
                <dd class="sr-only">{{ stackLabel }}</dd>
              </div>
              <ul class="ml-4 list-none space-y-0" aria-hidden="true">
                @for (item of stack; track item) {
                  <li
                    class="u-enter flex items-center gap-2 text-accent"
                    [style.--d.ms]="560 + (manifest.length + 1 + $index) * 35"
                  >
                    <span class="text-ink-faint">-</span>
                    <app-tech-icon [name]="item" cls="h-3.5 w-3.5 opacity-90" />
                    <span>{{ item }}</span>
                  </li>
                }
              </ul>
            </dl>
          </div>
        </div>
      </div>

      <a
        href="#about"
        class="u-enter absolute bottom-8 left-1/2 hidden -translate-x-1/2 text-ink-faint transition-colors hover:text-accent md:block"
        style="--d: 1100ms"
        aria-label="Scroll to about"
      >
        <app-icon name="arrow-down" cls="h-5 w-5" class="u-bob block" />
      </a>
    </section>
  `,
})
export class HeroComponent {
  protected readonly profile = PROFILE;

  /** Wall-clock time in Bengaluru, filled in after hydration. */
  protected readonly localTime = signal('');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const format = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: '2-digit',
      });
      const tick = () => this.localTime.set(format.format(new Date()));
      tick();
      const timer = setInterval(tick, 15_000);
      destroyRef.onDestroy(() => clearInterval(timer));
    });
  }

  protected readonly manifest = [
    { key: 'name', value: PROFILE.name },
    { key: 'role', value: PROFILE.role },
    { key: 'company', value: PROFILE.company },
    { key: 'location', value: PROFILE.location },
    { key: 'experience', value: `${experienceLabel()} years` },
    { key: 'focus', value: 'backend · distributed systems' },
  ] as const;

  protected readonly stack = [
    'java',
    'spring-boot',
    'quarkus',
    'kafka',
    'graphql',
    'postgresql',
    'kubernetes',
  ] as const;

  /** Screen-reader equivalent of the decorative stack list. */
  protected readonly stackLabel = this.stack.join(', ');
}
