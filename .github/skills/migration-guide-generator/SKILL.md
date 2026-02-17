---
name: Migration Guide Generator
description: Generate a file manifest and migration report after copying a feature to a new microservice. Use at the end of an extraction workflow, on prompts like "document this migration", "generate migration report", or "what changed". Produces a detailed file manifest (copied/changed/new/deleted), configuration diff, conventional commit suggestions, and next-steps checklist. Does NOT modify the original microservice.
---

## Instructions

### Inputs

Gather from the extraction workflow:
- Feature name and original microservice name.
- New microservice name and repo URL.
- Template URL (if used).
- File manifest from the extraction (every file that was copied, created, or modified).
- Import/path changes applied (from import-path-updater).
- Config changes (env vars, Webpack aliases).
- Cleanup actions applied (if any).

### Workflow

1. Compile the file manifest using [assets/file-manifest-template.md](assets/file-manifest-template.md).
2. Fill every section with actual values.
3. Generate conventional commit messages.
4. Produce a next-steps checklist.
5. Validate: no unfilled placeholders remain.

### File Manifest Categories

Every file touched during extraction falls into one of these categories:

| Category | Symbol | Meaning |
|----------|--------|---------|
| **Copied** | 📋 | Duplicated from original service without changes |
| **Copied + Modified** | ✏️ | Duplicated then modified (imports, packages, config) |
| **New** | 🆕 | Created fresh (from template or hand-written for new service) |
| **Template** | 📐 | Came from the microservice template, unchanged |
| **Not moved** | ➖ | Stays only in original service (shared code accessed via API) |

### Conventional Commits

```
feat(<new-service>): extract <feature> from <original-service>

Copied <feature> frontend code to new microservice
scaffolded from <template>. Original service unchanged.

chore(<new-service>): scaffold from microservice template

refactor(<new-service>): update imports and paths for new service structure

chore(<new-service>): cleanup dead code and unused dependencies

docs(<new-service>): add extraction manifest and setup guide
```

### Next-Steps Checklist

Include in every report:

- [ ] New service builds (`npm run build`)
- [ ] Jest tests pass in new service
- [ ] Playwright tests pass against new service
- [ ] Environment variables configured in deployment
- [ ] CI/CD pipeline configured (from template or new)
- [ ] Routing / proxy updated to serve new service
- [ ] Team notified of new service location
- [ ] Original service still builds and all tests pass (should be unchanged)
