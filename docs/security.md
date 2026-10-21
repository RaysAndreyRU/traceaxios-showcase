# Security Model

## Main controls

- Short-lived access JWTs are accepted only while the corresponding Redis session remains active.
- Refresh flows, logout, and revocation are server-controlled rather than relying only on browser state.
- Organization membership and role checks are applied at protected application boundaries.
- OAuth provider access and refresh tokens are encrypted at rest.
- Secrets enter deployments through secret management and CI environments, not committed files.
- External URLs and provider responses are treated as untrusted input.
- DTO validation constrains API input before it reaches domain services.
- Tenant identifiers remain explicit in application and repository contracts.

## Threat-oriented boundaries

| Boundary | Representative risk | Control |
| --- | --- | --- |
| Browser to API | Token theft or stale authorization | Short-lived JWT, Redis session, CSRF-aware flows, role checks. |
| API to provider | Secret exposure, rate limits, malformed responses | Encrypted tokens, scoped adapters, timeouts, validation, controlled retries. |
| Queue to worker | Duplicate delivery or poisoned payload | Schema validation, tenant scope, idempotency keys, terminal failure handling. |
| Application to database | Cross-tenant access | Explicit tenant filters and repository contracts. |
| CI to deployment | Credential leakage or unverified artifacts | Secret stores, protected environments, gated image builds. |

## Disclosure boundary

This showcase intentionally excludes real credentials, environment templates, production hostnames, provider secrets, deployment manifests, detailed permission matrices, and database definitions.
