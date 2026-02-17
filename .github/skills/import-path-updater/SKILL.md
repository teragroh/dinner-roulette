---
name: Import Path Updater
description: Rewrite imports across a codebase after extracting a module to a new package or repo. Use after an extraction is complete, on prompts like "fix imports in original repo", "update imports to use new package", or any post-move refactor. Handles relative paths, path aliases, tsconfig paths, barrel exports, and named imports. Always runs a dry-run first before applying changes.
---

## Instructions

### Prerequisites

Before running, you need:
1. The **old import pattern** (what imports look like today).
2. The **new package name** or path (what imports should become).
3. The list of **consumer files** to update (from the module-extraction-analyzer report, or scan the repo).

### 1. Gather Current Import Patterns

Search the repo for every import that references the extracted module's old path:

```bash
# JS/TS — find all imports referencing the old path
grep -rn "from ['\"]@/old/path\|from ['\"]\.\.\/.*old/path\|from ['\"]old-package" \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"

# Java
grep -rn "import old\.package\.name" --include="*.java"

# Python
grep -rn "from old_package\|import old_package" --include="*.py"
```

Collect every unique import statement and the file it appears in.

### 2. Check for Path Aliases and Config

Before rewriting, inspect path alias configuration so rewrites are correct:

**JS/TS — check tsconfig.json:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"]
    }
  }
}
```

**Vite/Webpack — check resolve.alias in config.**

**Python — check package structure and `__init__.py` re-exports.**

If the extracted module was accessed via an alias, decide:
- Remove the alias entry (if the entire path is gone).
- Update the alias to point to `node_modules/<new-package>` (rarely needed — direct import is simpler).

### 3. Build the Rewrite Map

Create an explicit mapping from old imports to new imports:

```markdown
## Import Rewrite Map

| Old import | New import | Files affected |
|------------|-----------|---------------|
| `from "@/components/ui/button"` | `from "@acme/ui/button"` | 12 |
| `from "@/components/ui/card"` | `from "@acme/ui/card"` | 8 |
| `from "@/components/ui"` | `from "@acme/ui"` | 3 |
| `from "../../lib/utils"` | `from "@acme/utils"` | 5 |
```

Rules:
- Prefer **named imports** over default imports.
- If the new package has a barrel export (`index.ts`), prefer importing from the barrel.
- Keep import granularity consistent with the new package's public API.
- Preserve `type` imports (`import type { ... }`) — do not merge with value imports.

### 4. Dry-Run (Always First)

Present the full list of changes WITHOUT applying them:

```markdown
## Dry-Run Results

### Changes to apply: <count> imports across <count> files

#### `src/features/auth/components/LoginForm.tsx`
```diff
- import { Button, Input } from "@/components/ui";
+ import { Button, Input } from "@acme/ui";
```

#### `src/features/recipes/components/RecipeCard.tsx`
```diff
- import { Card, CardHeader } from "@/components/ui/card";
+ import { Card, CardHeader } from "@acme/ui/card";
```

### No changes needed:
- `src/app.tsx` — no matching imports
```

**Wait for user confirmation** before applying. If the user says "apply" or "looks good", proceed to step 5.

### 5. Apply Changes

Apply each rewrite using file edit tools. For each file:
1. Read the file to get exact current content.
2. Replace the old import with the new import, preserving:
   - Surrounding whitespace and blank lines.
   - Import ordering conventions (if a linter enforces it).
   - Comments adjacent to the import.
3. Verify no duplicate imports were created.

### 6. Handle Edge Cases

| Edge case | Resolution |
|-----------|-----------|
| **Re-export shim** | If gradual migration is needed, create a shim file at the old path that re-exports from the new package. Mark it `@deprecated`. |
| **Dynamic imports** | Search for `import()` and `require()` with the old path. Rewrite those too. |
| **String references** | Search for the old path in non-import contexts: jest mocks, storybook stories, config files. |
| **CSS/SCSS imports** | Search `@import` and `@use` for old paths. |
| **Test files** | Apply same rewrites to `*.test.*`, `*.spec.*`, and `__tests__/` directories. |
| **Aliases in tsconfig** | Remove or update `paths` entries that pointed to the extracted folder. |
| **Monorepo workspace refs** | Update `package.json` workspace references if applicable. |

### 7. Verify

After applying all changes:

```bash
# JS/TS — confirm no old imports remain
grep -rn "from ['\"]@/old/path" --include="*.ts" --include="*.tsx"
# Should return 0 results

# Build to catch any broken references
npm run build
npm run lint
npm test
```

If any old imports remain, report them and offer to fix.

### 8. Output Summary

```markdown
## Import Update Summary

- **Files modified:** <count>
- **Imports rewritten:** <count>
- **Old path pattern:** `@/components/ui`
- **New package:** `@acme/ui`
- **Re-export shims created:** <count> (if any)
- **Remaining manual fixes:** <list or "none">
```
