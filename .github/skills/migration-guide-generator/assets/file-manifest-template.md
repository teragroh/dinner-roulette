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

### Frontend (React JS)

| Status | File (original) | File (new service) | Changes |
|--------|----------------|-------------------|---------|
| 📋 | `src/features/X/Component.jsx` | `src/features/X/Component.jsx` | None |
| ✏️ | `src/features/X/api.js` | `src/features/X/api.js` | Updated API base URL |
| 🆕 | — | `src/config/newService.js` | New config for service |
| 📐 | — | `src/App.jsx` | From template |

### Backend (Spring Boot)

| Status | File (original) | File (new service) | Changes |
|--------|----------------|-------------------|---------|
| ✏️ | `src/.../FeatureController.java` | `src/.../FeatureController.java` | Package renamed |
| ✏️ | `src/.../FeatureService.java` | `src/.../FeatureService.java` | Package renamed |
| 📋 | `src/.../FeatureDTO.java` | `src/.../FeatureDTO.java` | None |
| 📐 | — | `src/.../Application.java` | From template |

### Tests

| Status | File (original) | File (new service) | Changes |
|--------|----------------|-------------------|---------|
| ✏️ | `src/.../Component.test.js` | `src/.../Component.test.js` | Updated mock paths |
| ✏️ | `e2e/feature.spec.js` | `e2e/feature.spec.js` | Updated base URL |

### Configuration

| Status | Item | Type | Changes |
|--------|------|------|---------|
| ✏️ | `application.properties` | Spring | Added feature properties, new DB URL |
| ✏️ | `webpack.config.js` | Webpack | Added aliases for feature paths |
| 🆕 | `.env` | Environment | New env vars for service |
| 📐 | `Dockerfile` | Docker | From template |
| 📐 | `Jenkinsfile` / `.github/workflows` | CI | From template |

### Shared Code

| Status | File | Decision | Notes |
|--------|------|----------|-------|
| 📋 | `shared/utils.js` | Copied (30 LOC) | Small utility, acceptable duplication |
| ➖ | `common/AuthClient.java` | Not copied | New service calls original via API |

---

## Database

| Table | Action | Notes |
|-------|--------|-------|
| `<feature_table>` | Created in new service DB | Migration script: `V1__create_feature_table.sql` |
| `<shared_table>` | Not copied | Accessed via API to original service |

---

## Config Diff

| Key | Original service | New service |
|-----|-----------------|-------------|
| `API_BASE_URL` | `/api/original` | `/api/new-service` |
| `DB_URL` | `jdbc:...original_db` | `jdbc:...new_db` |
| `<FEATURE_ENV_VAR>` | `value` | `value` (same) |

---

## Next Steps

- [ ] New service builds (`npm run build` / `mvn clean verify`)
- [ ] Jest tests pass
- [ ] Playwright tests pass against new service
- [ ] Database migrations applied
- [ ] Env vars configured in deployment
- [ ] CI/CD pipeline running
- [ ] API gateway routing updated
- [ ] Team notified
- [ ] Original service verified unchanged
