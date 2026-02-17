## Extraction Plan

> ⚠️ **This is a COPY extraction.** The feature will remain in the original microservice. All files below will be duplicated into the new microservice.

### Feature
`<feature-name>` from `<original-service-name>`

### Template
`<template-url>` (or "none — scaffold from scratch")

---

### Discovered Feature Files

> These files were identified via codebase research. They are scattered across the project, not in a single folder.

#### Pages / Routes
| File | Current location | Target location in new service |
|------|-----------------|-------------------------------|
| `<Page.jsx>` | `src/pages/scheduling/SchedulePage.jsx` | `<template-mapped-path>` |

#### Components
| File | Current location | Target location in new service |
|------|-----------------|-------------------------------|
| `<Component.jsx>` | `src/components/calendar/CalendarView.jsx` | `<template-mapped-path>` |

#### Hooks
| File | Current location | Target location in new service |
|------|-----------------|-------------------------------|
| `<hook.js>` | `src/hooks/useSchedule.js` | `<template-mapped-path>` |

#### API / Data
| File | Current location | Target location in new service |
|------|-----------------|-------------------------------|
| `<api.js>` | `src/api/scheduleApi.js` | `<template-mapped-path>` |
| `<slice.js>` | `src/store/scheduleSlice.js` | `<template-mapped-path>` |

#### Styles
| File | Current location | Target location in new service |
|------|-----------------|-------------------------------|
| `<styles.css>` | `src/pages/scheduling/schedule.css` | `<template-mapped-path>` |

#### Tests
| File | Current location | Type | Target location |
|------|-----------------|------|----------------|
| `<test.js>` | `src/components/calendar/__tests__/CalendarView.test.js` | Jest | `<path>` |
| `<spec.js>` | `e2e/scheduling.spec.js` | Playwright | `<path>` |

#### Config / Environment
| Item | Current location | Type | Value / Notes |
|------|-----------------|------|--------------|
| `<ENV_VAR>` | `.env` | env var | Required in new service |
| `<webpack alias>` | `webpack.config.js` | Webpack | Replicate in new service |

---

### Required Dependencies (npm)

| Package | Version | Notes |
|---------|---------|-------|
| `<pkg>` | `<ver>` | |

---

### Shared Code Decisions

> These files are used by the feature AND by other parts of the original service.

| File | Current location | LOC | Used by this feature | Also used by | Decision |
|------|-----------------|-----|---------------------|-------------|----------|
| `<utils.js>` | `src/shared/utils.js` | 30 | 3 feature files | 2 other features | Copy (small) |
| `<ApiClient.js>` | `src/api/apiClient.js` | 200 | 5 feature files | 4 other features | Copy + adapt |

---

### Risks

- ⚠️ / 🛑 `<description>`

---

### Template Mapping

| Template provides | Feature needs | Status |
|-------------------|--------------|--------|
| Auth boilerplate | Auth context/HOC | ✅ Use template's |
| Error boundary | Custom error handler | ⚠️ Merge needed |
| CI pipeline | CI pipeline | ✅ Use template's |

---

### Optional: Cleanup Candidates

> Dead code, unused imports, and unnecessary dependencies that can be removed from the copied files.

| File | Cleanup action | Reason |
|------|---------------|--------|
| `<utils.js>` | Remove 3 unused functions | Only `formatDate()` is used by this feature |
| `<Component.jsx>` | Remove feature-flag check | Feature is always on in new service |

---

**Approval required before proceeding.**
