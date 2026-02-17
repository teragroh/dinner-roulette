---
name: Import Path Updater
description: Rewrite imports across a codebase after extracting a module to a new package or repo. Use after an extraction is complete, on prompts like "fix imports in original repo", "update imports to use new package", or any post-move refactor. Handles relative paths, path aliases, tsconfig paths, barrel exports, and named imports. Always runs a dry-run first before applying changes.
---

## Instructions

### Inputs

Gather before starting:
1. **Old import pattern** — what imports look like today (e.g., `@/components/ui`).
2. **New package name** — what imports should become (e.g., `@acme/ui`).
3. **Consumer files** — from module-extraction-analyzer report, or grep the repo.

### Workflow

1. **Scan** — grep the repo for every import referencing the old path. Include all file types: `.ts`, `.tsx`, `.js`, `.jsx`, `.css`, `.scss`, test files, config files.
2. **Check aliases** — read `tsconfig.json` `paths`, Vite/Webpack `resolve.alias`, or Python `__init__.py` re-exports. Decide whether to remove or update alias entries.
3. **Build rewrite map** — explicit table: old import → new import → files affected. Rules:
   - Prefer named imports over defaults.
   - Prefer barrel imports if the new package has `index.ts`.
   - Preserve `import type { ... }` separately from value imports.
4. **Dry-run** — present all changes as diffs WITHOUT applying. Wait for user confirmation.
5. **Apply** — rewrite each import, preserving whitespace, ordering, and adjacent comments. Verify no duplicates created.
6. **Handle edge cases** — see table below.
7. **Verify** — grep for old path (expect 0 results), then `build` + `lint` + `test`.
8. **Output summary** — files modified, imports rewritten, shims created, remaining manual fixes.

### Edge Cases

| Case | Resolution |
|------|-----------|
| Re-export shim for gradual migration | Create shim at old path, mark `@deprecated` |
| Dynamic `import()` / `require()` | Search and rewrite same as static imports |
| String references (jest mocks, storybook, config) | Grep old path in all file types, not just code |
| CSS `@import` / `@use` | Rewrite SCSS/CSS imports too |
| Test files (`*.test.*`, `*.spec.*`) | Apply same rewrites |
| `tsconfig.json` `paths` entries | Remove or update entries for extracted folder |
| Monorepo workspace references | Update `package.json` workspace entries |
