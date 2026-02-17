---
name: Module Extraction Analyzer
description: Analyze a folder or module for safe extraction to a new repository. Use on prompts like "extract utils/ to new repo", "analyze deps for extraction", or any @workspace refactor/extract request. Scans files for imports, exports, and dependencies; classifies internal vs. external; flags circular or deep coupling; suggests minimal public API surface; outputs a structured Extraction Plan report.
---

## Instructions

### Workflow

1. Confirm the exact target folder/files with the user. List every file recursively.
2. Scan every import and export in the target. See [references/grep-patterns.md](references/grep-patterns.md) for language-specific patterns.
3. Classify each import into **Internal** (within target), **Shared** (outside target, used by target AND others), or **External** (third-party package).
4. Find reverse dependencies — all files OUTSIDE the target that import FROM the target. Record each consumer and the symbols it uses.
5. Detect coupling risks (see thresholds below).
6. Suggest a minimal public API barrel export containing only symbols consumers actually use.
7. Suggest a `package.json` (or `pom.xml` / `pyproject.toml`) with External deps from step 3.
8. Output the Extraction Plan report. Use [assets/extraction-plan-template.md](assets/extraction-plan-template.md) as the format.

Present the report to the user. **Do NOT proceed to file moves or import rewrites without explicit confirmation.**

### Coupling Risk Thresholds

| Signal | Threshold | Action |
|--------|-----------|--------|
| Incoming imports from outside target | > 5 unique files | ⚠️ Recommend refactoring first |
| Circular imports (A→B→A) | Any | 🛑 Must break cycle first |
| Shared mutable state (singletons, globals) | Any | ⚠️ Needs interface boundary |
| Barrel re-export chains > 2 levels | Any | ⚠️ Flatten first |
| Target imports > 3 Shared files | > 3 | ⚠️ Consider extracting shared files too |

Detect circulars: build adjacency list (file → imports), DFS, flag back-edges, report full cycle path.

### Shared Dependency Decisions

For each Shared import, note which target files use it, which non-target files also use it, and its size (LOC). Recommend one of:

- **Copy** — small utility, unlikely to drift
- **Publish** — used by 3+ repos
- **Parameterize** — config values, env-specific constants
- **Duplicate temporarily** — document as tech debt
