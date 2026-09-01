/* ────────────────────────────────────────────────────────────────
   SINGLE SOURCE OF TRUTH FOR EVERYTHING ON THE SITE.
   Edit this file to update the portfolio — no component changes needed.

   ⚠ METRICS: your resume has unfilled "[X]%" placeholders. Nothing on this
   site invents a number. Every slot where a real metric would strengthen a
   bullet is marked with a `metric` field set to `null`. Fill it in with a
   figure you can defend in an interview, and it renders automatically as a
   highlighted stat chip. Leave it `null` and the bullet reads cleanly
   without it. See `EXPERIENCE` below.
   ──────────────────────────────────────────────────────────────── */

/* ──────────────── EXPERIENCE CLOCK ──────────────── */

/** First day of the first full-time role. Everything below derives from it. */
export const CAREER_START = new Date(2022, 8, 1); // 1 September 2022

/**
 * Completed years since CAREER_START, computed at render time so the site
 * never advertises stale experience. The prerendered HTML bakes in the
 * build-day value; hydration recomputes it in the visitor's browser, so
 * every anniversary the number advances on its own.
 */
export function experienceYears(now: Date = new Date()): number {
  let years = now.getFullYear() - CAREER_START.getFullYear();
  const anniversary = new Date(
    now.getFullYear(),
    CAREER_START.getMonth(),
    CAREER_START.getDate(),
  );
  if (now < anniversary) years -= 1;
  return Math.max(years, 0);
}

/** Stat-chip form, e.g. "4+". */
export function experienceLabel(): string {
  return `${experienceYears()}+`;
}

/** Prose form, e.g. "four". Falls back to digits past ten. */
export function experienceYearsWord(): string {
  const words = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
  ];
  return words[experienceYears()] ?? String(experienceYears());
}

export const PROFILE = {
  name: "Vivek Kumar",
  initials: "VK",
  role: "Software Engineer",
  tagline: "Backend Systems Engineer",
  /** Rendered under the name in the hero. Keep it short and human. */
  subtitle: "Java · Spring Boot · Microservices",
  company: "Netcracker Technology",
  location: "Bengaluru, India",
  email: "vkumar.vivek222@gmail.com",
  github: "https://github.com/vivekkumarq",
  githubHandle: "vivekkumarq",
  linkedin: "https://www.linkedin.com/in/vivek-k-87036b104/",
  /**
   * Relative on purpose — no leading slash. The site is served from a
   * subpath (/vivekKumarPortfolio/), so a root-absolute path would
   * resolve against the domain root and 404. This resolves against the
   * <base href> the build injects.
   */
  resumePath: "resume/Vivek_Kumar_Resume.pdf",
  /**
   * Canonical URL, used for <link rel="canonical">, Open Graph and
   * JSON-LD. No trailing slash. Update this when moving to a custom
   * domain, or search engines keep crediting the old address.
   */
  siteUrl: "https://vivekkumarq.github.io/vivekKumarPortfolio",
  availability: "Open to backend & platform engineering roles",
} as const;

export const SEO = {
  title: "Vivek Kumar — Software Engineer | Java, Spring Boot, Microservices",
  description: `Software Engineer with ${experienceLabel()} years building scalable backend microservices in Java, Spring Boot, Quarkus and Kubernetes. Enterprise telecom systems, event-driven architecture with Kafka, GraphQL and REST API design.`,
  keywords: [
    "Vivek Kumar",
    "Java Backend Developer",
    "Spring Boot Engineer",
    "Microservices",
    "Kafka",
    "GraphQL",
    "Kubernetes",
    "Bengaluru",
    "Software Engineer Portfolio",
  ],
} as const;

/* ──────────────── ABOUT ──────────────── */

