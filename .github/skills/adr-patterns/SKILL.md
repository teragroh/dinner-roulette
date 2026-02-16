---
name: ADR Patterns
description: Architecture Decision Record format, when to write one, how to reference past decisions, and template structure.
---

## Overview

This skill provides the Architecture Decision Record (ADR) format for documenting significant design decisions in the project.

## Instructions

### When to Write an ADR

Write an ADR when you make a decision that:
- Affects the overall architecture or structure.
- Introduces a new technology, library, or framework.
- Changes how components communicate.
- Impacts security, performance, or scalability.
- Establishes a new pattern or convention.
- Would be hard to reverse later.

Do NOT write an ADR for:
- Routine code changes.
- Bug fixes.
- Small refactors within an existing pattern.

### ADR Template

```markdown
# ADR-NNN: Short Decision Title

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-NNN

## Context

What is the issue or question we're facing? What constraints exist?
Include relevant background, metrics, or requirements.

## Decision

What have we decided to do? Be specific about the approach chosen.

## Alternatives Considered

### Alternative 1: [Name]
- **Pros:** ...
- **Cons:** ...
- **Why rejected:** ...

### Alternative 2: [Name]
- **Pros:** ...
- **Cons:** ...
- **Why rejected:** ...

## Consequences

### Positive
- What becomes easier or better?

### Negative
- What becomes harder or worse?
- What trade-offs are we accepting?

### Neutral
- What changes but is neither clearly positive nor negative?

## References

- Links to relevant docs, RFCs, or prior ADRs.
```

### Numbering and Storage

- Store ADRs in `docs/adr/`.
- Number sequentially: `ADR-001`, `ADR-002`, etc.
- File naming: `docs/adr/ADR-001-use-jwt-for-authentication.md`.
- Maintain an index file: `docs/adr/README.md`.

### Index File

```markdown
# Architecture Decision Records

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](ADR-001-use-jwt-for-authentication.md) | Use JWT for Authentication | Accepted | 2025-01-15 |
| [ADR-002](ADR-002-use-tanstack-router.md) | Use TanStack Router for Frontend Routing | Accepted | 2025-02-01 |
| [ADR-003](ADR-003-use-karate-for-api-testing.md) | Use Karate for API Testing | Accepted | 2025-03-10 |
```

### Lifecycle

1. **Proposed** — Written and shared for discussion.
2. **Accepted** — Team agrees and implements.
3. **Deprecated** — No longer relevant (but kept for history).
4. **Superseded** — Replaced by a newer ADR (link to it).

ADRs are **immutable** once accepted. If a decision changes, write a new ADR that supersedes the old one — don't edit the original.

### Example ADR

```markdown
# ADR-001: Use JWT for Authentication

**Date:** 2025-01-15
**Status:** Accepted

## Context

We need stateless authentication for our REST API. The frontend is a
single-page application deployed to Cloudflare Workers, separate from
the Spring Boot backend.

## Decision

Use JWT (JSON Web Tokens) with short-lived access tokens (15 min) and
longer-lived refresh tokens (7 days). Tokens are issued by the backend
and sent in the Authorization header.

## Alternatives Considered

### Session-based auth
- **Pros:** Simple, well-understood, built into Spring Security.
- **Cons:** Requires sticky sessions or shared session store.
  Doesn't work well with stateless API + SPA architecture.
- **Why rejected:** Our frontend is on a different domain (Cloudflare Workers).

### OAuth2 / OpenID Connect
- **Pros:** Industry standard, supports social login.
- **Cons:** More complex to implement, overkill for current needs.
- **Why rejected:** We don't need social login yet. Can migrate later.

## Consequences

### Positive
- Stateless — no server-side session storage.
- Works across different domains.
- Scales horizontally without session affinity.

### Negative
- Token revocation requires additional infrastructure (blacklist).
- JWT secret rotation needs coordination.
- Tokens can be large if they carry many claims.
```
