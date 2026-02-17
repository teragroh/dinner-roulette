---
name: Repo Extraction
description: Safely extract a module, package, or folder from a monorepo into a new standalone repository. Use when a user wants to split a codebase, extract a shared library, move a service to its own repo, or decouple a module. Covers dependency analysis, file identification, import/path rewriting, git history preservation via filter-repo, migration guide generation, and post-extraction validation.
---

## Overview

This is a composite workflow. The extraction process is split into three focused skills and an orchestrating agent. Use the **extraction-specialist** agent for the full workflow, or invoke individual skills for specific phases.

### Skills

| Skill | When to use |
|-------|-------------|
| **module-extraction-analyzer** | Analyze a folder's dependencies, detect coupling risks, produce an Extraction Plan report |
| **import-path-updater** | Rewrite imports in the source repo after the module has been moved to a new package |
| **migration-guide-generator** | Generate MIGRATION.md, changelog entries, and conventional commit messages |

### Agent

**extraction-specialist** (`.github/agents/extraction-specialist.agent.md`) — Orchestrates all three skills in sequence: Analyze → Extract → Update Imports → Document.

## Workflow Summary

1. **Analyze** — Run module-extraction-analyzer on the target folder. Review the Extraction Plan. Confirm shared-dependency decisions.
2. **Extract** — Clone the repo, run `git filter-repo` to isolate the target with history, set up the new repo's project scaffolding.
3. **Update Source** — Run import-path-updater to rewrite all consumer imports in the source repo. Remove the extracted folder.
4. **Document** — Run migration-guide-generator to produce MIGRATION.md and changelog entries.
5. **Validate** — Both repos build, all tests pass, no dangling imports, migration guide is complete.

## Git History Preservation

Use `git filter-repo` (preferred) or `git subtree split`. Never use `git filter-branch` (deprecated).

```bash
# 1. Fresh clone (NEVER filter-repo on the original)
git clone <source-repo-url> <new-repo-name>
cd <new-repo-name>
git remote remove origin

# 2. Extract target path
git filter-repo --path <target-folder>/

# 3. Optional: flatten to repo root
git filter-repo --path-rename <target-folder>/:

# 4. Push to new remote
git remote add origin <new-repo-url>
git push -u origin main
```

| Factor | filter-repo | subtree split | Fresh start |
|--------|-------------|---------------|-------------|
| History fidelity | Full | Full (single prefix) | None |
| Multi-path extraction | ✅ | ❌ | N/A |
| Path rewriting | ✅ | ❌ | N/A |
| Large repo performance | Fast | Slow | Instant |

## Validation Checklist

- [ ] New repo builds from a clean clone
- [ ] All tests pass in both repos
- [ ] No dangling imports (`grep` for old paths returns 0)
- [ ] Git history present in new repo (if preserved)
- [ ] LICENSE matches source repo
- [ ] README documents installation and usage
- [ ] CI/CD pipeline runs in new repo
- [ ] MIGRATION.md is complete and shared with the team