export const ABOUT = {
  /** Paragraphs of the About section. Plain strings; **bold** is supported. */
  paragraphs: [
    "I'm a backend engineer who likes the unglamorous half of software — the part where a service has to stay up, stay fast, and stay understandable a year after it shipped.",
    `For the past ${experienceYearsWord()} years at **Netcracker Technology** I've built microservices that run inside enterprise telecom platforms: GraphQL and REST APIs, Kafka-driven event pipelines, and Spring Boot services deployed on Kubernetes. Most of that work sits behind dashboards used by business teams at carriers like **Etisalat**, where a slow query or a dropped event is somebody's workday.`,
    "I care about clean architecture, low-level design, and code that a reviewer can follow without a meeting. Outside of work I build small backend systems end-to-end — order platforms, billing engines, API tooling — mostly to keep pushing on system design.",
  ],
  /** Small stat chips. Keep to 3–4; every number here must be defensible. */
  stats: [
    { value: experienceLabel(), label: "Years Experience" },
    { value: "5+", label: "Business Modules Shipped" },
    { value: "8.5", label: "CGPA / 10" },
    { value: "1", label: "Spotlight Award" },
  ],
} as const;

/* ──────────────── EXPERIENCE ──────────────── */

export type Bullet = {
  text: string;
  /**
   * Optional hard number. `null` = not filled in yet, nothing renders.
   * Example: { value: "40%", label: "faster API response" }
   */
  metric: { value: string; label: string } | null;
};

export type Role = {
  company: string;
  companyUrl?: string;
  title: string;
  employment: string;
  period: string;
  current: boolean;
  location: string;
  summary: string;
  /**
   * The recruiter cut: at most two lines, shown in the timeline's
   * "Quick view" mode for a 30-second scan. Same facts as `bullets`,
   * compressed — never claims the full list doesn't back up.
   */
  quick: string[];
  bullets: Bullet[];
  stack: string[];
};

export const EXPERIENCE: Role[] = [
  {
    company: "Netcracker Technology",
    companyUrl: "https://www.netcracker.com/",
    title: "Software Engineer",
    employment: "Full time",
    period: "Sep 2022 — Present",
    current: true,
    location: "Bengaluru, India",
    summary:
      "Backend microservices for enterprise telecom BSS/OSS platforms — API design, event-driven data flow, and production ownership.",
    quick: [
      "Design and ship backend microservices in **Java, Spring Boot, GraphQL and PostgreSQL** for enterprise telecom platforms, serving carriers like Etisalat.",
      "Own REST APIs across **5+ business modules**, Kafka event-driven pipelines, and Docker/Kubernetes deployments with GitLab and Jenkins CI/CD.",
    ],
    bullets: [
      {
        text: "Designed and built scalable backend microservices in **Java, Spring Boot, GraphQL and PostgreSQL** across enterprise telecom modules serving business users.",
        metric: null, // e.g. { value: "35%", label: "improved API response efficiency" }
      },
      {
        text: "Built GraphQL queries and mutations and implemented **GraphQL-to-REST proxy layers**, streamlining communication between internal microservices and external REST APIs.",
        metric: null, // e.g. { value: "40%", label: "less cross-service integration effort" }
      },
      {
        text: "Developed and maintained RESTful APIs for **5+ business modules** with full Swagger/OpenAPI documentation, enabling clean integration across internal teams and partner services.",
        metric: null, // e.g. { value: "50%", label: "faster integration onboarding" }
      },
      {
        text: "Implemented the **Assigned Customers API**, aggregating customer data across multiple services with advanced filtering and sorting to make records genuinely retrievable at scale.",
        metric: null, // e.g. { value: "60%", label: "faster data retrieval" }
      },
      {
        text: "Contributed to the **Customer Insights** platform and built the Tags & Alerts features for classifying and monitoring customer activity, enabling real-time operational insight.",
        metric: null,
      },
      {
        text: "Key contributor on the **Customer Sales & Representative Dashboard (CSRD)** platform — building backend services and designing CIP (Cloud Integration Platform) chains for structured customer-onboarding workflows.",
        metric: null,
      },
      {
        text: "Implemented **Kafka-based event-driven communication** for asynchronous processing across distributed services, decoupling downstream consumers and raising system throughput.",
        metric: null, // e.g. { value: "2x", label: "system throughput" }
      },
      {
        text: "Deployed services with **Docker, Kubernetes and GitLab/Jenkins CI/CD**, cutting release friction through containerisation and automated builds.",
        metric: null, // e.g. { value: "45%", label: "reduction in deployment time" }
      },
      {
        text: "Delivered critical backend features for **Etisalat (Emirates Telecommunications)** using Groovy Script and Quarkus, diagnosing and resolving production issues in high-traffic telecom environments.",
        metric: null, // e.g. { value: "20+", label: "production issues resolved / quarter" }
      },
      {
        text: "Integrated **Keycloak** authentication and authorisation for role-based access control, and improved observability through structured logging, error handling and performance monitoring.",
        metric: null,
      },
      {
        text: "Applied clean architecture, design patterns and systematic refactoring to modernise legacy modules — working closely with QA, DevOps and Product to ship production-ready releases.",
        metric: null,
      },
    ],
    stack: [
      "Java",
      "Spring Boot",
      "Quarkus",
      "GraphQL",
      "REST",
      "Kafka",
      "PostgreSQL",
      "Kubernetes",
      "Docker",
      "Keycloak",
      "Groovy",
      "GitLab CI",
    ],
  },
];

