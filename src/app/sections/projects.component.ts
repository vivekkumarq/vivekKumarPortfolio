import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { PROFILE, PROJECTS, type Project } from '../core/profile';
import { SectionComponent } from '../shared/section.component';
import { RevealDirective } from '../shared/reveal.directive';
import { IconComponent } from '../shared/icon.component';
import { TechIconComponent, techSlug } from '../shared/tech-icon.component';
import { SkillFilterService } from '../shared/skill-filter.service';

/** Tags too common across projects to tell one cover from another. */
const COMMON = new Set(['java', 'spring boot', 'postgresql', 'typescript']);

/** Cover art per project, by position: two-stop gradients. */
const COVERS = [
  ['#0ea5e9', '#6366f1'],
  ['#14b8a6', '#0f766e'],
  ['#a855f7', '#ec4899'],
  ['#f97316', '#e11d48'],
  ['#22c55e', '#0d9488'],
  ['#6366f1', '#a855f7'],
  ['#eab308', '#f97316'],
  ['#06b6d4', '#3b82f6'],
  ['#ec4899', '#8b5cf6'],
];

/**
 * Projects as a gallery: snap-scrolling cover cards, the way a city gallery
 * works on a dashboard. Choosing a card opens its detail panel underneath.
 *
 * Every project's panel is rendered and only the chosen one is shown, so the
 * prerendered HTML still carries each project's full description for
 * crawlers and readers without JavaScript.
 *
 * The list reacts to SkillFilterService: an active skill narrows the gallery
 * to projects tagged with it, and the open panel follows the first match.
 */
@Component({
  selector: 'app-projects',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionComponent, RevealDirective, IconComponent, TechIconComponent],
  template: `
    <app-section
      sectionId="projects"
      index="05"
      eyebrow="Things I've built"
      heading="Projects"
      [lead]="lead"
    >
      <div sectionActions class="flex items-center gap-2">
        <button
          type="button"
          (click)="scroll(-1)"
          class="u-btn u-btn-soft w-11 px-0"
          aria-label="Scroll projects left"
        >
          <app-icon name="chevron-left" cls="h-4 w-4" />
        </button>
        <button
          type="button"
          (click)="scroll(1)"
          class="u-btn u-btn-soft w-11 px-0"
          aria-label="Scroll projects right"
        >
          <app-icon name="chevron-right" cls="h-4 w-4" />
        </button>
      </div>

      <!-- Active filter chip -->
      @if (filter.active(); as active) {
        <div class="mb-5 flex flex-wrap items-center gap-3" role="status">
          <span
            class="inline-flex items-center gap-2 rounded-full border border-accent bg-accent/10 px-3.5 py-1.5 text-[0.8rem] font-semibold text-accent"
          >
            <app-tech-icon [name]="active" cls="h-3.5 w-3.5" />
            {{ active }}
            <span class="font-medium opacity-75">· {{ visible().length }} of {{ total }}</span>
          </span>
          <button type="button" (click)="filter.clear()" class="u-btn u-btn-soft min-h-9 px-3.5">
            <app-icon name="close" cls="h-3.5 w-3.5" />
            Show all
          </button>
        </div>
      }

      <!-- Gallery -->
      <div appReveal>
        <ul #gallery class="u-gallery" aria-label="Projects">
          @for (p of visible(); track p.name; let i = $index) {
            <li>
              <button
                type="button"
                class="u-gcard w-full"
                (click)="open(p)"
                [attr.aria-pressed]="current()?.name === p.name"
                [attr.aria-controls]="'project-' + slug(p)"
              >
                <span class="u-gcard-art" [style.background]="cover(p)" aria-hidden="true">
                  <span class="u-gcard-grid absolute inset-0 opacity-30"></span>
                  @if (signature(p); as lead) {
                    <app-tech-icon
                      [name]="lead"
                      cls="absolute -right-6 -bottom-4 h-44 w-44 rotate-[-8deg] text-white/25"
                    />
                  }
                </span>

                <span
                  class="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[0.72rem] font-semibold backdrop-blur-md"
                >
                  @if (p.live) {
                    <span class="u-live h-1.5 w-1.5"></span>
                    Live
                  } @else {
                    <app-icon name="github" cls="h-3 w-3" />
                    Source
                  }
                </span>
                <span
                  class="u-num absolute top-3 right-3 rounded-full bg-black/30 px-2 py-0.5 text-[0.7rem] text-white/80 backdrop-blur-md"
                >
                  {{ pad(i) }}
                </span>

                <span class="absolute inset-x-4 bottom-4 block">
                  <span class="block text-[1.2rem] leading-tight font-bold tracking-tight">
                    {{ p.name }}
                  </span>
                  <span class="mt-1 line-clamp-2 block text-[0.8rem] leading-snug text-white/80">
                    {{ p.blurb }}
                  </span>
                  <span class="mt-3 flex items-center gap-2 text-white/85">
                    @for (t of p.tags.slice(0, 5); track t) {
                      <app-tech-icon [name]="t" cls="h-4 w-4" />
                    }
                  </span>
                </span>
              </button>
            </li>
          }
        </ul>
      </div>

      <!-- Detail panels: all rendered, one shown -->
      @for (p of all; track p.name) {
        <article
          [id]="'project-' + slug(p)"
          class="u-card u-panel mt-4 gap-6 overflow-hidden p-5 md:grid-cols-[15rem_minmax(0,1fr)] md:p-7"
          [class.grid]="current()?.name === p.name"
          [hidden]="current()?.name !== p.name"
          [style.background-image]="panelGlow(p)"
        >
          <div
            class="relative hidden aspect-[4/3] overflow-hidden rounded-2xl md:block"
            [style.background]="cover(p)"
            aria-hidden="true"
          >
            <span class="u-gcard-grid absolute inset-0 opacity-30"></span>
            @if (signature(p); as lead) {
              <app-tech-icon
                [name]="lead"
                cls="absolute -right-4 -bottom-4 h-32 w-32 rotate-[-8deg] text-white/30"
              />
            }
          </div>

          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-[1.6rem] leading-tight font-extrabold tracking-tight text-ink">
                {{ p.name }}
              </h3>
              @if (p.live) {
                <span
                  class="inline-flex items-center gap-1.5 rounded-full bg-green/12 px-2.5 py-1 text-[0.7rem] font-semibold text-green"
                >
                  <span class="u-live h-1.5 w-1.5"></span>
                  Live
                </span>
              }
              @if (p.featured) {
                <span
                  class="rounded-full bg-violet/12 px-2.5 py-1 text-[0.7rem] font-semibold text-violet"
                >
                  Featured
                </span>
              }
            </div>
            <p class="mt-1.5 text-[1rem] font-medium text-ink">{{ p.blurb }}</p>
            <p class="mt-3 max-w-3xl text-[0.925rem] leading-relaxed text-ink-dim">{{ p.detail }}</p>

            <ul class="mt-4 flex flex-wrap gap-1.5">
              @for (t of p.tags; track t) {
                <li
                  class="inline-flex items-center gap-1.5 rounded-full border border-line bg-raised px-2.5 py-1 text-[0.78rem] font-medium text-ink-dim"
                >
                  <app-tech-icon [name]="t" cls="h-3.5 w-3.5" />
                  {{ t }}
                </li>
              }
            </ul>

            <div class="mt-5 flex flex-wrap gap-3">
              @if (p.live; as live) {
                <a
                  [href]="live"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="u-btn u-btn-accent"
                  [attr.aria-label]="'Open the live ' + p.name + ' site'"
                >
                  <app-icon name="globe" cls="h-4 w-4" />
                  Visit live
                </a>
              }
              <a
                [href]="p.repo"
                target="_blank"
                rel="noopener noreferrer"
                class="u-btn u-btn-soft"
                [attr.aria-label]="'View the ' + p.name + ' source on GitHub'"
              >
                <app-icon name="github" cls="h-4 w-4" />
                View source
              </a>
            </div>
          </div>
        </article>
      }

      <div appReveal class="mt-6">
        <a
          [href]="github"
          target="_blank"
          rel="noopener noreferrer"
          class="u-link-underline inline-flex min-h-11 items-center gap-2 text-[0.9rem] font-medium text-ink transition-colors hover:text-accent"
        >
          All repositories on GitHub
          <app-icon name="arrow-up-right" cls="h-4 w-4" />
        </a>
      </div>
    </app-section>
  `,
})
export class ProjectsComponent {
  protected readonly lead =
    'Products I build and ship end to end — a live examination platform, event-driven backends, billing logic, API tooling, and learning platforms used in the open. Pick a card for the details.';

