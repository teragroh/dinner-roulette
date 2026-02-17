---
name: Migration Guide Generator
description: Generate a MIGRATION.md and changelog entries after extracting a module to a new repository. Use at the end of an extraction workflow, on prompts like "document this migration", "generate migration guide", or "write MIGRATION.md". Produces step-by-step consumer instructions, before/after code examples, breaking change notices, rollback steps, and conventional commit suggestions.
---

## Instructions

### Prerequisites

Gather this information before generating the guide (most comes from the module-extraction-analyzer output):
- **Module name** and old location in the source repo.
- **New repo URL** and new package name.
- **Install command** for the new package.
- **Import rewrite map** (old → new, from import-path-updater).
- **Breaking changes** (removed exports, renamed symbols, changed behavior).
- **Configuration changes** (new env vars, removed config keys).
- **Timeline** for deprecation and removal of old paths.

### 1. Generate MIGRATION.md

Create a `MIGRATION.md` file (or a `## Migration` section in the repo's README) with this structure:

```markdown
# Migration Guide: <module-name>

## Summary

`<module-name>` has been extracted from `<source-repo>` into a standalone
package at [`<new-repo-url>`](<new-repo-url>).

**Package:** `<new-package-name>`
**Minimum version:** `<version>`
**Migration difficulty:** Low | Medium | High

## Step 1 — Install the New Package

\`\`\`bash
npm install <new-package-name>
# or
pnpm add <new-package-name>
# or
yarn add <new-package-name>
\`\`\`

For Java/Maven, add to `pom.xml`:
\`\`\`xml
<dependency>
  <groupId><group></groupId>
  <artifactId><artifact></artifactId>
  <version><version></version>
</dependency>
\`\`\`

## Step 2 — Update Imports

| Old import | New import |
|------------|-----------|
| `import { X } from "@/old/path"` | `import { X } from "<package>"` |
| `import { Y } from "@/old/other"` | `import { Y } from "<package>/other"` |

### Before

\`\`\`typescript
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
\`\`\`

### After

\`\`\`typescript
import { Button } from "@acme/ui/button";
import { cn } from "@acme/ui/utils";
\`\`\`

## Step 3 — Configuration Changes

<List any new env vars, removed config keys, or changed defaults.
If none, write "No configuration changes required.">

## Breaking Changes

<List any removed exports, renamed symbols, changed function signatures,
or behavioral changes. If none, write "No breaking changes.">

| Symbol | Change | Migration |
|--------|--------|-----------|
| `oldName()` | Renamed to `newName()` | Find-replace |
| `HelperX` | Removed (unused) | Delete import |

## Rollback

If you need to revert:

1. Uninstall the new package:
   \`\`\`bash
   npm uninstall <new-package-name>
   \`\`\`
2. Restore the old folder from git:
   \`\`\`bash
   git checkout <commit-before-removal> -- <old-folder-path>
   \`\`\`
3. Revert import changes:
   \`\`\`bash
   git checkout <commit-before-removal> -- <affected-files>
   \`\`\`

## Timeline

| Date | Milestone |
|------|-----------|
| <date> | New package published, old path still works (re-export shim) |
| <date> | Deprecation warnings added to old path |
| <date> | Old path removed — all consumers must have migrated |

## Questions?

Contact: <team or person> | Channel: <Slack/Teams channel>
```

### 2. Tailor to the Stack

Adapt the template to the project's language and tooling:

| Stack | Adaptations |
|-------|-------------|
| **JS/TS + npm** | `npm install` command, `import` syntax, `package.json` changes |
| **Java + Maven** | `pom.xml` dependency, `import` statements, module-info if JPMS |
| **Python + pip** | `pip install` or `pyproject.toml`, `from`/`import` syntax |
| **Monorepo (Turborepo, Nx, Lerna)** | Workspace references, internal package setup |

### 3. Generate Conventional Commit Messages

Suggest commit messages for each phase of the migration:

```
feat(<module>): extract <module> to standalone package

BREAKING CHANGE: <module> is now published as `<package-name>`.
Update imports from `@/old/path` to `<package-name>`.

chore(<source-repo>): remove extracted <module> folder

refactor(<source-repo>): update imports to use <package-name>

docs: add MIGRATION.md for <module> extraction
```

### 4. Generate Changelog Entry

Produce a changelog entry for the source repo:

```markdown
## [<version>] — <date>

### Changed
- **BREAKING:** `<module>` extracted to [`<package-name>`](<new-repo-url>).
  See [MIGRATION.md](MIGRATION.md) for upgrade instructions.

### Removed
- `<old-folder-path>/` — use `<package-name>` instead.
```

### 5. Validation

Before delivering the guide, verify:

- [ ] Every import in the rewrite map has a before/after example.
- [ ] Install commands are correct for the project's package manager.
- [ ] Breaking changes section is complete (or explicitly states "none").
- [ ] Rollback steps reference actual git commits or tags.
- [ ] Timeline dates are realistic and agreed with the user.
- [ ] No placeholder values remain (`<...>` should all be filled in).
