import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { TECH_ICON_PATHS } from './tech-icon-paths';

/**
 * Labels as they appear in the content data → Simple Icons slug. A label
 * missing here falls through to being tried as a slug itself, so plain
 * names like "quarkus" or "docker" need no entry.
 */
const LABEL_TO_SLUG: Record<string, string> = {
  java: 'openjdk',
  spring: 'spring',
  'spring framework': 'spring',
  'spring boot': 'springboot',
  'spring-boot': 'springboot',
  'spring security': 'springsecurity',
  'spring data jpa': 'spring',
  kafka: 'apachekafka',
  'apache kafka': 'apachekafka',
  'tailwind css': 'tailwindcss',
  'github actions': 'githubactions',
  'gitlab ci': 'gitlab',
  'gitlab ci/cd': 'gitlab',
  junit: 'junit5',
  'junit 5': 'junit5',
  maven: 'apachemaven',
  'swagger / openapi': 'swagger',
  'swagger/openapi': 'swagger',
  flywaydb: 'flyway',
  groovy: 'apachegroovy',
  'html/css': 'html5',
};

/** Resolve a tech label to an available icon slug, or null when none. */
export function techSlug(label: string): string | null {
  const key = label.trim().toLowerCase();
  const slug = LABEL_TO_SLUG[key] ?? key;
  return TECH_ICON_PATHS[slug] ? slug : null;
}

/**
 * Brand mark for a technology, resolved from a human label. Renders
 * nothing when no mark exists (REST, LLD, …), so it can be dropped next
 * to any tech name without guarding — decorative only, always with the
 * label text beside it.
 */
@Component({
  selector: 'app-tech-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    @if (path(); as d) {
      <svg viewBox="0 0 24 24" fill="currentColor" [class]="cls()">
        <path [attr.d]="d" />
      </svg>
    }
  `,
})
export class TechIconComponent {
  /** Tech label or slug, e.g. "Spring Boot" or "springboot". */
  readonly name = input.required<string>();
  /** Tailwind sizing/colour classes applied to the <svg>. */
  readonly cls = input<string>('h-3.5 w-3.5');

  protected readonly path = computed<string | null>(() => {
    const slug = techSlug(this.name());
    return slug ? TECH_ICON_PATHS[slug] : null;
  });
}
