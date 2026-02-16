---
name: Git Conventions
description: Conventional commits, branch naming, PR templates, squash merging, changelog generation, and release tagging.
---

## Overview

This skill provides git workflow conventions for the project.

## Instructions

### Conventional Commits

Every commit message follows this format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Types

| Type | When |
|------|------|
| `feat` | New feature |
| `fix` | Bug fix |
| `test` | Adding or updating tests |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `docs` | Documentation only |
| `chore` | Build process, tooling, dependencies |
| `style` | Formatting, white-space (no logic change) |
| `perf` | Performance improvement |
| `ci` | CI/CD changes |
| `revert` | Reverting a previous commit |

#### Scopes (optional)

| Scope | Area |
|-------|------|
| `recipe` | Recipe domain |
| `user` | User domain |
| `auth` | Authentication/authorization |
| `ui` | Frontend |
| `api` | API contract/OpenAPI |
| `db` | Database/migrations |
| `config` | Configuration |
| `deps` | Dependencies |

#### Examples

```
feat(recipe): add random recipe selection endpoint
fix(auth): handle expired refresh token gracefully
test(recipe): add unit tests for RecipeService.getRandomRecipe
refactor(ui): extract recipe card into separate component
docs: update README with local setup instructions
chore(deps): update Spring Boot to 4.0.1
ci: add Playwright E2E stage to pipeline
```

### Branch Naming

```
<type>/<ticket-or-short-description>
```

Examples:
```
feat/recipe-favorites
fix/login-token-refresh
test/karate-recipe-crud
chore/upgrade-spring-boot
```

### Branch Strategy

```
main          ← Production-ready code
  └── develop ← Integration branch
       ├── feat/recipe-favorites
       ├── fix/login-bug
       └── test/add-karate-tests
```

- Feature branches are created from `develop`.
- PRs merge into `develop` via squash merge.
- `develop` is merged into `main` for releases.

### Pull Request Guidelines

- Title follows conventional commit format: `feat(recipe): add favorites feature`.
- Description explains WHAT and WHY, not just HOW.
- Link to PractiTest test cases or requirements if applicable.
- Include screenshots for UI changes.
- Keep PRs small — one feature/fix per PR.
- Self-review before requesting team review.

### Squash Merging

- Always squash merge feature branches into `develop`.
- The squash commit message should be a clean conventional commit.
- Delete the source branch after merge.

### Release Tagging

```
v1.0.0    — Major release (breaking changes)
v1.1.0    — Minor release (new features)
v1.1.1    — Patch release (bug fixes)
```

Follow Semantic Versioning (SemVer).

### .gitignore Essentials

Never commit:
- `.env` files (secrets)
- `node_modules/`
- `target/` (Maven build output)
- IDE files (`.idea/`, `.vscode/` — except `settings.json`)
- OS files (`.DS_Store`, `Thumbs.db`)
- Build artifacts
- Test result files
