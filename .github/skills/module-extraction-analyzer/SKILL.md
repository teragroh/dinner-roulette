---
name: Module Extraction Analyzer
description: Analyze a feature within a microservice for safe extraction (copy) to a new microservice. Use on prompts like "extract feature X to new microservice", "analyze deps for extraction", or any refactor/extract request. Scans React (JS/JSX), Webpack config, Jest tests, and Playwright tests. Classifies internal vs. external deps; flags circular or deep coupling; outputs a structured Extraction Plan for user approval before any work begins. The feature STAYS in the original microservice — this is a copy, not a move.
---

## Instructions

### Key Principle

This is a **copy-to-new-microservice** workflow. The feature remains in the original service. Feature files are often **scattered across the codebase** — not in one folder. The analyzer must research the codebase to discover all files that belong to the feature.

### Workflow

1. **Gather feature context** — ask the user for:
   - A description of the feature (e.g., "the scheduling feature", "user notifications").
   - Any known entry points (a page component, a route, a hook) — but do NOT require a single folder.
   - The microservice template URL (optional).
2. **Discover feature files** — research the codebase to build the complete file list. Features are rarely in one folder. Use all discovery strategies in [references/discovery-strategies.md](references/discovery-strategies.md):
   - Keyword search across filenames, component names, route definitions.
   - Trace from known entry points (page/route → container → child components → hooks → API calls → shared utils).
   - Find associated tests (Jest, Playwright) by naming convention and import tracing.
   - Check config files for feature-specific env vars, Webpack aliases, feature flags.
3. **Present discovered files** — show the user the full file list grouped by layer (components / hooks / API / styles / tests / config). **Ask: "Are these all the files? Anything missing or incorrectly included?"** Iterate until the user confirms.
4. **Scan imports/deps** — for each confirmed file, collect every import. See [references/grep-patterns.md](references/grep-patterns.md).
5. **Classify** each dependency:

   | Bucket | Definition | Action in new microservice |
   |--------|-----------|---------------------------|
   | **Feature-internal** | Import resolves to another discovered feature file | Copy to new service |
   | **Shared** | Import from outside the feature (shared utils, common components, base classes) | Copy or install as dependency |
   | **External** | Third-party package (npm) | Add to new service's `package.json` |
   | **Infrastructure** | Webpack loaders/aliases, env vars, build config | Adapt from template or copy |

6. **Find shared code** — for each Shared dependency, note its size (LOC) and how many other features also use it. Recommend: copy if small (<50 LOC), extract to shared lib if large.
7. **Detect risks** — apply coupling thresholds below.
8. **Inventory environment/config** — list every env var, property file entry, and Webpack alias the feature uses.
9. **Output the Extraction Plan** — use [assets/extraction-plan-template.md](assets/extraction-plan-template.md). **Present to user and STOP. Do not proceed without explicit approval.**

### Optional: Code Cleanup

After the extraction plan is approved and files are copied, ask the user if they want a cleanup pass on the copied code. If yes:

1. **Remove dead code** — delete functions, components, hooks, and exports in the copied files that are not used by the feature in the new service. They may have existed for other features in the original service.
2. **Remove unused imports** — strip imports that no longer resolve or reference code not copied.
3. **Remove unused dependencies** — drop `package.json` entries not imported by any copied file.
4. **Simplify shared utilities** — if a shared util was copied but only one function is used, trim it to just that function.
5. **Remove feature flags / conditional paths** — if the original code had feature-flag checks that are no longer needed (the feature is always on in the new service), simplify the logic.
6. **Present cleanup diff** — show all proposed deletions/simplifications. **Wait for user confirmation before applying.**

This step is optional. Skip if the user says no or does not mention cleanup.

### Coupling Risk Thresholds

| Signal | Threshold | Action |
|--------|-----------|--------|
| Feature imports > 5 shared modules | > 5 | ⚠️ High coupling — list each, recommend which to copy vs. leave |
| Circular imports (A→B→A) | Any | 🛑 Must resolve before extraction |
| Shared mutable state (Redux slices, global stores used across features) | Any | ⚠️ Document; may need API boundary instead of copy |
| Webpack aliases pointing into shared code | Any | ⚠️ Must replicate aliases in new service's Webpack config |

### Template Awareness

When the user provides a microservice template URL:
1. Fetch or read the template structure.
2. Map feature files to the template's directory conventions.
3. Note where the template already provides boilerplate the feature needs (auth, logging, error handling, CI).
4. Flag conflicts — template patterns that clash with the feature's approach.
