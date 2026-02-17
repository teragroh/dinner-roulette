## Extraction Plan

### Target
`<folder-path>` — <file-count> files

### Files to Copy
- `<file1>`
- `<file2>`

### Required Dependencies
| Package | Version | Type |
|---------|---------|------|
| <pkg> | <ver> | dependency / peerDependency |

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
{
  "name": "@<org>/<module>",
  "version": "0.1.0",
  "dependencies": {}
}
```
