---
description: 'TDD a new feature — writes failing tests first, then implements'
agent: agent
tools: ['editFiles', 'runInTerminal', 'search']
---

# TDD Feature

I want to TDD the following feature: **${input:featureDescription}**

Follow this exact process:

## Step 1: Plan
- Break the feature into small, testable behaviors.
- Identify which layer each behavior belongs to (service, controller, component).
- List the files that need to be created or modified.

## Step 2: Backend TDD (if applicable)
For each behavior, starting with the simplest:
1. Write a failing unit test (JUnit 5 + Mockito) in `src/test/java/`.
2. Run it to confirm failure.
3. Write the minimal implementation in `src/main/java/` to pass.
4. Run the test to confirm it passes.
5. Refactor if needed.

## Step 3: Frontend TDD (if applicable)
For each behavior:
1. Write a failing test (Vitest + Testing Library) in `ui/src/`.
2. Run it to confirm failure.
3. Write the minimal component/hook implementation to pass.
4. Run the test to confirm it passes.
5. Refactor if needed.

## Step 4: Integration
- If a new API endpoint was created, regenerate the Orval client: `cd ui && npm run generate-api`.
- Wire up the frontend to the backend using TanStack Query hooks.

## Rules
- Never write production code without a failing test.
- Use constructor injection in Java.
- Use TanStack Query for server state in React.
- Follow existing project patterns.
