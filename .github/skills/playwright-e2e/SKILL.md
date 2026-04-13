---
name: playwright-e2e
description: "Playwright end-to-end testing patterns and automation policy. Use when writing Playwright test files, configuring playwright.config.ts, creating test fixtures, page objects, accessibility checks, visual comparisons, CI execution, cross-browser testing, or debugging flaky tests. Triggers on: Playwright, e2e, end-to-end, browser test, smoke test, regression test, cross-browser, visual test, axe-core, storageState, toHaveScreenshot, test.describe, getByRole, page.route, flaky test, quarantine, PractiTest."
---

# Playwright End-to-End Testing

## When to use this skill

Use when the user is:
- Writing or modifying Playwright `.spec.ts` or `.test.ts` files
- Configuring `playwright.config.ts` (projects, timeouts, webServer, reporters)
- Creating test fixtures, page helpers, or data seeders
- Writing accessibility checks with `@axe-core/playwright`
- Setting up authentication via `storageState` or `globalSetup`
- Configuring CI pipelines for Playwright execution
- Debugging flaky tests or triage quarantine decisions
- Implementing visual comparison with `toHaveScreenshot()` or Figma references
- Tagging tests for lane-based execution
- Integrating Playwright results with PractiTest or similar test management

## Official Reference

- **Docs**: https://playwright.dev/docs/intro
- **API**: https://playwright.dev/docs/api/class-test
- **Best Practices**: https://playwright.dev/docs/best-practices

---

## Test Portfolio — Where Playwright Fits

Playwright is the browser-truth layer. It is NOT for:
- Pure business logic (use unit tests)
- API/service rules (use API/contract tests)
- Exhaustive edge-case permutations (use component/integration tests)

Playwright IS for:
- Critical end-to-end user flows
- Browser compatibility validation
- Responsive behavior verification
- Accessibility smoke checks
- Selective visual validation

---

## Execution Lanes

| Lane | Purpose | Tags |
|------|---------|------|
| Smoke | Auth, onboarding, core CRUD, permissions | `@lane:smoke` |
| Regression | Broader feature behavior, common failures | `@lane:regression` |
| Cross-browser | Critical journeys on Firefox + WebKit | `@lane:cross-browser` |
| Accessibility | axe scans, keyboard nav, focus management | `@lane:a11y` |
| Visual | Screenshot diffs, Figma comparison | `@lane:visual` |

### Execution Policy

| Stage | What runs |
|-------|-----------|
| Local dev | Selected tests, Chromium only |
| Pull request | Chromium smoke, light a11y + responsive. Target < 5 min |
| Main branch | Chromium regression + selected Firefox/WebKit critical flows |
| Nightly | Full regression, mobile, visual, cross-browser critical paths |
| Pre-release | Critical-path suite in production-like env + manual a11y review |
| Post-deploy | Non-destructive synthetic smoke (read-only, service account, `synthetic/` dir) |

---

## Configuration Patterns

### Browser Projects

```ts
import { defineConfig, devices } from "@playwright/test";

const crossBrowser = process.env.CROSS_BROWSER === "true";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    trace: "on-first-retry",
    actionTimeout: process.env.CI ? 30_000 : 10_000,
    navigationTimeout: process.env.CI ? 60_000 : 30_000,
  },
  projects: [
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"], viewport: { width: 375, height: 667 } },
    },
    {
      name: "desktop-chrome",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } },
    },
    ...(crossBrowser
      ? [
          {
            name: "desktop-firefox",
            use: { ...devices["Desktop Firefox"], viewport: { width: 1280, height: 720 } },
          },
          {
            name: "desktop-webkit",
            use: { ...devices["Desktop Safari"], viewport: { width: 1280, height: 720 } },
          },
        ]
      : []),
  ],
});
```

### Timeout Rules

- Use Playwright's built-in auto-waiting. Never use `waitForTimeout(ms)`.
- Use `waitForSelector`, `waitForResponse`, `expect().toBeVisible()` instead.
- Custom timeouts require a code comment explaining why.

