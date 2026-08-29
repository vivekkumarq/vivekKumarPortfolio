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
  phone: "+91 74043 09721",
  github: "https://github.com/vivekkumarq",
  githubHandle: "vivekkumarq",
  linkedin: "https://www.linkedin.com/in/vivek-k-87036b104/",
  resumePath: "/resume/Vivek_Kumar_Resume.pdf",
  /** Update when you deploy to a custom domain. */
  siteUrl: "https://vivekkumarq.github.io",
  availability: "Open to backend & platform engineering roles",
} as const;

export const SEO = {
  title: "Vivek Kumar — Software Engineer | Java, Spring Boot, Microservices",
  description:
    "Software Engineer with 3+ years building scalable backend microservices in Java, Spring Boot, Quarkus and Kubernetes. Enterprise telecom systems, event-driven architecture with Kafka, GraphQL and REST API design.",
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
    "For the past three years at **Netcracker Technology** I've built microservices that run inside enterprise telecom platforms: GraphQL and REST APIs, Kafka-driven event pipelines, and Spring Boot services deployed on Kubernetes. Most of that work sits behind dashboards used by business teams at carriers like **Etisalat**, where a slow query or a dropped event is somebody's workday.",
    "I care about clean architecture, low-level design, and code that a reviewer can follow without a meeting. Outside of work I build small backend systems end-to-end — order platforms, billing engines, API tooling — mostly to keep pushing on system design.",
  ],
  /** Small stat chips. Keep to 3–4; every number here must be defensible. */
  stats: [
    { value: "3+", label: "Years Experience" },
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
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#education", label: "Education" },
  { href: "#contact", label: "Contact" },
] as const;
