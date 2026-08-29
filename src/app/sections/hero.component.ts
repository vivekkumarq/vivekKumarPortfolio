import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PROFILE } from '../core/profile';
import { IconComponent } from '../shared/icon.component';
import { RevealDirective } from '../shared/reveal.directive';

/**
 * Opening screen. Editorial left column (name, pitch, actions) paired with a
 * service-manifest card on large viewports — a nod to the kind of systems the
 * rest of the page is about.
 */
@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, RevealDirective],
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

      <div class="u-shell relative grid min-h-[100svh] items-center gap-16 py-32 lg:grid-cols-[1.15fr_1fr]">
        <!-- Left column -->
        <div>
          <div appReveal class="mb-9 inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/60 px-3.5 py-1.5">
            <span class="relative flex h-2 w-2">
              <span class="u-pulse-ring absolute inline-flex h-full w-full rounded-full bg-accent"></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
            </span>
            <span class="font-mono text-[0.6875rem] tracking-[0.1em] text-ink-dim">
              Currently building at
              <span class="text-ink">{{ profile.company }}</span>
            </span>
          </div>

          <p appReveal [i]="1" class="u-eyebrow mb-6">{{ profile.role }}</p>

          <h1 appReveal [i]="2" class="u-display text-[clamp(3rem,10vw,5.5rem)] text-ink">
            {{ profile.name }}
          </h1>

          <div appReveal [i]="3" class="mt-7 flex items-center gap-4">
            <span class="h-px w-10 bg-accent"></span>
            <p class="font-mono text-sm tracking-[0.04em] text-ink-dim">
              {{ profile.subtitle }}
            </p>
          </div>

          <p appReveal [i]="4" class="mt-9 max-w-xl text-[1.0625rem] leading-relaxed text-ink-dim">
            I build backend microservices that hold up in production — Java and Spring Boot
            services, Kafka event pipelines, and GraphQL and REST APIs running on Kubernetes
            inside enterprise telecom platforms.
          </p>

          <!-- Actions -->
          <div appReveal [i]="5" class="mt-10 flex flex-wrap items-center gap-3">
            <a
              [href]="'mailto:' + profile.email"
              class="group inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
            >
              <app-icon name="mail" cls="h-4 w-4" />
              Get in touch
            </a>

            <a
              [href]="profile.resumePath"
              download
              class="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm text-ink-dim transition-colors hover:border-accent hover:text-accent"
            >
              <app-icon name="download" cls="h-4 w-4" />
              Résumé
            </a>

            <a
              [href]="profile.github"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-full border border-line p-2.5 text-ink-dim transition-colors hover:border-accent hover:text-accent"
              aria-label="GitHub profile"
            >
              <app-icon name="github" cls="h-4 w-4" />
            </a>

            <a
              [href]="profile.linkedin"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-full border border-line p-2.5 text-ink-dim transition-colors hover:border-accent hover:text-accent"
              aria-label="LinkedIn profile"
            >
              <app-icon name="linkedin" cls="h-4 w-4" />
            </a>
          </div>

          <p appReveal [i]="6" class="mt-7 flex items-center gap-2 font-mono text-xs text-ink-faint">
            <app-icon name="pin" cls="h-3.5 w-3.5" />
            {{ profile.location }}
          </p>
        </div>

        <!-- Right column: service manifest -->
        <div appReveal [i]="4" class="hidden lg:block">
          <div class="u-card overflow-hidden">
            <div class="flex items-center gap-2 border-b border-line px-4 py-3">
              <span class="h-2.5 w-2.5 rounded-full border border-line"></span>
              <span class="h-2.5 w-2.5 rounded-full border border-line"></span>
              <span class="h-2.5 w-2.5 rounded-full border border-line"></span>
              <span class="ml-2 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-faint">
                engineer.yaml
              </span>
            </div>

            <dl class="space-y-0 p-5 font-mono text-[0.78rem] leading-7">
              @for (row of manifest; track row.key) {
                <div class="flex gap-3">
                  <dt class="shrink-0 text-ink-faint">{{ row.key }}:</dt>
                  <dd class="text-ink-dim">{{ row.value }}</dd>
                </div>
              }
              <div class="flex gap-3">
                <dt class="shrink-0 text-ink-faint">stack:</dt>
                <dd class="sr-only">{{ stackLabel }}</dd>
              </div>
              <ul class="ml-4 list-none space-y-0" aria-hidden="true">
                @for (item of stack; track item) {
                  <li class="text-accent">- {{ item }}</li>
                }
              </ul>
            </dl>
          </div>
        </div>
      </div>

      <a
        href="#about"
        class="absolute bottom-8 left-1/2 hidden -translate-x-1/2 text-ink-faint transition-colors hover:text-accent md:block"
        aria-label="Scroll to about"
      >
        <app-icon name="arrow-down" cls="h-5 w-5" />
      </a>
    </section>
  `,
})
export class HeroComponent {
  protected readonly profile = PROFILE;

  protected readonly manifest = [
    { key: 'name', value: PROFILE.name },
    { key: 'role', value: PROFILE.role },
    { key: 'company', value: PROFILE.company },
    { key: 'location', value: PROFILE.location },
    { key: 'experience', value: '3+ years' },
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