/* ──────────────── PROJECTS ──────────────── */

export type Project = {
  name: string;
  blurb: string;
  detail: string;
  tags: string[];
  repo: string;
  featured: boolean;
};

export const PROJECTS: Project[] = [
  {
    name: "Event-Driven Order Platform",
    blurb: "Kafka-backed order processing across loosely coupled services.",
    detail:
      "Microservices order-processing platform built on asynchronous Kafka messaging and Spring Boot REST APIs. Producer–consumer topic architecture handles the full order lifecycle with fault tolerance and horizontal scalability.",
    tags: ["Java", "Spring Boot", "Kafka", "Microservices"],
    repo: "https://github.com/vivekkumarq/event-driven-order-platform",
    featured: true,
  },
  {
    name: "Subscription Billing Platform",
    blurb: "Plans, proration and recurring invoicing, modelled properly.",
    detail:
      "Subscription management and billing system covering plans, invoicing and recurring billing logic on Java, Spring Boot and PostgreSQL. REST endpoints handle plan upgrades, proration and automated invoice generation.",
    tags: ["Java", "Spring Boot", "PostgreSQL", "REST"],
    repo: "https://github.com/vivekkumarq/subscription-billing-platform",
    featured: true,
  },
  {
    name: "API Orchestrator Platform",
    blurb: "A lightweight Postman, built from the backend outward.",
    detail:
      "Postman-style API client platform with a Spring Boot backend, centralising complex service communication. Supports request chaining, environment variables and response validation for repeatable API testing workflows.",
    tags: ["Spring Boot", "REST", "Orchestration"],
    repo: "https://github.com/vivekkumarq/api-orchestrator-platform",
    featured: true,
  },
  {
    name: "Parking Lot Management System",
    blurb: "A clean-room LLD exercise in SOLID and design patterns.",
    detail:
      "Parking-lot system in Java built around object-oriented design and SOLID principles — vehicle entry, dynamic slot allocation, ticketing and pricing. Strategy and Factory patterns keep vehicle types and pricing rules extensible.",
    tags: ["Java", "OOP", "LLD", "Design Patterns"],
    repo: "https://github.com/vivekkumarq/ParkingLotManagement",
    featured: false,
  },
  {
    name: "Document Organizer",
    blurb: "Metadata-driven document storage with tag-based search.",
    detail:
      "Spring Boot and PostgreSQL backend that organises documents with structured metadata and storage logic, exposing REST APIs for upload, retrieval, categorisation and tag-based search.",
    tags: ["Java", "Spring Boot", "PostgreSQL", "REST"],
    repo: "https://github.com/vivekkumarq/document-organizer",
    featured: false,
  },
  {
    name: "Movie House",
    blurb: "Spring Boot microservices with service discovery.",
    detail:
      "A microservices-based movie catalogue built with Spring Boot, exploring service decomposition, inter-service communication and a registry-driven discovery setup.",
    tags: ["Java", "Spring Boot", "Microservices"],
    repo: "https://github.com/vivekkumarq/movie-house",
    featured: false,
  },
];

