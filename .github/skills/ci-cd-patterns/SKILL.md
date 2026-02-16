---
name: CI/CD Patterns
description: GitHub Actions workflows, test stages, artifact handling, environment promotion, branch protection, and quality gates.
---

## Overview

This skill provides CI/CD pipeline patterns for the project using GitHub Actions.

## Instructions

### Pipeline Stages (ordered by speed)

```
1. Lint & Compile     (~30s)   — Fast fail on syntax/format errors
2. Unit Tests         (~1-2m)  — JUnit + Vitest
3. API Tests          (~3-5m)  — Karate (needs running backend + DB)
4. E2E Tests          (~5-10m) — Playwright (needs running frontend + backend)
5. Report             (~30s)   — Push results to PractiTest
6. Deploy (on main)   (~2-5m)  — Deploy to target environment
```

### Workflow Structure

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

env:
  JAVA_VERSION: "17"
  NODE_VERSION: "22"

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { java-version: ${{ env.JAVA_VERSION }}, distribution: temurin }
      - uses: actions/setup-node@v4
        with: { node-version: ${{ env.NODE_VERSION }} }
      - run: ./mvnw compile -q
      - working-directory: ui
        run: |
          npm ci --prefer-offline
          npm run check

  unit-tests:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { java-version: ${{ env.JAVA_VERSION }}, distribution: temurin }
      - uses: actions/setup-node@v4
        with: { node-version: ${{ env.NODE_VERSION }} }
      - name: Backend tests
        run: ./mvnw test
      - name: Frontend tests
        working-directory: ui
        run: |
          npm ci --prefer-offline
          npm run test

  api-tests:
    needs: unit-tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: DinnerRoulette
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: password
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { java-version: ${{ env.JAVA_VERSION }}, distribution: temurin }
      - name: Run Karate tests
        run: ./mvnw test -Dtest=KarateRunner
        env:
          SPRING_DATASOURCE_URL: jdbc:postgresql://localhost:5432/DinnerRoulette
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: karate-results
          path: target/karate-reports/

  e2e-tests:
    needs: unit-tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: ${{ env.NODE_VERSION }} }
      - working-directory: ui
        run: |
          npm ci --prefer-offline
          npx playwright install --with-deps
          npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: ui/playwright-report/
```

### Caching

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.m2/repository
    key: maven-${{ hashFiles('pom.xml') }}

- uses: actions/cache@v4
  with:
    path: ui/node_modules
    key: npm-${{ hashFiles('ui/package-lock.json') }}
```

### Branch Protection Rules

Configure in GitHub Settings → Branches:

- ✅ Require status checks: `lint`, `unit-tests`
- ✅ Require branches to be up to date before merging
- ✅ Require at least 1 approving review
- ✅ Dismiss stale reviews when new commits are pushed
- ✅ Require Copilot code review (optional)
- ❌ Do NOT require `e2e-tests` to pass (can be flaky — monitor, don't block)

### Environment Promotion

```
develop branch → auto-deploy to staging
main branch    → manual approval → deploy to production
```

### Quality Gates Summary

| Gate | Blocks Merge? | Tool |
|------|:---:|------|
| Compile | ✅ | Maven, TypeScript |
| Lint + Format | ✅ | Biome |
| Unit tests | ✅ | JUnit, Vitest |
| API tests | ✅ | Karate |
| E2E tests | ⚠️ Optional | Playwright |
| Code review | ✅ | Human + Copilot |
| Security scan | ✅ | Dependabot / npm audit |
