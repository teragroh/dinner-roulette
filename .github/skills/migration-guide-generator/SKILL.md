---
name: Migration Guide Generator
description: Generate a MIGRATION.md and changelog entries after extracting a module to a new repository. Use at the end of an extraction workflow, on prompts like "document this migration", "generate migration guide", or "write MIGRATION.md". Produces step-by-step consumer instructions, before/after code examples, breaking change notices, rollback steps, and conventional commit suggestions.
---

## Instructions

### Inputs

Gather before generating (most from module-extraction-analyzer output):
- Module name and old location.
- New repo URL and package name.
- Install command for the new package.
- Import rewrite map (old → new, from import-path-updater).
- Breaking changes (removed exports, renamed symbols, behavior changes).
- Configuration changes (new env vars, removed config keys).
- Timeline for deprecation and removal.

### Workflow

1. Copy [assets/MIGRATION-TEMPLATE.md](assets/MIGRATION-TEMPLATE.md) into the repo as `MIGRATION.md`.
2. Fill every placeholder with actual values from the inputs above.
3. Tailor syntax to the project stack — see adaptations below.
4. Generate conventional commit messages for each migration phase.
5. Generate a changelog entry for the source repo.
6. Validate: no unfilled placeholders, install commands match package manager, breaking changes complete or explicitly "none", rollback refs are real commits/tags.

### Stack Adaptations

| Stack | Adapt |
|-------|-------|
| JS/TS + npm | `npm install`, ES `import` syntax, `package.json` |
| Java + Maven | `pom.xml` `<dependency>`, Java `import`, module-info if JPMS |
| Python + pip | `pip install` / `pyproject.toml`, `from`/`import` |
| Monorepo (Turborepo/Nx) | Workspace references, internal package setup |

### Conventional Commits

```
feat(<module>): extract <module> to standalone package

BREAKING CHANGE: <module> is now published as `<package>`.
Update imports from `@/old/path` to `<package>`.

chore(<source-repo>): remove extracted <module> folder
refactor(<source-repo>): update imports to use <package>
docs: add MIGRATION.md for <module> extraction
```

### Changelog Entry

```markdown
## [<version>] — <date>

### Changed
- **BREAKING:** `<module>` extracted to [`<package>`](<url>).
  See [MIGRATION.md](MIGRATION.md) for upgrade instructions.

### Removed
- `<old-folder>/` — use `<package>` instead.
```
