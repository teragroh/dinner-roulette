---
name: Module Extraction Analyzer
description: Analyze a folder or module for safe extraction to a new repository. Use on prompts like "extract utils/ to new repo", "analyze deps for extraction", or any @workspace refactor/extract request. Scans files for imports, exports, and dependencies; classifies internal vs. external; flags circular or deep coupling; suggests minimal public API surface; outputs a structured Extraction Plan report.
---

## Instructions

### 1. Identify the Extraction Target

Confirm the exact folders and files the user wants to extract. If ambiguous, ask.

```
Target folder: <path>
Also consider: files outside the folder that are ONLY used by the target
```

Recursively list every file in the target. Use workspace search or `find`/`Get-ChildItem`.

### 2. Scan All Imports and Exports

For each file in the target, collect every import and every export.

**JS/TS:**
```bash
grep -rn "from ['\"]" <target> --include="*.ts" --include="*.tsx"
grep -rn "require(" <target> --include="*.js"
grep -rn "^export " <target> --include="*.ts" --include="*.tsx"
```

**Java:**
```bash
grep -rn "^import " <target> --include="*.java"
grep -rn "^public class\|^public interface\|^public enum" <target> --include="*.java"
```

**Python:**
```bash
grep -rn "^from \|^import " <target> --include="*.py"
```

### 3. Classify Dependencies

Sort every import into three buckets:

| Bucket | Definition | Action |
|--------|-----------|--------|
| **Internal** | Import resolves to another file inside the target | Moves as-is |
| **Shared** | Import resolves outside the target, but the imported file is also used elsewhere | Must be copied, published as a package, or parameterized |
| **External** | Third-party package (npm, Maven, PyPI) | Carry to new repo's dependency manifest |

For each Shared dependency, note:
- Which target files import it
- Which non-target files also import it
- Size of the imported file (lines of code)

### 4. Find Reverse Dependencies (Consumers)

Search the ENTIRE repo for files OUTSIDE the target that import FROM the target:

```bash
# JS/TS — find consumers of the target
grep -rn "from ['\"].*<target-path>" --include="*.ts" --include="*.tsx" | grep -v "<target>/"

# Java
grep -rn "import <target.package>" --include="*.java" | grep -v "<target>/"
```

Record every consumer and the specific symbols it imports.

### 5. Detect Coupling Risks

Apply these heuristics to flag risky extractions:

| Signal | Threshold | Recommendation |
|--------|-----------|----------------|
| Incoming imports from outside target | > 5 unique files | ⚠️ High coupling — recommend refactoring before extraction |
| Circular imports (A→B→A) | Any | 🛑 Must break cycle before extraction |
| Shared mutable state (singletons, global stores) | Any | ⚠️ Document carefully; may need interface boundary |
| Deep re-exports (barrel chains > 2 levels) | Any | ⚠️ Flatten before extraction |
| Target imports > 3 Shared files | > 3 | ⚠️ Consider extracting those shared files too |

To detect circular imports:
1. Build an adjacency list: file → [files it imports].
2. Run a depth-first traversal; flag back-edges.
3. Report each cycle with the full path.

### 6. Suggest Minimal Public API

Recommend a barrel export (`index.ts`, `__init__.py`, or module-info) that exposes only what consumers actually use (from step 4):

```typescript
// Suggested index.ts for the extracted package
export { Button } from "./components/button";
export { Input } from "./components/input";
export { Card, CardHeader, CardContent } from "./components/card";
// NOT exported: internal helpers, unused components
```

Principle: export only symbols that appear in reverse-dependency analysis. Everything else stays internal.

### 7. Suggest `package.json` (JS/TS) or Equivalent

Generate a dependency manifest from the External bucket:

```json
{
  "name": "@<org>/<module-name>",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "dependencies": {
    "<pkg>": "<version from source repo lockfile>"
  },
  "peerDependencies": {
    "react": "^19.0.0"
  }
}
```

For Java, suggest a `pom.xml` `<dependencies>` block. For Python, suggest `pyproject.toml` `[project.dependencies]`.

### 8. Output: Extraction Plan

Always produce this report format:

```markdown
## Extraction Plan

### Target
`<folder-path>` — <file-count> files

### Files to Copy
- `<file1>`
- `<file2>`
- ...

### Required Dependencies
| Package | Version | Type |
|---------|---------|------|
| <pkg>   | <ver>   | dependency / peerDependency |

### Shared Code Decisions
| File | Used by target | Also used by | Decision |
|------|---------------|-------------|----------|
| `lib/utils.ts` | 4 files | 3 external | Copy / Publish / Parameterize |

### Consumers to Update
| File | Imports |
|------|---------|
| `features/auth/Login.tsx` | `Button`, `Input` |

### Risks
- ⚠️ `<file>` has 7 incoming imports — high coupling
- 🛑 Circular: `A.ts` → `B.ts` → `A.ts`

### Suggested Public API
```ts
export { ... } from "...";
```

### Suggested package.json
```json
{ ... }
```
```

Present this report to the user. Do NOT proceed to file moves or import rewrites without explicit confirmation.
