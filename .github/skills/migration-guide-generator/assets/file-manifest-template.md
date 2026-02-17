# Extraction Report: <feature-name>

## Summary

**Feature:** `<feature-name>`
**Source:** `<original-microservice>`
**Destination:** `<new-microservice>` ([repo](<new-repo-url>))
**Template:** `<template-url>` or N/A
**Date:** <date>

> The original microservice was **not modified**. This was a copy extraction.

---

## File Manifest

### Pages / Routes

| Status | File (original) | File (new service) | Changes |
|--------|----------------|-------------------|---------|
| 📋 | `src/pages/feature/Page.jsx` | `src/pages/feature/Page.jsx` | None |

### Components

| Status | File (original) | File (new service) | Changes |
|--------|----------------|-------------------|---------|
| 📋 | `src/components/Feature.jsx` | `src/components/Feature.jsx` | None |
| ✏️ | `src/components/FeatureForm.jsx` | `src/components/FeatureForm.jsx` | Updated API import path |

### Hooks / API / Data

| Status | File (original) | File (new service) | Changes |
|--------|----------------|-------------------|---------|
| ✏️ | `src/api/featureApi.js` | `src/api/featureApi.js` | Updated API base URL |
| ✏️ | `src/hooks/useFeature.js` | `src/hooks/useFeature.js` | Updated import paths |

### Styles

| Status | File (original) | File (new service) | Changes |
|--------|----------------|-------------------|---------|
| 📋 | `src/pages/feature/feature.css` | `src/pages/feature/feature.css` | None |

### Tests

| Status | File (original) | File (new service) | Changes |
|--------|----------------|-------------------|---------|
| ✏️ | `src/components/__tests__/Feature.test.js` | `src/components/__tests__/Feature.test.js` | Updated mock paths |
| ✏️ | `e2e/feature.spec.js` | `e2e/feature.spec.js` | Updated base URL |

### Configuration

| Status | Item | Type | Changes |
|--------|------|------|---------|
| ✏️ | `webpack.config.js` | Webpack | Added aliases for feature paths |
| 🆕 | `.env` | Environment | New env vars for service |
| 📐 | `package.json` | npm | From template + feature deps added |
| 📐 | `Dockerfile` | Docker | From template |
| 📐 | `Jenkinsfile` / `.github/workflows` | CI | From template |

### Shared Code

| Status | File | Decision | Notes |
|--------|------|----------|-------|
| 📋 | `shared/utils.js` | Copied (30 LOC) | Small utility, acceptable duplication |
| ➖ | `shared/authContext.js` | Not copied | New service uses template's auth |

### Cleanup Applied

| File | Action | Detail |
|------|--------|--------|
| `shared/utils.js` | Trimmed | Removed 3 unused functions, kept `formatDate()` |
| `components/FeatureForm.jsx` | Simplified | Removed feature-flag conditional |
| `package.json` | Pruned | Removed 4 unused dependencies |

---

## Config Diff

| Key | Original service | New service |
|-----|-----------------|-------------|
| `REACT_APP_API_URL` | `/api/original` | `/api/new-service` |
| `REACT_APP_FEATURE_FLAG` | `true` | Removed (always on) |

---

## Next Steps

- [ ] New service builds (`npm run build`)
- [ ] Jest tests pass (`npm test`)
- [ ] Playwright tests pass against new service
- [ ] Env vars configured in deployment
- [ ] CI/CD pipeline running
- [ ] Routing / proxy updated to serve new service
- [ ] Team notified
- [ ] Original service verified unchanged
