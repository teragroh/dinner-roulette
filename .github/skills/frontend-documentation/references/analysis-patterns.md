# Analysis Patterns

## Table of Contents

1. [Feature Discovery Heuristics](#feature-discovery-heuristics)
2. [Dependency Mapping Technique](#dependency-mapping-technique)
3. [Architecture Layer Classification](#architecture-layer-classification)
4. [Recommendation Rubric](#recommendation-rubric)
5. [Edge Cases](#edge-cases)

---

## Feature Discovery Heuristics

### Common Feature Directory Patterns

Scan for these directory structures to identify feature boundaries:

| Pattern | Framework | Example |
|---------|-----------|---------|
| `src/features/<name>/` | React (feature-based) | `src/features/auth/` |
| `src/modules/<name>/` | Angular, generic | `src/modules/dashboard/` |
| `src/domains/<name>/` | DDD-style | `src/domains/billing/` |
| `src/pages/<name>/` | Next.js, Nuxt | `src/pages/settings/` |
| `src/views/<name>/` | Vue | `src/views/Profile.vue` |
| `src/routes/<name>/` | SvelteKit, Remix, TanStack Router | `src/routes/recipes/` |

### Identifying a Feature Boundary

A directory qualifies as a feature when it contains **two or more** of:

- Components (`.tsx`, `.jsx`, `.vue`, `.svelte`)
- Hooks or composables (`use*.ts`, `use*.js`)
- Local state or schemas
- A barrel export (`index.ts`, `index.js`)
- Local tests

Single-file directories are usually shared components, not features.

### Shared Module Detection

Shared modules sit outside any feature and are imported by multiple features:

```
src/
├── components/   ← shared UI
├── hooks/        ← shared hooks
├── lib/          ← shared utilities
├── utils/        ← shared utilities (alternate name)
├── services/     ← shared API layer
├── api/          ← shared API layer (alternate name)
└── features/     ← feature boundaries
```

---

## Dependency Mapping Technique

### Step-by-Step

1. **List all features** found in Step 3 of the main workflow.
2. **For each feature**, grep its source files for import statements.
3. **Classify each import** as:
   - **Internal** — imports from within the same feature directory
   - **Shared** — imports from `components/`, `hooks/`, `lib/`, `utils/`, `api/`
   - **Cross-feature** — imports from another feature directory
   - **External** — imports from `node_modules`
4. **Build an adjacency list** of feature → feature and feature → shared dependencies.

### Grep Patterns

Adapt the path alias to the project. Common aliases:

| Alias | Resolves to |
|-------|-------------|
| `@/` | `src/` |
| `~/` | `src/` |
| `@components/` | `src/components/` |
| `#/` | `src/` (Nuxt) |

Grep commands:

```
# Cross-feature imports
grep_search: import.*from ['"]@/features/   (isRegexp: true)

# Shared component imports
grep_search: import.*from ['"]@/components/  (isRegexp: true)

# Shared hook imports
grep_search: import.*from ['"]@/hooks/       (isRegexp: true)

# Relative cross-feature imports
grep_search: import.*from ['"]\.\./\.\./features/  (isRegexp: true)

# API layer imports
grep_search: import.*from ['"]@/api/         (isRegexp: true)
grep_search: import.*from ['"]@/services/    (isRegexp: true)
```

### Building the Adjacency List

Record results in a table:

| Source Feature | Target | Type |
|----------------|--------|------|
| createRecipe | recipes | cross-feature |
| createRecipe | auth | cross-feature |
| auth | api/authentication | shared |
| recipes | api/recipes | shared |
| recipes | components/ui | shared |

---

## Architecture Layer Classification

### Layer Hierarchy (Top → Bottom)

```
Routes / Pages          (highest — URL-bound views)
  ↓
Features                (self-contained business logic)
  ↓
Components              (reusable presentational UI)
  ↓
Hooks / Composables     (shared stateful logic)
  ↓
API / Services          (server communication)
  ↓
State                   (client-side stores)
  ↓
Utilities               (pure helpers)
  ↓
Config                  (environment, build)
  ↓
Assets                  (static files)
```

### Dependency Direction Rules

**Healthy** — each layer only imports from layers below it.

**Violations to flag:**

| Violation | Symptom | Severity |
|-----------|---------|----------|
| Component imports Feature | Tight coupling to business logic | High |
| Utility imports Component | Side effects in pure layer | High |
| Hook imports Route | Coupling to navigation in logic layer | Medium |
| API layer imports Component | Presentation in data layer | High |
| Feature imports another Feature | Cross-feature coupling | Medium |
| Circular dependency (A → B → A) | Build issues, tangled logic | High |

### How to Detect Violations

For each file, check that every import targets a layer at or below the current
file's layer. Use the grep patterns from the dependency mapping step, then
cross-reference with the layer assignment.

---

## Recommendation Rubric

Score each category on a 1–5 scale:

| Score | Label | Meaning |
|-------|-------|---------|
| 5 | Excellent | No issues found |
| 4 | Good | Minor improvements possible |
| 3 | Adequate | Some issues worth addressing |
| 2 | Needs Work | Significant problems |
| 1 | Critical | Blocking issues or major risks |

### Bundle Size Checklist

- [ ] No dependencies over 100 KB that have smaller alternatives
- [ ] Tree-shaking enabled (ESM imports, no CommonJS barrel re-exports)
- [ ] Route-level code splitting in place
- [ ] No duplicate functionality (e.g., both lodash and underscore)
- [ ] Images optimised (WebP, lazy loading)
- [ ] Fonts subset or self-hosted

### Security Checklist

- [ ] No secrets in client-side code (API keys, tokens in source)
- [ ] Dependencies checked for known CVEs (`npm audit` / `pnpm audit`)
- [ ] No use of `eval()`, `innerHTML`, or `dangerouslySetInnerHTML` without sanitisation
- [ ] CORS configured correctly (if applicable)
- [ ] CSP headers present (if applicable)
- [ ] Auth tokens stored securely (httpOnly cookies preferred over localStorage)

### Best Practices Checklist

- [ ] Consistent linting and formatting enforced
- [ ] Consistent file naming convention (kebab-case, PascalCase, etc.)
- [ ] Error boundaries or equivalent present
- [ ] Loading and empty states handled
- [ ] Accessibility: semantic HTML, ARIA labels, keyboard navigation
- [ ] Barrel exports used for feature public API
- [ ] No barrel exports re-exporting everything (tree-shaking killer)

### Performance Checklist

- [ ] Routes are lazily loaded
- [ ] Heavy components use dynamic import or `React.lazy` / equivalent
- [ ] Lists use virtualisation for large datasets
- [ ] Images use `loading="lazy"` or equivalent
- [ ] API responses are cached (TanStack Query, SWR, etc.)
- [ ] No unnecessary re-renders (memo, useMemo, useCallback where appropriate)
- [ ] Prefetching for likely next navigation

### Tech Stack Improvement Checklist

- [ ] All dependencies on latest stable major version
- [ ] No deprecated libraries in use
- [ ] TypeScript or JSDoc type coverage adequate
- [ ] Testing coverage: unit, integration, and E2E represented
- [ ] Dev tooling modern (fast bundler, HMR, dev server)
- [ ] CI/CD pipeline present and green

---

## Edge Cases

### Monorepos

When `package.json` has `workspaces` or the project uses Nx / Turborepo:

1. Identify the frontend package(s) by scanning workspace directories.
2. Treat each frontend package as a separate analysis target.
3. Map cross-package imports as external dependencies.

### No Feature Directories

If the project has a flat structure with no clear feature boundaries:

1. Group files by the route or page they serve.
2. Identify co-located components, hooks, and services for each route.
3. Treat each route group as an implicit feature.
4. Note in recommendations that introducing explicit feature directories would
   improve maintainability.

### CSS-in-JS vs Utility CSS vs CSS Modules

Different styling approaches affect dependency mapping:

- **CSS-in-JS** (styled-components, Emotion) — treat as internal to the component.
- **Utility CSS** (Tailwind) — no import dependencies to track.
- **CSS Modules** — treat `.module.css` files as internal to the importing component.
- **Global CSS** — flag as a shared dependency.

### Server Components (Next.js App Router, React Server Components)

Distinguish server and client components:

- Mark files with `"use client"` as client components.
- Mark files without the directive (in App Router) as server components.
- Note the boundary in the architecture layer diagram.
