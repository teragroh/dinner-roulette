# Playwright Scaffold — Decision Reference

This file is read at runtime by the Playwright Scaffold agent. It contains detailed decision rules, intake fields, and generation guidelines that were externalized to keep the agent prompt focused.

## Intake Fields

### Always ask (if not inferrable)

| Field | Type | Purpose |
|---|---|---|
| New vs extend vs refactor | Select | Determines create-only vs edit-existing behavior |
| Feature/workflow name | Free text | File naming, `test.describe` block, `@workflow:` tag |
| Domain/product area | Free text or select | `@domain:` tag, directory placement |
| Team ownership | Free text | `@team:` tag |
| Criticality | Select: `p0`, `p1`, `p2` | `@criticality:` tag, lane assignment |
| Execution lanes | Multi-select: `smoke`, `regression`, `cross-browser`, `a11y`, `visual` | `@lane:` tags |
| Auth requirements | Select: `unauthenticated`, `user`, `admin`, `multiple roles` | Fixture and storage state strategy |
| User journeys | Free text | Individual `test()` blocks |
| Data seeding needs | Free text | Fixture or API seeding setup |

### Ask only when relevant

| Field | Type | When |
|---|---|---|
| Third-party mocks | Free text | External dependencies exist |
| Page helper | Confirm | Complex page with repeated interactions |
| Custom fixture | Confirm | Reusable auth or data setup |
| Route mock | Confirm | Third-party or error simulation |
| Visual test | Confirm | User wants screenshot comparison |

### Visual test fields (only when visual is confirmed)

| Field | Purpose |
|---|---|
| Asset path or reference name | Figma export filename or baseline path |
| Visual state name | e.g., `default`, `error`, `empty`, `loading` |
| Viewport | e.g., `1280x720`, `375x667` |
| Theme | e.g., `light`, `dark` |
| Locale | e.g., `en-US` |
| Screenshot scope | `page`, `component`, or `region` |
| Masking needs | Unstable areas to mask (timestamps, avatars, counters) |
| Comparison type | Implementation-regression or Figma-reference |

## Decision Rules

### When to create a page helper

Create only if:
- The flow has 3+ repeated interactions on the same page
- The page has enough complexity that raw locators reduce readability
- The repository already uses page helpers or page objects

Do not create if:
- The test has simple, linear interactions
- Locators are used in only one test file

### When to create a custom fixture

Create only if:
- Auth or seeded data setup is reused across 2+ tests in the generated spec
- The repository already favors fixture-based composition
- A reusable test dependency improves clarity more than inline setup

Do not create if:
- Built-in Playwright fixtures are sufficient
- The setup is simple enough to inline in `test.beforeEach`

### When to create a route mock

Create only if:
- The dependency is third-party (payment gateway, email provider, analytics)
- The test needs a failure state hard to reproduce with real services
- The repository already has a mock pattern to follow

Do not create if:
- The dependency is the application's own API
- The scenario can be reproduced with real services reliably

### When to create a visual test

Create only if:
- The user explicitly requested visual coverage
- There is a stable screenshot target or Figma-export reference
- The UI state can be made deterministic (fixed viewport, theme, locale, seed data, disabled animations)

Do not create if:
- The surface is highly dynamic (dashboards, feeds, charts with live data)
- No reference or baseline process is established

### When to add tags

Add tags automatically only if:
- The repository already uses Playwright tags consistently (check existing test files for `@lane:`, `@domain:`, `@workflow:`, `@criticality:` patterns)
- CI scripts or reporting depend on tag-based filtering

If no tags exist in the repo:
- Ask whether tags should be introduced
- If approved, generate a minimal set: workflow + criticality only
- Do not introduce a full taxonomy unless explicitly requested

## Tag Namespaces

| Namespace | Drives | Examples |
|---|---|---|
| `@lane:` | Execution selection | `smoke`, `regression`, `cross-browser`, `a11y`, `visual` |
| `@criticality:` | Release gating | `p0`, `p1`, `p2` |
| `@domain:` | Reporting | `auth`, `billing`, `search`, `admin` |
| `@workflow:` | Traceability | `signup`, `checkout`, `refund`, `user-delete` |
| `@service:` | Microservice owner | `identity`, `payments`, `orders` |
| `@type:` | Test category | `functional`, `a11y`, `visual`, `resilience` |
| `@team:` | Triage routing | `platform`, `payments`, `growth` |

## Generation Patterns

### Spec file structure

```ts
import { test, expect } from "@playwright/test";

test.describe("Feature Name", { tag: ["@lane:smoke", "@domain:auth"] }, () => {
  test.beforeEach(async ({ page }) => {
    // Data seeding via API
    // Navigation to starting point
  });

  test("user action → expected outcome", async ({ page }) => {
    // Arrange - setup state
    // Act - user interaction via semantic locators
    // Assert - verify outcome
  });
});
```

### Locator priority

1. `getByRole()` — always first choice
2. `getByLabel()` — form fields
3. `getByText()` — visible text content
4. `getByTestId()` — only when no semantic option exists

### Naming

- `test.describe`: feature or workflow name (e.g., `"User Registration"`)
- `test`: `"<user action> → <expected outcome>"` (e.g., `"submits valid form → redirects to dashboard"`)
- File: `<feature>.spec.ts` or `<workflow>.spec.ts`

### Auth patterns

```ts
// Reuse saved state for non-auth tests
test.use({ storageState: "e2e/.auth/user.state.json" });

// Auth tests must NOT use saved state
test.describe("Login Flow", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  // ...
});
```

### Visual comparison

```ts
await expect(page).toHaveScreenshot("login.default.desktop.light.png", {
  maxDiffPixelRatio: 0.01, // strict for small components
});

await expect(page).toHaveScreenshot("dashboard.default.desktop.light.png", {
  maxDiffPixelRatio: 0.05, // tolerant for larger layouts
  mask: [page.locator(".timestamp"), page.locator(".avatar")],
});
```

### Accessibility

```ts
import AxeBuilder from "@axe-core/playwright";

const results = await new AxeBuilder({ page })
  .withTags(["wcag2a", "wcag2aa"])
  .analyze();
expect(results.violations).toEqual([]);
```

## Directory Conventions

When the repo has no established pattern, suggest:

```
<test-root>/
├── fixtures/       # Custom Playwright fixtures
├── pages/          # Page helpers (lightweight POM)
├── mocks/          # Shared route mocks
├── tests/          # Test spec files by domain
│   ├── auth/
│   └── <domain>/
├── synthetic/      # Post-deploy non-destructive smoke tests
└── .auth/          # Saved storageState files (gitignored)
```

Adapt to whatever the repo already uses if a pattern exists.
