# ADR 001: Use ports at external boundaries

- Status: Accepted
- Scope: Provider synchronization and persistence

## Context

Provider SDKs, HTTP contracts, message transports, and persistence libraries change independently from product rules. Coupling use cases directly to those tools makes retry behavior, authorization, and normalization harder to test.

## Decision

Application use cases depend on narrow TypeScript ports. Infrastructure adapters implement those ports for provider APIs, Prisma, Redis, and RabbitMQ.

The port belongs to the consumer-side domain or application module. It describes the smallest capability needed by the use case rather than mirroring the complete external SDK.

## Consequences

- Business behavior can be tested with deterministic in-memory adapters.
- Vendor migrations stay localized to infrastructure code.
- Contracts require deliberate naming and versioning.
- Additional mapping code is accepted in exchange for isolation.
