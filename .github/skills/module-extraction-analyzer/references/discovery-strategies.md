# Discovery Strategies

Feature files are scattered across the codebase. Use multiple strategies to find them all. Start broad, then trace imports to catch transitive dependencies.

## Strategy 1 — Keyword Search

Search filenames, component names, and identifiers for the feature name and synonyms.

```bash
# Filenames containing the feature keyword
find . -iname "*<feature>*" -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.scss" \)

# Component/function names
grep -rn "function <Feature>\|const <Feature>\|class <Feature>" --include="*.js" --include="*.jsx"
```

Ask the user for alternate names. Features often use different names in different parts of the codebase (e.g., "scheduling" in routes, "calendar" in components).

## Strategy 2 — Entry Point Tracing

Start from a known entry point and follow the import chain:

```
Route/Page → Container component → Child components
          → Hooks (custom hooks, state management)
          → API call modules (fetch, axios wrappers)
          → Shared utilities
          → Styles / CSS / SCSS
          → Assets (images, icons)
```

For each file found, scan its imports to find the next level. Continue until no new files are discovered.

## Strategy 3 — Route and Navigation Mapping

```bash
# React routes
grep -rn "path.*<feature>\|route.*<feature>" --include="*.js" --include="*.jsx"

# Navigation/menu references
grep -rn "<feature>" --include="*.js" --include="*.jsx" | grep -i "nav\|menu\|link\|route\|sidebar"

# Lazy-loaded / code-split components
grep -rn "lazy\|import(" --include="*.js" --include="*.jsx" | grep -i "<feature>"
```

## Strategy 4 — Test Discovery

Tests mirror feature files. Finding tests reveals feature files you may have missed.

```bash
# Jest tests mentioning the feature
find . -iname "*<feature>*.test.js" -o -iname "*<feature>*.spec.js"
grep -rn "describe.*<feature>\|it.*<feature>" --include="*.test.js" --include="*.spec.js"

# Playwright tests
find . -iname "*<feature>*.spec.js" -path "*/e2e/*" -o -path "*/playwright/*"
grep -rn "<feature>" --include="*.spec.js" -l | grep -i "e2e\|playwright"

# What the tests import — reveals feature files
grep -rn "from ['\"]" <discovered-test-files>

# Jest mocks — what they mock reveals dependencies
grep -rn "jest\.mock(" <discovered-test-files>
```

## Strategy 5 — Config and Environment

```bash
# Environment variables
grep -rn "process\.env\." --include="*.js" --include="*.jsx" | grep -i "<feature>"

# Feature flags
grep -rn "feature.*flag\|toggle\|enabled" --include="*.js" --include="*.jsx" | grep -i "<feature>"

# Webpack config referencing the feature
grep -rn "<feature>" webpack.config.* --include="*.js"
```

## Strategy 6 — State and API Layer

```bash
# Redux/state management slices, reducers, actions
grep -rn "<feature>" --include="*.js" --include="*.jsx" | grep -i "slice\|reducer\|action\|dispatch\|store\|context\|provider"

# API call modules
grep -rn "<feature>" --include="*.js" --include="*.jsx" | grep -i "fetch\|axios\|api\|endpoint\|request"

# Constants and config
grep -rn "<feature>" --include="*.js" --include="*.jsx" | grep -i "const\|config\|url\|endpoint"
```

## Iteration

After the initial scan, present the file list to the user grouped by:
- **Pages / Routes** — top-level page components
- **Components** — UI components used by the feature
- **Hooks** — custom hooks
- **API / Data** — fetch wrappers, API call modules, state management
- **Styles** — CSS, SCSS, styled-components
- **Tests** — Jest unit tests, Playwright E2E tests
- **Config** — env vars, Webpack aliases, feature flags

Ask: **"Are these all the files? Anything missing or incorrectly included?"**

Repeat discovery if the user identifies gaps.
