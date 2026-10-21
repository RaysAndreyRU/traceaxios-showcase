# ADR 002: Make activity ingestion idempotent

- Status: Accepted
- Scope: Background synchronization jobs

## Context

Message delivery, provider pagination, worker restarts, and manual retries can deliver the same activity more than once. Treating every delivery as new would inflate metrics and create inconsistent reports.

## Decision

Normalize every provider event into a stable identity composed from tenant, provider, and external event ID. Remove duplicates inside each batch and use idempotent persistence for cross-batch retries.

## Consequences

- Jobs can be retried safely after transient failures.
- Provider adapters must supply a stable external identifier.
- Persistence needs a matching uniqueness constraint in the private implementation.
- Updates to an existing provider event remain possible without creating a second activity.
