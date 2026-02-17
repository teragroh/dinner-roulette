# Migration Guide: <module-name>

## Summary

`<module-name>` has been extracted from `<source-repo>` into a standalone
package at [`<new-repo-url>`](<new-repo-url>).

**Package:** `<new-package-name>`
**Minimum version:** `<version>`
**Migration difficulty:** Low | Medium | High

## Step 1 — Install the New Package

```bash
npm install <new-package-name>
```

For Java/Maven, add to `pom.xml`:
```xml
<dependency>
  <groupId><group></groupId>
  <artifactId><artifact></artifactId>
  <version><version></version>
</dependency>
```

## Step 2 — Update Imports

| Old import | New import |
|------------|-----------|
| `import { X } from "@/old/path"` | `import { X } from "<package>"` |

### Before

```typescript
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

### After

```typescript
import { Button } from "@acme/ui/button";
import { cn } from "@acme/ui/utils";
```

## Step 3 — Configuration Changes

<!-- List new env vars, removed config keys, changed defaults. -->
<!-- If none: "No configuration changes required." -->

## Breaking Changes

<!-- List removed exports, renamed symbols, changed signatures. -->
<!-- If none: "No breaking changes." -->

| Symbol | Change | Migration |
|--------|--------|-----------|
| `oldName()` | Renamed to `newName()` | Find-replace |

## Rollback

1. Uninstall the new package:
   ```bash
   npm uninstall <new-package-name>
   ```
2. Restore the old folder from git:
   ```bash
   git checkout <commit-before-removal> -- <old-folder-path>
   ```
3. Revert import changes:
   ```bash
   git checkout <commit-before-removal> -- <affected-files>
   ```

## Timeline

| Date | Milestone |
|------|-----------|
| <date> | New package published, old path still works (re-export shim) |
| <date> | Deprecation warnings added to old path |
| <date> | Old path removed — all consumers must have migrated |

## Questions?

Contact: <team or person> | Channel: <Slack/Teams channel>
