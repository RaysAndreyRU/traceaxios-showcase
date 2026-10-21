# Backend Architecture Case Studies

These case studies are based on a focused review of the private TraceAxios backend. Their purpose is to make architectural reasoning reviewable while keeping product source and commercially sensitive implementation details private.

## System map

```mermaid
flowchart LR
    Browser[React admin] --> API[NestJS API runtime]
    API --> Auth[JWT + Redis session boundary]
    API --> DB[(PostgreSQL)]
    API --> MQ[RabbitMQ]

    Scheduler[Scheduler runtime] --> MQ
    MQ --> Worker[Processor runtime]
    Worker --> Registry[Provider registry]
    Registry --> Providers[External provider adapters]
    Worker --> DB

    DB --> ReadModels[Project activity and metric snapshots]
    ReadModels --> AI[Bounded AI analysis]
    AI --> API
```

## Backend deep dives

1. [Split API and worker runtimes](01-split-api-worker-runtime.md)
2. [Multi-provider ingestion and project read models](02-provider-ingestion-and-read-models.md)
3. [Revocable authentication and one-time flows](03-revocable-authentication.md)
4. [Hierarchical multi-tenant authorization](04-multi-tenant-authorization.md)
5. [Bounded AI analysis](05-bounded-ai-analysis.md)

## Admin frontend deep dives

6. [Enforceable Feature-Sliced Design](06-enforceable-fsd.md)
7. [Resilient client data boundary](07-resilient-client-data-boundary.md)
8. [Deterministic frontend test platform](08-deterministic-frontend-testing.md)

## Landing deep dive

9. [SEO-first product surface](09-seo-first-landing.md)

## What was intentionally not published

- source files from the production repositories;
- database definitions and migration history;
- provider credentials, OAuth configuration, and callback details;
- exact queue topology and deployment configuration;
- proprietary metrics, risk scoring, and prompt content;
- customer or production data.

Each case study distinguishes the implemented design from future hardening opportunities. That distinction matters: a portfolio should demonstrate engineering judgment, not pretend that every trade-off has already disappeared.
