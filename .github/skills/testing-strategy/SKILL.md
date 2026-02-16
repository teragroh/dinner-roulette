---
name: Testing Strategy
description: Testing pyramid, what to test at each layer, TDD workflow, mocking boundaries, and when to use unit vs integration vs E2E.
---

## Overview

This skill defines what to test at each layer, preventing gaps and overlap between unit, API (Karate), and E2E (Playwright) tests.

## Instructions

### Testing Pyramid

```
         ╱╲
        ╱  ╲        Playwright E2E (few)
       ╱    ╲       Critical user journeys only
      ╱──────╲
     ╱        ╲     Karate API Tests (some)
    ╱          ╲    Every endpoint, happy + error paths
   ╱────────────╲
  ╱              ╲  Unit Tests (many)
 ╱                ╲ All business logic, edge cases
╱──────────────────╲
```

Target ratio: **70% unit, 20% API (Karate), 10% E2E (Playwright)**.

### What to Test at Each Layer

| Layer | Tool | What to Test | What NOT to Test |
|-------|------|-------------|-----------------|
| **Unit** | JUnit/Vitest | Business logic, validation, mapping, calculations, edge cases | Framework wiring, database queries, UI rendering |
| **API** | Karate | Endpoint contracts, status codes, auth, pagination, error responses | Internal service logic, UI behavior |
| **E2E** | Playwright | Critical user journeys, cross-page flows, visual regression | Every edge case, API error codes, business rules |

### Unit Test Boundaries

**Backend (JUnit + Mockito):**
- Service methods: mock the repository, test business logic.
- Mappers: test entity ↔ DTO conversion.
- Validation: test DTO validation annotations.
- DO NOT test: JPA queries (that's integration), controller routing (that's API tests).

**Frontend (Vitest + Testing Library):**
- Components: render with mock data, test user interactions.
- Hooks: test state changes and side effects.
- Schema validation: test Zod schemas with valid/invalid data.
- DO NOT test: API calls (that's API tests), full page flows (that's E2E).

### API Test Boundaries (Karate)

- Every endpoint: at least one happy path and one error case.
- Authentication: test protected endpoints with/without tokens.
- Pagination: test default, custom, and boundary page sizes.
- Validation: test all required fields and constraints.
- DO NOT test: UI rendering, JavaScript behavior, complex business rules (use unit tests).

### E2E Test Boundaries (Playwright)

- Login → create resource → verify it appears → delete it.
- Multi-step forms that span multiple components.
- Visual regression on key pages/components.
- DO NOT test: every validation message (use unit tests), every API error code (use Karate).

### TDD Decision Tree

```
Is it business logic?
  ├── Yes → Write a UNIT test first (JUnit/Vitest)
  └── No
      Is it an API contract?
        ├── Yes → Write a KARATE test first
        └── No
            Is it a complete user flow?
              ├── Yes → Write after feature is done (Playwright)
              └── No → Probably doesn't need a test
```

### Mocking Boundaries

| What to Mock | When |
|-------------|------|
| Repository | In service unit tests |
| External APIs | Always (never call real external services in tests) |
| Service layer | In controller integration tests (optional — can use real) |
| Browser APIs | In component unit tests (localStorage, fetch) |

| What NOT to Mock |
|-----------------|
| The class under test |
| Simple value objects / DTOs |
| Mapper / utility functions |

### Test Naming Convention

```
// Java
shouldReturnRecipe_whenFoundById()
shouldThrow404_whenRecipeNotFound()
shouldRejectBlankName_whenCreatingRecipe()

// TypeScript
it("renders recipe card with name and description")
it("shows error message when form is submitted empty")
it("navigates to recipe detail on card click")

// Karate
Scenario: Create a recipe successfully
Scenario: Fail to create recipe without name

// Playwright
test("PT-1010: user can create a recipe and see it listed")
```
