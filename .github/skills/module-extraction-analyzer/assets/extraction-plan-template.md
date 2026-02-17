## Extraction Plan

> ⚠️ **This is a COPY extraction.** The feature will remain in the original microservice. All files below will be duplicated into the new microservice.

### Feature
`<feature-name>` from `<original-service-name>`

### Template
`<template-url>` (or "none — scaffold from scratch")

---

### Files to Copy

#### Frontend (React JS)
| File | Target location in new service |
|------|-------------------------------|
| `<src/path/Component.jsx>` | `<template-mapped-path>` |

#### Backend (Spring Boot)
| File | Target location in new service |
|------|-------------------------------|
| `<src/main/java/.../Controller.java>` | `<template-mapped-path>` |

#### Tests
| File | Type | Target location |
|------|------|----------------|
| `<Component.test.js>` | Jest | `<path>` |
| `<feature.spec.js>` | Playwright | `<path>` |

#### Config / Environment
| Item | Type | Value / Notes |
|------|------|--------------|
| `<ENV_VAR>` | env var | Required in new service |
| `<property.key>` | Spring property | Copy to new application.properties |
| `<webpack alias>` | Webpack | Add to new webpack.config.js |

---

### Required Dependencies

#### npm (package.json)
| Package | Version | Notes |
|---------|---------|-------|
| `<pkg>` | `<ver>` | |

#### Maven (pom.xml)
| GroupId | ArtifactId | Version |
|--------|-----------|---------|
| `<group>` | `<artifact>` | `<ver>` |

---

### Shared Code Decisions

| File | LOC | Used by this feature | Also used by | Decision |
|------|-----|---------------------|-------------|----------|
| `<shared/utils.js>` | 30 | 3 files | 2 other features | Copy (small) |
| `<common/ApiClient.java>` | 200 | 5 files | 4 other features | Copy + adapt / Shared lib |

---

### Risks

- ⚠️ / 🛑 `<description>`

---

### Database Considerations

| Table | Owned by feature? | Shared? | Action |
|-------|--------------------|---------|--------|
| `<table>` | Yes | No | Create in new service DB |
| `<table>` | No | Yes — also used by `<other>` | New service calls original via API |

---

### Template Mapping

| Template provides | Feature needs | Status |
|-------------------|--------------|--------|
| Auth boilerplate | Auth filter | ✅ Use template's |
| Error handling | Custom error handler | ⚠️ Merge needed |
| CI pipeline | CI pipeline | ✅ Use template's |

---

**Approval required before proceeding.**
