import { Injectable, signal } from '@angular/core';
import { PROJECTS } from '../core/profile';

/**
 * Skill labels and project tags don't always share a spelling —
 * "REST APIs" on the skills grid should hit projects tagged "REST".
 */
const ALIASES: Record<string, string> = {
  'rest apis': 'rest',
};

const normalize = (skill: string): string => {
  const lower = skill.trim().toLowerCase();
  return ALIASES[lower] ?? lower;
};

/**
 * Connects the skills grid to the projects section: clicking a skill pill
 * filters the project list to entries tagged with that technology.
 *
 * Built from `PROJECTS` at construction, so only skills that actually
 * appear on at least one project become clickable — a filter that could
 * ever produce an empty grid is never offered in the first place.
 */
@Injectable({ providedIn: 'root' })
export class SkillFilterService {
  /** normalized tag → the tag's canonical casing from the project data. */
  private readonly canonical = new Map<string, string>();
  /** normalized tag → number of projects carrying it. */
  private readonly counts = new Map<string, number>();

  private readonly _active = signal<string | null>(null);
  /** Currently active project tag in canonical casing, or null for all. */
  readonly active = this._active.asReadonly();

  constructor() {
    for (const project of PROJECTS) {
      for (const tag of project.tags) {
        const key = normalize(tag);
        this.canonical.set(key, tag);
        this.counts.set(key, (this.counts.get(key) ?? 0) + 1);
      }
    }
  }

  /** Whether this skill maps onto at least one project. */
  isFilterable(skill: string): boolean {
    return this.canonical.has(normalize(skill));
  }

  countFor(skill: string): number {
    return this.counts.get(normalize(skill)) ?? 0;
  }

  isActive(skill: string): boolean {
    const active = this._active();
    return active !== null && normalize(active) === normalize(skill);
  }

  /** Activate a skill's filter, or deactivate it when already active. */
  toggle(skill: string): void {
    const tag = this.canonical.get(normalize(skill));
    if (!tag) return;
    this._active.set(this.isActive(skill) ? null : tag);
  }

  clear(): void {
    this._active.set(null);
  }
}
