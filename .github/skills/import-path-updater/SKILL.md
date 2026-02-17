---
name: Import Path Updater
description: Rewrite imports and paths in the NEW microservice after copying a feature from an existing service. Use on prompts like "fix imports in new microservice", "update paths after extraction", or any post-copy refactor. Handles Webpack aliases, relative paths, Jest mock paths, Playwright test references, Spring Boot package names, and property file keys. Always runs a dry-run first before applying changes. The original microservice is NOT modified.
---

## Instructions

### Key Principle

Only the **new microservice** gets import rewrites. The original stays untouched. The goal is to make the copied feature compile and run in the new service's directory structure.

### Inputs

1. **Original path structure** — where files lived in the source service.
2. **New path structure** — where files now live in the new service (from template mapping).
3. **Package rename** — old Java package → new Java package (e.g., `com.corp.original.feature` → `com.corp.newservice.feature`).
4. **Webpack alias changes** — old aliases → new aliases (if the template uses different conventions).

### Workflow

1. **Scan** — grep every copied file for imports referencing old paths. Include `.js`, `.jsx`, `.java`, `.css`, `.scss`, test files, config files.
2. **Check Webpack aliases** — read the new service's `webpack.config.js` `resolve.alias`. Map old aliases to new ones.
3. **Check Spring packages** — the copied Java files still reference the old package. Build the rename map.
4. **Build rewrite map** — explicit table: old path/import → new path/import → files affected. Rules:
   - JS: update relative paths to match new directory structure.
   - JS: update Webpack alias references if alias names changed.
   - Java: update `package` declarations and all `import` statements.
   - Properties: update property key prefixes if namespaced by service.
   - Jest: update `jest.mock()` paths and module name mapper entries.
5. **Dry-run** — present all changes as diffs. **Wait for user confirmation.**
6. **Apply** — rewrite each import/package, preserving whitespace and comments.
7. **Handle edge cases** — see table below.
8. **Verify** — build + lint + test the new service. Grep for any old paths remaining.
9. **Output summary** — files modified, imports rewritten, remaining manual fixes.

### Edge Cases

| Case | Resolution |
|------|-----------|
| Webpack `resolve.alias` differs between services | Map old alias → new alias in rewrite map |
| `jest.moduleNameMapper` in package.json or jest.config | Update mapper entries for new paths |
| Playwright test selectors referencing old service URLs | Update base URLs to new service |
| `process.env.*` variable names changed | Search-replace env var names in JS files |
| Spring `@ComponentScan` or `@EntityScan` base packages | Update to new package prefix |
| Shared utility copied to different path | Update all internal references to new location |
| Hardcoded API paths (e.g., `/api/original-service/...`) | Update to new service's API prefix |
