---
description: 'Review code changes for quality, security, and adherence to project standards'
agent: agent
tools: ['search']
---

# Review Changes

Review the current code changes in this workspace for:

## Checklist

### 🔴 Critical (must fix)
- Security vulnerabilities (hardcoded secrets, injection, auth bypass).
- Missing input validation on API endpoints.
- Data leaks (entities exposed instead of DTOs).
- Broken error handling (swallowed exceptions, missing error states).

### 🟡 Warnings (should fix)
- Missing test coverage for new logic.
- SOLID principle violations.
- Code duplication.
- Inconsistent naming.
- Missing loading/error states in UI components.

### 🔵 Suggestions (nice to have)
- Better naming opportunities.
- Refactoring for clarity.
- Performance improvements.
- Accessibility improvements.

## Output

For each finding:
1. File and location
2. Severity (🔴 / 🟡 / 🔵)
3. What's wrong
4. How to fix it

End with a summary: `X critical, Y warnings, Z suggestions`.
