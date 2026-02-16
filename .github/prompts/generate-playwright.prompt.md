---
description: 'Generate Playwright E2E tests for a completed feature'
agent: agent
tools: ['editFiles', 'search']
---

# Generate Playwright Tests

Generate Playwright E2E tests for: **${input:featureName}**

## Process

1. **Research:** Read the actual route files in `ui/src/routes/`, components in `ui/src/features/`, and form fields in the source code.
2. **Use real selectors:** Query by role, label text, or placeholder — match the actual JSX, not guessed selectors.
3. **Cover flows:**
   - Happy path (complete user journey).
   - One key error case (validation failure, unauthorized access, etc.).
   - Empty state (no data scenario, if applicable).

## Test Structure

```typescript
import { test, expect } from "@playwright/test";

test.describe("${input:featureName}", () => {
  test("happy path", async ({ page }) => {
    // Navigate, interact, assert
  });

  test("handles error case", async ({ page }) => {
    // Trigger error, assert feedback
  });
});
```

## Conventions

- Use `page.getByRole()`, `page.getByLabel()`, `page.getByText()` — avoid CSS selectors.
- Use `await expect(...).toBeVisible()` for assertions.
- Set up auth state in `beforeEach` if the feature requires login.
- Keep tests independent — no shared state between tests.
- Place test files in `ui/e2e/` directory.
