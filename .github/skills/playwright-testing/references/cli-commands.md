# Playwright CLI Reference

Complete reference for Playwright CLI commands used in this project.

## Installation

```bash
# Initialize Playwright in the project (first time)
npm init playwright@latest

# Install browsers only
npx playwright install

# Install browsers + system dependencies
npx playwright install --with-deps

# Install specific browser
npx playwright install chromium
```

## Test Runner

### Basic Usage

```bash
# Run all tests
npx playwright test

# Run specific file
npx playwright test e2e/recipes/create-recipe.spec.ts

# Run tests matching name
npx playwright test --grep "create a recipe"

# Run tests NOT matching name
npx playwright test --grep-invert "visual"

# Run specific project (browser)
npx playwright test --project=chromium

# Run multiple projects
npx playwright test --project=chromium --project=firefox
```

### Execution Modes

```bash
# Headed mode (see the browser)
npx playwright test --headed

# Debug mode (step through with inspector)
npx playwright test --debug

# UI mode (interactive test explorer)
npx playwright test --ui

# Run serially (no parallelism)
npx playwright test --workers=1
```

### Retries and Reporting

```bash
# Override retries
npx playwright test --retries=2

# Specific reporter
npx playwright test --reporter=html
npx playwright test --reporter=list
npx playwright test --reporter=json

# View HTML report after run
npx playwright show-report
```

### Visual Regression

```bash
# Update screenshot baselines
npx playwright test --update-snapshots

# Update only specific test's snapshots
npx playwright test e2e/recipes/recipe-card.visual.spec.ts --update-snapshots
```

## Codegen (Test Recorder)

### Basic Recording

```bash
# Open codegen against dev server
npx playwright codegen http://localhost:3000

# Record with specific viewport
npx playwright codegen --viewport-size="1280,720" http://localhost:3000

# Record in specific browser
npx playwright codegen --browser=firefox http://localhost:3000
```

### Device Emulation

```bash
# Record as mobile device
npx playwright codegen --device="iPhone 13" http://localhost:3000
npx playwright codegen --device="Pixel 5" http://localhost:3000
npx playwright codegen --device="iPad Pro 11" http://localhost:3000

# List available devices
npx playwright codegen --device-list
```

### Auth State

```bash
# Save auth state (cookies, localStorage) after login
npx playwright codegen --save-storage=e2e/fixtures/auth.json http://localhost:3000/login

# Load saved auth for recording protected pages
npx playwright codegen --load-storage=e2e/fixtures/auth.json http://localhost:3000/recipes
```

### Code Generation Options

```bash
# Generate in specific language
npx playwright codegen --target=javascript http://localhost:3000
npx playwright codegen --target=python http://localhost:3000

# Generate with test runner (default)
npx playwright codegen --target=playwright-test http://localhost:3000
```

## Tracing and Debugging

### Trace Viewer

```bash
# View a trace file
npx playwright show-trace trace.zip

# Record traces for all tests
npx playwright test --trace=on

# Record trace only on first retry (default in config)
npx playwright test --trace=on-first-retry
```

### Debugging in Tests

```typescript
// Pause execution and open inspector
await page.pause();

// Slow down all actions by 500ms
// In playwright.config.ts: use: { launchOptions: { slowMo: 500 } }
```

## Utilities

```bash
# Take a screenshot of a URL
npx playwright screenshot http://localhost:3000 screenshot.png

# Generate a PDF (Chromium only)
npx playwright pdf http://localhost:3000 page.pdf

# Open specific browser interactively
npx playwright open http://localhost:3000
```
