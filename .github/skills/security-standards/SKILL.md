---
name: Security Standards
description: OWASP Top 10, JWT best practices, input validation, CORS, CSP headers, secrets management, and dependency scanning.
---

## Overview

This skill provides security standards and patterns based on OWASP Top 10 (2021) for the project.

## Instructions

### A01:2021 — Broken Access Control

```java
// ✅ Always scope data to the authenticated user
public RecipeResponseDTO getRecipe(Long recipeId, Long userId) {
    Recipe recipe = repository.findByIdAndUserId(recipeId, userId)
        .orElseThrow(() -> new RecipeNotFoundException("Recipe not found"));
    return mapper.toDto(recipe);
}

// ❌ Never return data without ownership check
public RecipeResponseDTO getRecipe(Long recipeId) {
    return repository.findById(recipeId)  // Any user can access any recipe!
        .map(mapper::toDto).orElseThrow();
}
```

### A02:2021 — Cryptographic Failures

- Store passwords with bcrypt (work factor ≥ 10):
  ```java
  new BCryptPasswordEncoder(12)
  ```
- JWT secrets must be ≥ 256 bits and loaded from environment variables.
- Never log tokens, passwords, or PII.
- Use HTTPS in all non-local environments.

### A03:2021 — Injection

```java
// ✅ JPA parameterized queries (safe)
@Query("SELECT r FROM Recipe r WHERE r.name = :name AND r.user.id = :userId")
Optional<Recipe> findByNameAndUserId(@Param("name") String name, @Param("userId") Long userId);

// ❌ String concatenation (SQL injection risk!)
@Query("SELECT r FROM Recipe r WHERE r.name = '" + name + "'")
```

Frontend XSS prevention:
```tsx
// ✅ React auto-escapes by default — this is safe
<p>{userInput}</p>

// ❌ Never use dangerouslySetInnerHTML with user input
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### A04:2021 — Insecure Design

- Validate all input on the server, even if validated on the client.
- Rate limit authentication endpoints.
- Set maximum page sizes for pagination (e.g., 100).
- Implement request body size limits.

### A05:2021 — Security Misconfiguration

```java
// Spring Security configuration
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())  // Disabled for stateless JWT API
        .cors(cors -> cors.configurationSource(corsConfig()))
        .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
            .anyRequest().authenticated()
        );
    return http.build();
}
```

CORS configuration:
```java
// ✅ Restrictive CORS
CorsConfiguration config = new CorsConfiguration();
config.setAllowedOrigins(List.of("https://app.example.com"));
config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
config.setAllowedHeaders(List.of("Authorization", "Content-Type"));

// ❌ Never in production
config.setAllowedOrigins(List.of("*"));
```

### A07:2021 — Identification and Authentication Failures

JWT best practices:
```java
// Access token: short-lived (15 minutes)
jwt.access-token-expiration=900000

// Refresh token: longer-lived (7 days), rotate on use
jwt.refresh-token-expiration=604800000
```

- Implement refresh token rotation (invalidate old token on use).
- Return generic error messages for login failures ("Invalid credentials" not "User not found").
- Lock accounts after N failed attempts (optional).

### A09:2021 — Security Logging and Monitoring

```java
// Log security events
log.warn("Failed login attempt for email: {}", maskEmail(email));
log.info("User {} accessed resource {}", userId, resourceId);
log.error("Unauthorized access attempt by user {} on resource {}", userId, resourceId);

// Never log
log.info("User logged in with password: {}", password);     // ❌
log.info("JWT token: {}", token);                            // ❌
```

### Dependency Security

- Run `./mvnw dependency:check` to scan Java dependencies.
- Run `npm audit` to scan Node.js dependencies.
- Enable GitHub Dependabot for automated dependency updates.
- Pin dependency versions in `pom.xml` and `package.json`.

### Security Headers

```java
http.headers(headers -> headers
    .contentTypeOptions(Customizer.withDefaults())     // X-Content-Type-Options: nosniff
    .frameOptions(frame -> frame.deny())               // X-Frame-Options: DENY
    .httpStrictTransportSecurity(hsts -> hsts           // HSTS
        .includeSubDomains(true)
        .maxAgeInSeconds(31536000))
);
```