/* ──────────────── OPEN SOURCE ──────────────── */

/**
 * Upstream contributions. Keep this honest: `status` is the real state of
 * the pull request, not an aspiration. "approved" means reviewed and
 * accepted but NOT yet merged — say so rather than rounding up to merged,
 * and move it to "merged" only once it actually lands.
 *
 * `stars` is a rounded snapshot, not a live figure. Refresh it when you
 * touch this file; nothing here fetches from GitHub at runtime.
 */
export type ContributionStatus = "merged" | "approved" | "resolved";

export type Contribution = {
  kind: "pr" | "issue";
  number: number;
  title: string;
  url: string;
  status: ContributionStatus;
  /** What was wrong and what changed. Two sentences at most. */
  detail: string;
  /** Diff size, e.g. "+181 across 6 files". `null` renders nothing. */
  diff: string | null;
  /** Anything citable: milestone, linked issue, reviewer. `null` = omit. */
  meta: string | null;
};

export type OpenSourceProject = {
  project: string;
  owner: string;
  description: string;
  repoUrl: string;
  /** Rounded star count at the time of writing, e.g. "26.7k". */
  stars: string;
  tags: string[];
  contributions: Contribution[];
};

export const OPEN_SOURCE: OpenSourceProject[] = [
  {
    project: "openapi-generator",
    owner: "OpenAPITools",
    description:
      "Generates API clients, server stubs and documentation from an OpenAPI specification.",
    repoUrl: "https://github.com/OpenAPITools/openapi-generator",
    stars: "26.7k",
    tags: ["Kotlin", "Rust", "Mustache", "Code Generation"],
    contributions: [
      {
        kind: "pr",
        number: 24819,
        title: "Parse the client example's port argument as u16 in rust-server output",
        url: "https://github.com/OpenAPITools/openapi-generator/pull/24819",
        status: "merged",
        detail:
          "Every client example the rust-server generator produced panicked on startup: clap stored the port argument as a String, while the code building the base URL read it back as a u16. The argument now carries a u16 value parser, so the examples run — and a non-numeric port is rejected at parse time with a clear message instead of a crash.",
        diff: "+9 across 9 files",
        meta: "Closes #24515",
      },
      {
        kind: "pr",
        number: 24810,
        title: "Emit KDoc for operation summary and description in jaxrs-spec interfaces",
        url: "https://github.com/OpenAPITools/openapi-generator/pull/24810",
        status: "merged",
        detail:
          "The Kotlin jaxrs-spec generator emitted API interfaces carrying only JAX-RS annotations, so operations documented in the spec arrived undocumented in the generated code — while the equivalent Java generator had always produced Javadoc. The template now builds a KDoc block from the operation summary and notes, with @param for documented parameters and @return for the responses.",
        diff: "+181 across 6 files",
        meta: "Closes #24794 · ships in 7.26.0",
      },
    ],
  },
  {
    project: "quarkus",
    owner: "quarkusio",
    description:
      "Supersonic Subatomic Java — a Kubernetes-native framework built for fast boot and low memory.",
    repoUrl: "https://github.com/quarkusio/quarkus",
    stars: "15.9k",
    tags: ["Java", "JSON-B", "Yasson"],
    contributions: [
      {
        kind: "issue",
        number: 56091,
        title: "Record deserialization failure traced to a JDK 22 reflection regression",
        url: "https://github.com/quarkusio/quarkus/issues/56091",
        status: "resolved",
        detail:
          "Reproduced a JSON-B record-deserialization failure reported against Quarkus using plain Yasson with no framework involved, then isolated it across runtime JDKs with identical class files: Parameter#getParameterizedType() returns the raw type for a record's canonical constructor parameters on JDK 22, but not on 21 or 25. The diagnosis — a JDK regression, not a Quarkus bug — closed the issue.",
        diff: null,
        meta: "Diagnosis confirmed by the reporter · issue closed",
      },
    ],
  },
];

