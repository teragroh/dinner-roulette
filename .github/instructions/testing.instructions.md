---
applyTo: '**/*.test.{ts,tsx,java}'
---

# Testing Conventions

## General

- Follow TDD: write a failing test FIRST, then implement.
- One logical assertion per test.
- Tests must be independent — no shared mutable state between tests.
- Tests must be deterministic — same result every run.
- Name tests descriptively: `should_[expected]_when_[condition]`.

## Structure

Use Arrange-Act-Assert (AAA) for all tests:

```
// Arrange — set up test data and dependencies
// Act — execute the behavior under test
// Assert — verify the outcome
```

## Java (JUnit 5 + Mockito)

- Use `@ExtendWith(MockitoExtension.class)` for unit tests.
- Use `@SpringBootTest` + `@AutoConfigureMockMvc` for integration tests.
- Mock external dependencies with `@Mock` and inject with `@InjectMocks`.
- Use `when(...).thenReturn(...)` for stubbing.
- Use `verify(...)` to check interactions.
- Use `assertThrows()` for exception testing.

## TypeScript (Vitest + Testing Library)

- Use `describe` / `it` blocks for grouping.
- Use `render()` from Testing Library for component tests.
- Query elements by role, label, or text — not by CSS class or test ID.
- Use `screen` for queries after render.
- Use `userEvent` over `fireEvent` for user interactions.
- Mock API calls with `vi.mock()` or MSW.

## What NOT to Test

- Don't test implementation details (private methods, internal state).
- Don't test framework code (React rendering, Spring DI wiring).
- Don't test auto-generated code (Orval API clients, route tree).
