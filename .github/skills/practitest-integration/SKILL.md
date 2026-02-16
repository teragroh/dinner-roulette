---
name: PractiTest Integration
description: PractiTest REST API, test case mapping, result reporting, coverage dashboards, and requirement traceability.
---

## Overview

This skill provides the patterns for integrating automated tests with PractiTest for test management, traceability, and reporting.

## Instructions

### Test Case ID Mapping

Every automated test should be tagged with its PractiTest test case ID:

**Karate:**
```gherkin
@PT-1234
Scenario: Create a recipe successfully
```

**Playwright:**
```typescript
test("PT-1234: user can create a recipe", async ({ page }) => {
```

**JUnit (optional for critical unit tests):**
```java
@Test
@DisplayName("PT-1200: shouldReturnRecipe_whenFoundById")
void shouldReturnRecipe_whenFoundById() {
```

### PractiTest REST API

Base URL: `https://api.practitest.com/api/v2`

Authentication: API token in `Authorization: Bearer <token>` header.

### Pushing Test Results

```typescript
// scripts/push-results-to-practitest.ts

interface PractiTestConfig {
  apiBase: string;
  projectId: string;
  token: string;
}

interface TestResult {
  testId: string;        // "PT-1234"
  status: "PASSED" | "FAILED" | "BLOCKED" | "N/A";
  duration: number;      // milliseconds
  errorMessage?: string;
  automationSource: "karate" | "playwright" | "vitest" | "junit";
}

async function pushTestRun(config: PractiTestConfig, results: TestResult[]) {
  for (const result of results) {
    const ptId = result.testId.replace("PT-", "");

    try {
      const response = await fetch(
        `${config.apiBase}/projects/${config.projectId}/runs.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              type: "instances",
              attributes: {
                "test-id": ptId,
                "exit-code": result.status === "PASSED" ? 0 : 1,
                "run-duration": `${result.duration}ms`,
                "custom-fields": {
                  "---f-automated---": "yes",
                  "---f-source---": result.automationSource,
                  "---f-error---": result.errorMessage || "",
                },
              },
            },
          }),
        },
      );

      if (!response.ok) {
        console.error(`Failed to push ${result.testId}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error pushing ${result.testId}:`, error);
      // Continue with remaining results
    }
  }
}
```

### Parsing Test Results

**Karate Results (JSON):**
```typescript
function parseKarateResults(reportPath: string): TestResult[] {
  const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
  return report.features.flatMap((feature) =>
    feature.scenarios
      .filter((s) => s.tags?.some((t) => t.startsWith("@PT-")))
      .map((scenario) => ({
        testId: scenario.tags.find((t) => t.startsWith("@PT-")).replace("@", ""),
        status: scenario.passed ? "PASSED" : "FAILED",
        duration: scenario.duration,
        errorMessage: scenario.error,
        automationSource: "karate" as const,
      })),
  );
}
```

**Playwright Results (JSON):**
```typescript
function parsePlaywrightResults(reportPath: string): TestResult[] {
  const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
  return report.suites.flatMap((suite) =>
    suite.specs
      .filter((spec) => spec.title.includes("PT-"))
      .map((spec) => {
        const match = spec.title.match(/PT-\d+/);
        return {
          testId: match?.[0] || "UNKNOWN",
          status: spec.ok ? "PASSED" : "FAILED",
          duration: spec.tests[0]?.results[0]?.duration || 0,
          errorMessage: spec.tests[0]?.results[0]?.error?.message,
          automationSource: "playwright" as const,
        };
      }),
  );
}
```

### Coverage Matrix

Maintain a living document mapping requirements to tests:

| Requirement | Unit | Karate | Playwright | PT ID | Status |
|-------------|------|--------|-----------|-------|--------|
| User login | ✅ | ✅ PT-1001 | ✅ PT-1002 | ✅ | Covered |
| Create recipe | ✅ | ✅ PT-1010 | ✅ PT-1011 | ✅ | Covered |
| Delete recipe | ✅ | ✅ PT-1020 | ❌ | ⚠️ | Gap: needs E2E |
| Favorites | ❌ | ❌ | ❌ | ❌ | Not started |

### CI Pipeline Integration

```yaml
- name: Push results to PractiTest
  if: always()
  run: npx tsx scripts/push-results-to-practitest.ts
  env:
    PRACTITEST_API_TOKEN: ${{ secrets.PRACTITEST_API_TOKEN }}
    PRACTITEST_PROJECT_ID: ${{ secrets.PRACTITEST_PROJECT_ID }}
```