---

## Test Design Standards

### Locators (priority order)

1. `getByRole()` — always first choice
2. `getByLabel()` — form fields
3. `getByText()` — visible text
4. `getByTestId()` — only when no semantic option exists

### Naming Convention

```ts
test.describe("User Registration", () => {
  test("submits valid form → redirects to dashboard", async ({ page }) => {
    // ...
  });

  test("submits duplicate email → shows error message", async ({ page }) => {
    // ...
  });
});
```

- `test.describe`: feature or workflow name
- `test`: `"<user action> → <expected outcome>"`
- No vague names like `"works correctly"` or `"handles edge case"`

### Data Seeding

- Seed via API or fixtures, never via UI flows
- Each test creates its own data and cleans up after itself
- Never rely on data from another test — tests run in any order
- Use per-test transactions or per-worker isolated tenants
- Document fixture schemas centrally for reuse

---

## Authentication Strategy

```ts
// globalSetup.ts — create storageState via API
async function globalSetup() {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.TEST_USER_EMAIL,
      password: process.env.TEST_USER_PASSWORD,
    }),
  });
  const { token } = await response.json();

  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addCookies([/* or set localStorage */]);
  await context.storageState({ path: "e2e/.auth/user.state.json" });
  await browser.close();
}
```

- Use `storageState` to share sessions across non-auth tests
- Separate state files per role: `admin.state.json`, `user.state.json`
- Auth tests (login, logout, registration, session expiry) must NOT use saved state
- Never hard-code credentials — use environment variables

---

## Parallel Execution Isolation

- Each worker gets unique users, unique data, isolated tenants
- Use `test.info().parallelIndex` or UUIDs for unique identifiers
- Default to parallel; use `test.describe.configure({ mode: 'serial' })` only for genuine sequential dependencies
- No shared file-system writes between workers

---

## Network Interception Policy

| Scenario | Use real service | Use `page.route()` |
|----------|:-:|:-:|
| App's own API (smoke/critical) | ✅ | ❌ |
| Third-party services (payments, email, analytics) | ❌ | ✅ |
| Simulating errors (500s, timeouts) | ❌ | ✅ |
| Offline/degraded-mode testing | ❌ | ✅ |

- Store mocked routes in `e2e/mocks/` with comments explaining why each mock exists
- Never mock the app's own API in E2E tests (unless testing offline behavior)

---

## Accessibility Testing

```ts
import AxeBuilder from "@axe-core/playwright";

test("login page passes a11y checks", async ({ page }) => {
  await page.goto("/login");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

- Use `@axe-core/playwright` for WCAG 2.1 AA conformance
- Scan all major page states: default, error, empty, loading, modal-open
- Write keyboard-only tests for critical interactive patterns

---

## Test Abstraction Pattern

### Directory structure

```
e2e/
├── fixtures/          # Custom Playwright fixtures
│   ├── auth.fixture.ts
│   └── data.fixture.ts
├── pages/             # Page helpers (lightweight POM)
│   ├── login.page.ts
│   └── dashboard.page.ts
├── mocks/             # Shared route mocks
├── tests/             # Test files
│   ├── auth/
│   └── diary/
└── .auth/             # Saved storageState (gitignored)
```

### Fixtures-first pattern

```ts
// e2e/fixtures/auth.fixture.ts
import { test as base } from "@playwright/test";

