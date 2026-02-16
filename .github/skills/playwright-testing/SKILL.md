---
name: Playwright Testing
description: Playwright E2E test patterns — auth via setup project, page object fixtures, data seeding, selector priority, web-first assertions, codegen workflow, visual regression, and CI configuration. Based on official Playwright best practices.
---

## Overview

This skill provides the canonical patterns for writing Playwright E2E tests in the project, aligned with the [official Playwright best practices](https://playwright.dev/docs/best-practices).

## Instructions

### Testing Philosophy

1. **Test user-visible behavior** — assert what users see, not implementation details (CSS classes, DOM structure, component names).
2. **Isolate tests** — each test runs independently with its own state. No test should depend on another.
3. **Don't test third-party dependencies** — mock external APIs with `page.route()`.
4. **Use web-first assertions** — always `await expect(locator).toBeVisible()`, never `expect(await locator.isVisible()).toBe(true)`.
5. **Seed your own data** — control the database via `globalSetup`; never rely on leftover state.

### CLI Quick Reference

| Task | Command |
|------|--------|
| Record a test | `npx playwright codegen http://localhost:3000` |
| Record with auth | `npx playwright codegen --save-storage=auth.json http://localhost:3000/login` |
| Record on mobile | `npx playwright codegen --device="iPhone 13" http://localhost:3000` |
| Run all tests | `npx playwright test` |
| Run one file | `npx playwright test e2e/recipes/create-recipe.spec.ts` |
| Run by grep | `npx playwright test --grep "create a recipe"` |
| Run headed | `npx playwright test --headed` |
| Debug mode | `npx playwright test --debug` |
| UI mode | `npx playwright test --ui` |
| Trace locally | `npx playwright test --trace on` |
| View report | `npx playwright show-report` |
| Update snapshots | `npx playwright test --update-snapshots` |

- **Codegen → refactor workflow**: See [references/codegen-workflow.md](references/codegen-workflow.md)
- **Full CLI reference**: See [references/cli-commands.md](references/cli-commands.md)

### Selector Priority (strict order)

1. `page.getByRole("button", { name: "Submit" })` — semantic role + accessible name
2. `page.getByLabel("Email")` — form inputs by label
3. `page.getByPlaceholder("Search...")` — inputs by placeholder
4. `page.getByText("Welcome")` — visible text content
5. `page.getByTestId("recipe-card")` — last resort only

NEVER use CSS selectors, XPath, or DOM structure queries.

**Strict mode:** Playwright fails when a locator matches multiple elements. Use `{ exact: true }` to avoid substring matches:

```typescript
// BAD — matches "Spaghetti Bolognese" AND "Spaghetti Bolognese - Recipe"
await expect(page.getByText("Spaghetti Bolognese")).toBeVisible();

// GOOD — exact match only
await expect(page.getByText("Spaghetti Bolognese", { exact: true })).toBeVisible();
```

**Chaining and filtering:** Narrow locators by chaining instead of fragile selectors:

```typescript
const card = page.getByRole("listitem").filter({ hasText: "Spaghetti" });
await card.getByRole("button", { name: "Full recipe" }).click();
```

### Test Data Seeding (globalSetup)

Tests must never assume seed data exists. Use `globalSetup` to create test users and data via the backend API **before** any test runs.

```typescript
// e2e/global-setup.ts
import { request } from "@playwright/test";

const BASE_URL = "http://localhost:8080";

const TEST_USER = {
  username: "testuser",
  email: "testuser@example.com",
  password: "Password123",
};

const TEST_RECIPES = [
  {
    name: "Spaghetti Bolognese",
    description: "A classic Italian pasta dish",
    instructions: "1. Brown the beef\n2. Add sauce\n3. Serve",
    cookTimeMinutes: 45,
    prepTimeMinutes: 15,
    ingredients: [{ name: "Spaghetti", quantity: 400, unit: "g" }],
  },
];

async function globalSetup() {
  const api = await request.newContext({ baseURL: BASE_URL });

  // 1. Register test user (409 = already exists)
  const res = await api.post("/register", { data: TEST_USER });
  if (!res.ok() && res.status() !== 409) {
    throw new Error(`Failed to seed test user: ${res.status()}`);
  }

  // 2. Login to get auth cookie
  const loginRes = await api.post("/login", {
    data: { username: TEST_USER.username, password: TEST_USER.password },
  });
  if (!loginRes.ok()) {
    throw new Error(`Failed to login: ${loginRes.status()}`);
  }

  // 3. Seed recipes (skip if already exist)
  const recipesRes = await api.get("/recipes");
  const data = await recipesRes.json();
  if ((data?.content?.length ?? 0) < TEST_RECIPES.length) {
    for (const recipe of TEST_RECIPES) {
      await api.post("/recipes", { data: recipe });
    }
  }

  await api.dispose();
}

export default globalSetup;
```

**Seeding rules:**
- Global setup calls the **real backend API** — the backend must be running.
- `409 Conflict` = user already exists — skip silently (idempotent).
- Login before seeding protected resources. Playwright's `request` context stores cookies automatically.
- Check if data already exists before creating — makes re-runs safe.
- Keep test credentials here, not scattered across tests.

### Authentication (Setup Project + storageState)

Use Playwright's **setup project** pattern to authenticate once, save browser state to disk, and reuse it across all tests. This is faster than logging in per-test and matches the [official auth docs](https://playwright.dev/docs/auth).

**Step 1 — Auth setup test:**

```typescript
// e2e/auth/auth.setup.ts
import { test as setup, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.join(__dirname, "../../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.waitForLoadState("networkidle"); // Wait for React hydration
  await page.getByLabel("Username").fill("testuser");
  await page.getByLabel("Password").fill("Password123");
  await page.getByRole("button", { name: "Login" }).click();
  await page.waitForURL("/");

  // Save signed-in state to file
  await page.context().storageState({ path: authFile });
});
```

**Step 2 — Wire into config with dependencies:**

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  globalSetup: "./e2e/global-setup.ts",
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",  // Only run .spec.ts files as tests
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    // Setup project — runs first, authenticates
    { name: "setup", testMatch: /.*\.setup\.ts/ },

    // Test projects — depend on setup, reuse auth state
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "firefox",
      use: {
        browserName: "firefox",
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "webkit",
      use: {
        browserName: "webkit",
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
  reporter: [
    ["html"],
    ["json", { outputFile: "results/playwright-results.json" }],
  ],
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

**Step 3 — Tests start already authenticated:**

```typescript
// e2e/recipes/recipe-list.spec.ts
import { test, expect } from "@playwright/test";

// No login needed — storageState provides the auth cookie
test("PT-2001: user sees their recipes", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Spaghetti Bolognese", { exact: true })).toBeVisible();
});
```

**Auth rules:**
- Add `playwright/.auth/` to `.gitignore` — auth state files contain sensitive cookies.
- The setup project runs once, all browser projects depend on it via `dependencies: ["setup"]`.
- Tests never call login — they start pre-authenticated via `storageState`.
- Use `testMatch: "**/*.spec.ts"` in the root config so `.setup.ts` files only run via the setup project, not as regular tests.
- **ESM warning:** `__dirname` is not available in ES modules (Vite projects). Use `fileURLToPath(import.meta.url)` + `path.dirname()` to derive it. See the auth setup example above.
- **Hydration warning:** In SPAs (React, TanStack), always call `page.waitForLoadState("networkidle")` after `page.goto()` before interacting with forms. Without this, Playwright may click before React attaches `onSubmit`.

### Page Objects as Fixtures

Playwright recommends combining page objects with fixtures via `test.extend()`. This gives tests auto-injected page objects instead of manual instantiation.

**Step 1 — Page object class:**

```typescript
// e2e/pages/recipe-page.ts
import { type Page, type Locator, expect } from "@playwright/test";

export class RecipePage {
  readonly recipeCards: Locator;

  constructor(private page: Page) {
    this.recipeCards = page.locator("[data-slot='card']");
  }

  async goto() {
    await this.page.goto("/");
    await this.page.waitForLoadState("networkidle");
  }

  async expectRecipeVisible(name: string) {
    await expect(this.page.getByText(name, { exact: true })).toBeVisible();
  }

  async expectEmptyState() {
    await expect(this.page.getByText("No Recipes Found")).toBeVisible();
  }

  async flipCard(name: string) {
    // Use force: true because CSS backface-hidden elements intercept
    // pointer events in WebKit even when visually hidden (3D transforms).
    const card = this.recipeCards.filter({ hasText: name });
    await card
      .getByRole("button", { name: "Full recipe" })
      .click({ force: true });
  }

  async expectBackFaceVisible(name: string) {
    await expect(this.page.getByText(`${name} - Recipe`)).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: "Back" }).first()
    ).toBeVisible();
  }
}
```

**Step 2 — Wire as a fixture:**

```typescript
// e2e/fixtures/index.ts
import { test as base } from "@playwright/test";
import { RecipePage } from "../pages/recipe-page";
import { LoginPage } from "../pages/login-page";

type Fixtures = {
  recipePage: RecipePage;
  loginPage: LoginPage;
};

export const test = base.extend<Fixtures>({
  recipePage: async ({ page }, use) => {
    const recipePage = new RecipePage(page);
    await use(recipePage);
  },
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});

export { expect } from "@playwright/test";
```

**Step 3 — Tests use fixtures:**

```typescript
// e2e/recipes/recipe-list.spec.ts
import { test, expect } from "../fixtures";

test("PT-2001: user sees their recipes", async ({ recipePage }) => {
  await recipePage.goto();
  await recipePage.expectRecipeVisible("Spaghetti Bolognese");
  await recipePage.expectRecipeVisible("Chicken Stir Fry");
});

test("PT-2003: user can flip a recipe card", async ({ recipePage }) => {
  await recipePage.goto();
  await recipePage.flipCard("Spaghetti Bolognese");
  await recipePage.expectBackFaceVisible("Spaghetti Bolognese");
});
```

**When to use page objects:**
- A page is tested across **multiple test files** — centralizes selectors.
- The page has **complex interactions** (multi-step forms, flip cards).
- Selectors might change — one place to update.

**When NOT to use:**
- Simple one-off tests — inline locators are clearer.
- Don't over-abstract — keep tests readable.

### Assertions Best Practices

**Web-first assertions** — always await; Playwright auto-waits and retries:

```typescript
// GOOD — auto-waits for visibility
await expect(page.getByText("Success")).toBeVisible();

// BAD — no auto-wait, races with the DOM
expect(await page.getByText("Success").isVisible()).toBe(true);
```

**Soft assertions** — collect failures without stopping the test:

```typescript
await expect.soft(page.getByText("Title")).toBeVisible();
await expect.soft(page.getByText("Description")).toBeVisible();
// Test continues even if one fails — all failures reported at the end
```

### Visual Regression

```typescript
test("recipe card matches design", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("[data-slot='card']").first()).toHaveScreenshot(
    "recipe-card.png",
    { maxDiffPixelRatio: 0.01 },
  );
});
```

### Debugging

- **Local:** Use `--debug` flag or VS Code extension (right-click test → Debug).
- **CI:** Use `trace: "on-first-retry"` in config — view traces in the HTML report.
- **Trace viewer:** `npx playwright show-trace trace.zip` or open from HTML report.
- **Never** use `page.waitForTimeout()` in production tests — only for debugging.

### Flaky Test Handling

The config already provides automatic defenses: `retries: 2` on CI, `trace: "on-first-retry"`, and `screenshot: "only-on-failure"`. Web-first assertions and `waitForLoadState("networkidle")` in page objects prevent most timing flakes.

**When a test is chronically flaky**, annotate it instead of deleting:

```typescript
// Skip entirely until the root cause is fixed
test.fixme("PT-9999: flaky card animation test", async ({ recipePage }) => {
  // TODO: investigate CSS animation timing in WebKit
});

// Mark as expected failure on a specific browser
test("PT-9999: card flip", async ({ recipePage, browserName }) => {
  test.fail(browserName === "webkit", "Known WebKit backface-visibility bug");
  await recipePage.flipCard("Spaghetti Bolognese");
});
```

**Flaky test triage rules:**
- If a test fails on retry but passes on the third attempt, it's flaky — investigate the root cause.
- Check the trace artifact in the HTML report (`npx playwright show-report`) before adding `force: true` or extra waits.
- Common causes: hydration races (add `waitForLoadState`), CSS animation interference (use `force: true` for clicks behind overlays), network timing (use web-first assertions).
- Never add `page.waitForTimeout()` as a fix — it masks the real problem.

### Backend Resilience

`globalSetup` already **fails fast** if the backend is down — registration/login throws and no tests run. This is the correct behavior.

**Add a health check** as the first step in global setup for a clearer error message:

```typescript
async function globalSetup() {
  const api = await request.newContext({ baseURL: BASE_URL });

  // Fail fast with a clear message if backend is not running
  const health = await api.get("/actuator/health").catch(() => null);
  if (!health?.ok()) {
    throw new Error(
      `Backend is not running at ${BASE_URL}. Start it before running E2E tests.`,
    );
  }

  // ... rest of setup (register, login, seed)
}
```

**Resilience rules:**
- The backend is **not** auto-started by Playwright — only the frontend dev server is (via `webServer` in config).
- In CI, start the backend in a prior step (Docker Compose, Maven, etc.) before running Playwright.
- If the backend is slow to start, add a retry loop to the health check with a timeout rather than a fixed sleep.

### Responsive Testing (Mobile & Tablet)

Add mobile and tablet projects to the config using Playwright's built-in device descriptors. All existing tests run on these viewports automatically — no new test files needed.

**Config pattern:**

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },

    // Desktop browsers
    {
      name: "chromium",
      use: { browserName: "chromium", storageState: "playwright/.auth/user.json" },
      dependencies: ["setup"],
    },
    // ... firefox, webkit ...

    // Mobile
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 7"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "mobile-safari",
      use: {
        ...devices["iPhone 14"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },

    // Tablet
    {
      name: "tablet",
      use: {
        ...devices["iPad (gen 7)"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
});
```

**Responsive testing rules:**
- Device descriptors set `viewport`, `userAgent`, `isMobile`, `hasTouch`, and `deviceScaleFactor` automatically.
- All existing tests run on every project — a layout bug on mobile shows up as a test failure.
- Run a single device for fast local feedback: `npx playwright test --project=mobile-chrome`.
- Use `npx playwright codegen --device="iPhone 14"` to record tests at a mobile viewport.
- For device-specific assertions (e.g., hamburger menu), use `isMobile` from the test context:

```typescript
test("PT-3001: navigation adapts to mobile", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) {
    await expect(page.getByRole("button", { name: "Menu" })).toBeVisible();
  } else {
    await expect(page.getByRole("navigation")).toBeVisible();
  }
});
```

### Parallelism

Tests in a single file run sequentially by default. Enable parallel mode when tests are independent:

```typescript
test.describe.configure({ mode: "parallel" });

test("test A", async ({ page }) => { /* ... */ });
test("test B", async ({ page }) => { /* ... */ });
```

For CI, use sharding: `npx playwright test --shard=1/3`.

### Known Gotchas

**CSS 3D transforms and WebKit:** Elements with `backface-hidden` and `rotate-y-180` (e.g., flip card back faces) still intercept pointer events in WebKit even when visually hidden. Use `click({ force: true })` for buttons obscured by a 3D-transformed overlay.

**`filter({ hasText })` matches across children:** When a container has the same text in multiple child elements (e.g., a flip card with "Spaghetti Bolognese" on the front and "Spaghetti Bolognese - Recipe" on the back), `filter({ hasText })` matches the parent container that contains both. This can cause the wrong element to receive the click. Combine with `{ exact: true }` on `getByText()` or use `force: true` when the visual state is correct.

**ESM compatibility:** Vite-based projects run in ESM mode. `__dirname` and `__filename` are not available. Always use:

```typescript
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

### File Organization

```
ui/
├── playwright.config.ts         ← setup project + storageState + webServer
├── playwright/
│   └── .auth/
│       └── user.json            ← saved auth state (gitignored)
├── e2e/
│   ├── global-setup.ts          ← seeds test users/data via API
│   ├── auth/
│   │   └── auth.setup.ts        ← login + save storageState
│   ├── fixtures/
│   │   └── index.ts             ← page object fixtures (test.extend)
│   ├── pages/
│   │   ├── login-page.ts        ← LoginPage class
│   │   └── recipe-page.ts       ← RecipePage class
│   └── recipes/
│       ├── recipe-list.spec.ts
│       └── recipe-card.visual.spec.ts
└── package.json
```
