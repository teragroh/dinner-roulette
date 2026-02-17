---
name: Repo Extraction
description: Safely copy a frontend feature from one microservice into a new standalone microservice. Use when a user wants to extract a feature, split a service, or spin off a bounded context. The feature STAYS in the original service — this is a duplication, not a move. Covers dependency analysis, template-based scaffolding, import/path rewriting, optional code cleanup, and file manifest generation. Stack focus is React (JS), Webpack, Jest, and Playwright.
---

## Overview

Composite workflow — delegates to three focused skills and one orchestrating agent.

| Skill | Phase |
|-------|-------|
| **module-extraction-analyzer** | Analyze feature deps, detect coupling, produce Extraction Plan |
| **import-path-updater** | Rewrite imports/packages in the NEW microservice only |
| **migration-guide-generator** | Generate file manifest (copied/changed/new) and next-steps |

**Agent:** `extraction-specialist` (`.github/agents/extraction-specialist.agent.md`)

## Phases

1. **Analyze** — module-extraction-analyzer discovers feature files across the codebase → user confirms file list → Extraction Plan → **user must approve before continuing**.
2. **Scaffold** — clone/init from microservice template URL. Map feature files to template structure.
3. **Copy** — duplicate feature files (components, hooks, API, styles, tests) into the new service.
4. **Rewrite** — import-path-updater → dry-run → user confirms → apply. Fix aliases, paths, mocks.
5. **Cleanup** (optional) — remove dead code, unused imports, unnecessary dependencies, and feature-flag conditionals from copied files. Dry-run first.
6. **Document** — migration-guide-generator → file manifest with 📋/✏️/🆕/📐/➖ status for every file, plus cleanup actions.
7. **Validate** — new service builds and tests pass. Original service unchanged.

## Key Constraints

- **Original service is NEVER modified.** This is a copy, not a move.
- **Plan-first.** The Extraction Plan must be approved before any files are touched.
- **Template-aware.** When a template URL is provided, scaffold from it and map features to its conventions.
- **File manifest required.** Every extraction must end with a detailed report of what was copied, changed, or created.
