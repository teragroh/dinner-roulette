# Codegen → Test Workflow

Step-by-step process for recording a test with `playwright codegen` and refactoring it to match project conventions.

## Prerequisites

- Dev server running: `cd ui && npm run dev`
- Playwright installed: `npm init playwright@latest`

## Step 1: Start Codegen

```bash
# Basic recording
npx playwright codegen http://localhost:3000

# Record with saved auth state (for pages behind login)
npx playwright codegen --save-storage=auth.json http://localhost:3000/login

# Then reuse that auth for subsequent recordings
npx playwright codegen --load-storage=auth.json http://localhost:3000/recipes

# Record in mobile viewport
npx playwright codegen --device="iPhone 13" http://localhost:3000

# Record in specific viewport
npx playwright codegen --viewport-size="1280,720" http://localhost:3000
```

This opens a browser and an inspector window. Interact with the app — the inspector generates code in real time.

## Step 2: Copy the Raw Output

Codegen produces something like this:

```typescript
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Create Recipe' }).click();
  await page.getByLabel('Recipe Name').fill('Tacos');
  await page.getByLabel('Description').fill('Classic Mexican tacos');
  await page.locator('#cookTime').fill('30');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Tacos')).toBeVisible();
});
```

## Step 3: Refactor to Match Conventions

Apply these transformations in order:

### 3a. Wrap in `test.describe` and rename

```typescript
test.describe("Create Recipe", () => {
  test("PT-NNNN: user can create a recipe", async ({ page }) => {
```

### 3b. Fix selectors (follow selector priority)

```typescript
// ❌ Codegen sometimes uses locator() or CSS selectors
await page.locator('#cookTime').fill('30');

// ✅ Replace with getByLabel or getByRole
await page.getByLabel('Cook Time').fill('30');
```

### 3c. Remove hardcoded baseURL

```typescript
// ❌ Codegen uses full URLs
await page.goto('http://localhost:3000/');

// ✅ Use relative paths (baseURL is in playwright.config.ts)
await page.goto('/');
```

### 3d. Add Arrange/Act/Assert comments

```typescript
test("PT-2020: user can create a recipe", async ({ page }) => {
  // Arrange
  await page.goto("/recipes");

  // Act
  await page.getByRole("link", { name: "Create Recipe" }).click();
  await page.getByLabel("Recipe Name").fill("Tacos");
  await page.getByLabel("Description").fill("Classic Mexican tacos");
  await page.getByLabel("Cook Time").fill("30");
  await page.getByRole("button", { name: "Create" }).click();

  // Assert
  await expect(page.getByText("Tacos")).toBeVisible();
});
```

### 3e. Extract page object (if reused across tests)

If this page is tested in multiple spec files, extract to `e2e/pages/`:

```typescript
// e2e/pages/create-recipe-page.ts
import { type Page, expect } from "@playwright/test";

export class CreateRecipePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/recipes");
    await this.page.getByRole("link", { name: "Create Recipe" }).click();
  }

  async fillForm(name: string, description: string, cookTime: string) {
    await this.page.getByLabel("Recipe Name").fill(name);
    await this.page.getByLabel("Description").fill(description);
    await this.page.getByLabel("Cook Time").fill(cookTime);
  }

  async submit() {
    await this.page.getByRole("button", { name: "Create" }).click();
  }
}
```

## Step 4: Place in Correct Directory

```
e2e/
└── recipes/
    └── create-recipe.spec.ts   ← matches feature area
```

## Step 5: Run and Verify

```bash
# Run just the new test
npx playwright test e2e/recipes/create-recipe.spec.ts --headed

# Debug if failing
npx playwright test e2e/recipes/create-recipe.spec.ts --debug
```

## Step 6: Commit

```bash
git add e2e/recipes/create-recipe.spec.ts
git commit -m "test(e2e): add create recipe test PT-2020"
```

## Auth State Workflow

For tests behind login, record auth once and reuse:

```bash
# 1. Record login and save cookies/storage
npx playwright codegen --save-storage=e2e/fixtures/auth.json http://localhost:3000/login

# 2. Log in manually in the browser, then close it

# 3. Record subsequent tests with saved auth
npx playwright codegen --load-storage=e2e/fixtures/auth.json http://localhost:3000/recipes
```

This skips the login flow in every recording session.
