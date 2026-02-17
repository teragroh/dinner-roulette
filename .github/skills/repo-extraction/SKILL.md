---
name: Repo Extraction
description: Safely extract a module, package, or folder from a monorepo into a new standalone repository. Use when a user wants to split a codebase, extract a shared library, move a service to its own repo, or decouple a module. Covers dependency analysis, file identification, import/path rewriting, git history preservation via filter-repo, migration guide generation, and post-extraction validation.
---

## Overview

Composite workflow — delegates to three focused skills and one orchestrating agent.

| Skill | Phase |
|-------|-------|
| **module-extraction-analyzer** | Analyze deps, detect coupling, produce Extraction Plan |
| **import-path-updater** | Rewrite consumer imports post-extraction |
| **migration-guide-generator** | Generate MIGRATION.md, changelog, conventional commits |

**Agent:** `extraction-specialist` (`.github/agents/extraction-specialist.agent.md`) — runs all phases in order.

## Phases

1. **Analyze** — module-extraction-analyzer → Extraction Plan → user confirms.
2. **Extract** — `git filter-repo` on a fresh clone (see commands below). Set up new repo scaffolding.
3. **Update Source** — import-path-updater → dry-run → user confirms → apply. Remove extracted folder.
4. **Document** — migration-guide-generator → MIGRATION.md + changelog.
5. **Validate** — both repos build, tests pass, no dangling imports.

## Git History Preservation

Prefer `git filter-repo`. Never use `git filter-branch` (deprecated).

```bash
git clone <source-repo-url> <new-repo-name>
cd <new-repo-name>
git remote remove origin
git filter-repo --path <target-folder>/
git filter-repo --path-rename <target-folder>/:   # optional: flatten
git remote add origin <new-repo-url>
git push -u origin main
```

| Factor | filter-repo | subtree split | Fresh start |
|--------|-------------|---------------|-------------|
| History | Full | Single prefix | None |
| Multi-path | ✅ | ❌ | N/A |
| Path rewrite | ✅ | ❌ | N/A |
| Speed | Fast | Slow | Instant |

## Validation Checklist

- [ ] New repo builds from clean clone
- [ ] All tests pass in both repos
- [ ] `grep` for old paths returns 0
- [ ] Git history present (if preserved)
- [ ] LICENSE matches source repo
- [ ] README documents install + usage
- [ ] CI/CD runs in new repo
- [ ] MIGRATION.md is complete