  protected readonly filter = inject(SkillFilterService);
  private readonly gallery = viewChild<ElementRef<HTMLElement>>('gallery');

  protected readonly all = PROJECTS;
  protected readonly total = PROJECTS.length;
  protected readonly github = PROFILE.github;

  protected readonly visible = computed<Project[]>(() => {
    const active = this.filter.active();
    if (!active) return PROJECTS;
    const key = active.toLowerCase();
    return PROJECTS.filter((p) => p.tags.some((t) => t.toLowerCase() === key));
  });

  private readonly chosen = signal<string>(PROJECTS[0].name);

  /** The open panel: the chosen project if it survives the filter, else the first match. */
  protected readonly current = computed<Project | undefined>(() => {
    const list = this.visible();
    return list.find((p) => p.name === this.chosen()) ?? list[0];
  });

  protected open(p: Project): void {
    this.chosen.set(p.name);
    // Bring the panel into view when it sits below the fold.
    requestAnimationFrame(() => {
      const panel = document.getElementById(`project-${this.slug(p)}`);
      const box = panel?.getBoundingClientRect();
      if (panel && box && box.top > window.innerHeight - 120) {
        panel.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  protected scroll(dir: 1 | -1): void {
    const el = this.gallery()?.nativeElement;
    el?.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.8) });
  }

  protected cover(p: Project): string {
    const [a, b] = COVERS[PROJECTS.indexOf(p) % COVERS.length];
    return `radial-gradient(120% 90% at 0% 0%, rgb(255 255 255 / 0.22), transparent 55%), linear-gradient(135deg, ${a}, ${b})`;
  }

  protected panelGlow(p: Project): string {
    const [a] = COVERS[PROJECTS.indexOf(p) % COVERS.length];
    return `radial-gradient(640px 240px at 100% 0, color-mix(in srgb, ${a} 14%, transparent), transparent 70%)`;
  }

  /** The last distinctive tag that has a brand mark, else the first that does. */
  protected signature(p: Project): string | undefined {
    const marked = p.tags.filter((t) => techSlug(t));
    return [...marked].reverse().find((t) => !COMMON.has(t.toLowerCase())) ?? marked[0];
  }

  protected slug(p: Project): string {
    return p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  /** 0 → "01". */
  protected pad(i: number): string {
    return String(i + 1).padStart(2, '0');
  }
}
