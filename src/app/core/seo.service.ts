import { Injectable, inject, DOCUMENT } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { PROFILE, SEO } from './profile';

/**
 * Drives every <head> tag from src/app/core/profile.ts, so the content file
 * stays the single source of truth for SEO too.
 *
 * Because the app is prerendered (`outputMode: "static"`), all of this is
 * baked into the shipped index.html at build time — crawlers and link
 * unfurlers see it without executing any JavaScript.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  apply(): void {
    this.title.setTitle(SEO.title);

    this.meta.addTags([
      { name: 'description', content: SEO.description },
      { name: 'keywords', content: SEO.keywords.join(', ') },
      { name: 'author', content: PROFILE.name },
      { name: 'robots', content: 'index, follow' },
      { name: 'theme-color', content: '#0a0c0e', media: '(prefers-color-scheme: dark)' },
      { name: 'theme-color', content: '#faf9f7', media: '(prefers-color-scheme: light)' },

      { property: 'og:type', content: 'profile' },
      { property: 'og:title', content: SEO.title },
      { property: 'og:description', content: SEO.description },
      { property: 'og:url', content: PROFILE.siteUrl },
      { property: 'og:site_name', content: `${PROFILE.name} — Portfolio` },
      { property: 'og:locale', content: 'en_IN' },

      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: SEO.title },
      { name: 'twitter:description', content: SEO.description },
    ]);

    this.setCanonical(PROFILE.siteUrl);
    this.setJsonLd();
  }

  private setCanonical(href: string): void {
    const head = this.doc.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  /** schema.org Person markup — what Google reads for the knowledge panel. */
  private setJsonLd(): void {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: PROFILE.name,
      jobTitle: PROFILE.role,
      description: SEO.description,
      email: `mailto:${PROFILE.email}`,
      telephone: PROFILE.phone,
      url: PROFILE.siteUrl,
      worksFor: { '@type': 'Organization', name: PROFILE.company },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Bengaluru',
        addressRegion: 'Karnataka',
        addressCountry: 'IN',
      },
      sameAs: [PROFILE.github, PROFILE.linkedin],
      alumniOf: {
        '@type': 'CollegeOrUniversity',
        name: 'SJB Institute of Technology, Bengaluru',
      },
      knowsAbout: [
        'Java',
        'Spring Boot',
        'Quarkus',
        'Microservices',
        'Apache Kafka',
        'GraphQL',
        'REST APIs',
        'Kubernetes',
        'PostgreSQL',
        'System Design',
      ],
    };

    const script = this.doc.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.textContent = JSON.stringify(data);
    this.doc.head.appendChild(script);
  }
}
