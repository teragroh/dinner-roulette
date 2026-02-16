---
applyTo: 'src/main/java/**/*.java'
---

# Java / Spring Boot Conventions

## Architecture

- Follow layered architecture: Controller → Service → Repository.
- Controllers handle HTTP concerns only — delegate business logic to services.
- Services return DTOs, never JPA entities.
- Use mapper classes in `mapper/` packages to convert between entities and DTOs.
- Keep domain logic within the appropriate domain package (`recipe/`, `user/`).
- Shared code goes in `common/` (DTOs, exceptions, models).

## Dependency Injection

- Always use constructor injection. Never use `@Autowired` on fields.
- Mark injected fields as `private final`.

```java
// ✅ Correct
private final RecipeRepository repository;

public RecipeService(RecipeRepository repository) {
    this.repository = repository;
}

// ❌ Wrong
@Autowired
private RecipeRepository repository;
```

## Validation

- Annotate request DTOs with Jakarta Validation (`@NotBlank`, `@Size`, `@Email`, etc.).
- Use `@Valid` on controller method parameters to trigger validation.
- Handle `MethodArgumentNotValidException` in `@RestControllerAdvice`.

## Error Handling

- Use custom exception classes in `exception/` packages per domain.
- Handle all exceptions globally with `@RestControllerAdvice`.
- Return `ResponseEntity<>` with appropriate HTTP status codes.
- Never expose stack traces or internal details in API responses.

## Testing

- Write unit tests with JUnit 5 + Mockito.
- Write integration tests with `@SpringBootTest` + MockMvc.
- Follow TDD: write a failing test first, then implement.
- Name tests descriptively: `should_[expected]_when_[condition]`.
- Use Arrange-Act-Assert or Given-When-Then pattern.
- Test files live in `src/test/java/` mirroring the main source structure.

## Naming

- Classes: `PascalCase` — `RecipeService`, `IngredientDTO`.
- Methods: `camelCase` — `findByName()`, `createRecipe()`.
- Constants: `UPPER_SNAKE_CASE` — `MAX_FILE_SIZE`.
- Packages: lowercase — `controller`, `service`, `repository`.
- DTOs: suffix with `DTO` — `RecipeRequestDTO`, `RecipeResponseDTO`.

## Security

- JWT authentication is handled via Spring Security filters in `config/security/`.
- Never hardcode secrets — use environment variables (`JWT_SECRET`).
- Protect endpoints with appropriate `@PreAuthorize` or security config.