export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: "e2e/.auth/user.state.json",
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});
```

- Fixtures are the primary abstraction
- Page helpers encapsulate locators + actions for complex pages
- Keep helpers focused on actions/assertions, not orchestration
- Inline locators used in only one test — do not over-abstract

---

## Visual Comparison

### Playwright built-in

```ts
test("login page matches design", async ({ page }) => {
  await page.goto("/login");
  await expect(page).toHaveScreenshot("login.default.desktop.light.png", {
    maxDiffPixelRatio: 0.01,
  });
});
```

### Figma reference comparison

- Name references: `<surface>.<state>.<breakpoint>.<theme>.<locale>.png`
- Use stricter thresholds for small components (`maxDiffPixelRatio: 0.01`)
- Use tolerant thresholds for larger layouts (`maxDiffPixelRatio: 0.05`)
- Mask unstable regions (timestamps, avatars, live counters)

### Deterministic rendering checklist

- Fixed viewport, theme, locale, browser
- Seed data, disabled animations (`* { animation: none !important }`)
- Stable fonts, clock, network responses, user identity
- Wait for network idle + fonts loaded before capture

### Baseline updates

Only update reference images when:
- Design changed intentionally and was approved
- Previous reference was incorrect
- Implementation was corrected to match a newly approved design

Never blindly update references to make tests pass.

---

## Tagging Policy

### Tag structure (namespace format)

| Namespace | Purpose | Examples |
|-----------|---------|----------|
| `@lane:` | Execution selection | `smoke`, `regression`, `cross-browser`, `a11y`, `visual` |
| `@criticality:` | Release gating | `p0`, `p1`, `p2` |
| `@domain:` | Business area | `auth`, `billing`, `search`, `admin` |
| `@workflow:` | User journey | `signup`, `checkout`, `refund`, `user-delete` |
| `@service:` | Microservice owner | `identity`, `payments`, `orders` |
| `@type:` | Test category | `functional`, `a11y`, `visual`, `resilience` |
| `@team:` | Triage routing | `platform`, `payments`, `growth` |

### Rules

- 4–7 tags per test maximum
- Tags are orthogonal — each answers one question
- Lane tags drive execution, workflow/domain drive reporting, service/team drive triage
- Never tag browser, environment, build ID, or release version in source — those are CI metadata
- Never combine concepts: ❌ `@critical-checkout-chromium-prod`
- Review and prune tags regularly

---

## Governance

### Flake policy

- Any test with >5% flake rate over 7 days → quarantine within 48 hours
- Quarantined tests must have an assigned owner and a target fix date
- Treat retries as flake debt, not as solutions

### CI artifact retention

| Stage | Retention |
|-------|-----------|
| Pull request | 14 days |
| Main / nightly | 30 days |
| Pre-release / release | 90 days |

- Collect traces on first retry and full trace on failure for nightly/pre-release
- Store in CI storage with automatic expiration

---

## Microservice Considerations

### Test pyramid for microservices

| Level | Scope | Runs on |
|-------|-------|---------|
| Service | Unit, integration, API, persistence | Every service PR |
| Contract | Provider/consumer compatibility | Service PR + impacted consumers |
| Workflow | Multi-service orchestration | Main branch + nightly |
| User journey | Playwright critical paths | Main branch (smoke) + nightly (full) |

### Rules

- Do NOT run full E2E suites for every service change
- Use CI dependency/impact analysis to select affected workflows
- Use ephemeral environments with deterministic seeded data
- Tag by workflow and service dependency, not by internal service hops

---

## PractiTest Integration

### Automation ID mapping

- Every Playwright scenario gets a stable automation ID → maps to one PractiTest record
- Publish results from CI only (not local runs)
- Send metadata: commit SHA, pipeline URL, branch, environment, browser, device, lane

### PractiTest fields

| Field | Purpose |
|-------|---------|
| Automation ID | Stable code ↔ PractiTest link |
| Lane | smoke, regression, cross-browser, a11y, visual |
| Domain | Business area |
| Workflow | Primary user journey |
| Service Ownership | Responsible service/platform domain |
| Team Ownership | Triage owner |
| Criticality | Release impact level |
| Automation Status | active, quarantined, deprecated, candidate |

### What stays as CI metadata (NOT tags or PractiTest fields in code)

Browser, device, viewport, OS, environment, build number, branch, commit SHA, retry count, trace/screenshot/video links, release version, deployment ring.