/* ──────────────── SKILLS ──────────────── */

export type SkillGroup = { group: string; items: string[] };

export const SKILLS: SkillGroup[] = [
  { group: "Languages", items: ["Java", "SQL", "Groovy"] },
  {
    group: "Frameworks",
    items: ["Spring", "Spring Boot", "Quarkus", "Hibernate", "JPA", "jOOQ"],
  },
  {
    group: "APIs & Messaging",
    items: ["GraphQL", "REST APIs", "Kafka", "Reactive Architecture", "DSL"],
  },
  {
    group: "DevOps & Cloud",
    items: [
      "Docker",
      "Kubernetes",
      "OpenLens",
      "GitLab CI/CD",
      "Jenkins",
      "FlywayDB",
      "Keycloak",
    ],
  },
  { group: "Databases", items: ["PostgreSQL", "SQL"] },
  {
    group: "Tools & Testing",
    items: ["GitHub", "Postman", "JUnit", "Mockito", "Swagger / OpenAPI"],
  },
  {
    group: "Concepts",
    items: [
      "Microservices",
      "Distributed Systems",
      "System Design",
      "LLD",
      "Design Patterns",
      "Clean Architecture",
      "DSA",
    ],
  },
];

/** Flat ticker list for the marquee strip. */
export const SKILL_TICKER: string[] = [
  "Java",
  "Spring Boot",
  "Quarkus",
  "Kafka",
  "GraphQL",
  "REST",
  "PostgreSQL",
  "Kubernetes",
  "Docker",
  "Hibernate",
  "jOOQ",
  "Keycloak",
  "Jenkins",
  "GitLab CI/CD",
  "JUnit",
  "Mockito",
  "Swagger",
  "FlywayDB",
  "Microservices",
  "System Design",
];

/* ──────────────── COMPETENCIES ──────────────── */

export const COMPETENCIES: string[] = [
  "Backend Development",
  "Microservices Architecture",
  "API Design (REST & GraphQL)",
  "Event-Driven Architecture",
  "System Design",
  "Database Design",
  "CI/CD Automation",
  "Containerization",
  "Cloud-Native Development",
  "Agile / Scrum",
  "Code Review",
  "Unit Testing",
  "Performance Optimization",
  "Production Support",
];

/* ──────────────── EDUCATION & AWARDS ──────────────── */

export const EDUCATION = [
  {
    degree: "B.E., Computer Science Engineering",
    school: "SJB Institute of Technology, Bengaluru",
    period: "Aug 2018 — Aug 2022",
    note: "First Class with Distinction · CGPA 8.5 / 10",
  },
] as const;

export const AWARDS = [
  {
    title: "Spotlight of the Month",
    org: "Netcracker Technology",
    year: "2025",
    note: "Awarded for outstanding contribution and value delivery.",
  },
  {
    title: "Certificate of Merit",
    org: "District-Level Art Competition, Haryana Govt.",
    year: "",
    note: "Recognition in a state-organised district-level art competition.",
  },
] as const;

/* ──────────────── NAV ──────────────── */

export const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#open-source", label: "Open Source" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#education", label: "Education" },
  { href: "#contact", label: "Contact" },
] as const;
