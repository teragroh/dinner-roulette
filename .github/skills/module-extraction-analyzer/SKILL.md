---
name: Module Extraction Analyzer
description: Analyze a feature within a microservice for safe extraction (copy) to a new microservice. Use on prompts like "extract feature X to new microservice", "analyze deps for extraction", or any refactor/extract request. Scans React (JS/JSX), Spring Boot (Java), Webpack config, Jest tests, and Playwright tests. Classifies internal vs. external deps; flags circular or deep coupling; outputs a structured Extraction Plan for user approval before any work begins. The feature STAYS in the original microservice — this is a copy, not a move.
---

## Instructions

### Key Principle

This is a **copy-to-new-microservice** workflow. The feature remains in the original service. The goal is to identify everything the feature needs so it can be duplicated into a new microservice scaffolded from a template.

### Workflow

1. **Confirm target** — ask the user which feature/folder to extract and for the microservice template URL. If ambiguous, ask.
2. **List all feature files** — recursively enumerate every file in the target feature area across both layers:
   - **Frontend:** React components (`.js`, `.jsx`), styles, Webpack-specific config, assets
   - **Backend:** Spring Boot controllers, services, repositories, DTOs, entities, mappers, config (`.java`)
   - **Tests:** Jest unit/integration tests, Playwright E2E tests
3. **Scan imports/deps** — for each file, collect every import. See [references/grep-patterns.md](references/grep-patterns.md) for patterns.
4. **Classify** each dependency:

   | Bucket | Definition | Action in new microservice |
   |--------|-----------|---------------------------|
   | **Feature-internal** | Import resolves within the feature | Copy to new service |
   | **Shared** | Import from outside the feature (shared utils, common components, base classes) | Copy or install as dependency |
   | **External** | Third-party package (npm, Maven) | Add to new service's `package.json` / `pom.xml` |
   | **Infrastructure** | Spring config, security filters, Webpack loaders, env vars | Adapt from template or copy |

5. **Find shared code** — for each Shared dependency, note its size (LOC) and how many other features also use it. Recommend: copy if small (<50 LOC), extract to shared lib if large.
6. **Detect risks** — apply coupling thresholds below.
7. **Inventory environment/config** — list every env var, property file entry, and Webpack alias the feature uses.
8. **Output the Extraction Plan** — use [assets/extraction-plan-template.md](assets/extraction-plan-template.md). **Present to user and STOP. Do not proceed without explicit approval.**

### Coupling Risk Thresholds

| Signal | Threshold | Action |
|--------|-----------|--------|
| Feature imports > 5 shared modules | > 5 | ⚠️ High coupling — list each, recommend which to copy vs. leave |
| Circular imports (A→B→A) | Any | 🛑 Must resolve before extraction |
| Shared mutable state (Redux slices, Spring singletons used across features) | Any | ⚠️ Document; may need API boundary instead of copy |
| Database tables shared with other features | Any | ⚠️ New service needs its own tables or API calls to original |
| Webpack aliases pointing into shared code | Any | ⚠️ Must replicate aliases in new service's Webpack config |

### Template Awareness

When the user provides a microservice template URL:
1. Fetch or read the template structure.
2. Map feature files to the template's directory conventions.
3. Note where the template already provides boilerplate the feature needs (auth, logging, error handling, CI).
4. Flag conflicts — template patterns that clash with the feature's approach.
