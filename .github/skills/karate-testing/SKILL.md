---
name: Karate Testing
description: Karate API test patterns — feature file structure, configuration, karate-config.js, environment switching, JWT/Bearer authentication setup, data-driven tests, match/fuzzy assertions, schema validation, reusable features (call/callonce/callSingle), test doubles and mock servers, parallel execution, hooks and lifecycle, project structure, and best practices. Based on official Karate v1.5 documentation.
---

## Overview

Comprehensive patterns for writing Karate API tests in the Dinner Roulette project. Sourced from the official Karate documentation at https://docs.karatelabs.io.

For quick-reference tables, mock server patterns, and advanced topics see:
- [references/assertions.md](references/assertions.md) — fuzzy markers, `match` variants, schema validation
- [references/mock-servers.md](references/mock-servers.md) — test doubles, stateful mocks, proxy mode
- [references/advanced.md](references/advanced.md) — hooks, parallel execution, Java interop, karate object API

## Instructions

### Feature File Structure

```gherkin
@recipes @regression
Feature: Recipe CRUD API
  Validate recipe create, read, update, delete operations.

  Background:
    * url baseUrl
    * def auth = callonce read('classpath:auth/login.feature')
    * header Authorization = 'Bearer ' + auth.token

  @smoke @PT-1010
  Scenario: Create a recipe
    Given path '/api/recipes'
    And request { name: 'Tacos', description: 'Mexican tacos', cookTimeMinutes: 30 }
    When method POST
    Then status 201
    And match response.name == 'Tacos'
    And match response.id == '#number'
    And match response.createdAt == '#string'

  @PT-1011
  Scenario: Get recipe by ID
    * def created = call read('create-recipe.feature')
    Given path '/api/recipes', created.id
    When method GET
    Then status 200
    And match response.id == created.id

  @PT-1012
  Scenario: Fail to create recipe without name
    Given path '/api/recipes'
    And request { description: 'No name' }
    When method POST
    Then status 400
    And match response.errors[0].field == 'name'
```

#### Key Rules

- One feature file per API resource or workflow.
- Always include `Background` for shared setup (base URL, auth).
- Test happy paths AND error cases (400, 401, 403, 404, 409).
- Use `match` assertions — never just check status codes.
- Prefer `*` (star) syntax for technical API tests; `Given/When/Then` for business-readable scenarios.
- Tag with `@smoke`, `@regression`, and `@PT-NNNN` for PractiTest mapping.
- Feature files use `kebab-case.feature` naming.
- Each scenario must be independent — runnable in any order, especially for parallel execution.

### Environment Configuration

```javascript
// karate-config.js — placed in src/test/java/
function fn() {
  var env = karate.env || 'dev';
  karate.log('karate.env:', env);

  var config = {
    env: env,
    baseUrl: 'http://localhost:8080'
  };

  if (env === 'staging') {
    config.baseUrl = 'https://staging-api.example.com';
  } else if (env === 'prod') {
    config.baseUrl = 'https://api.example.com';
    karate.configure('ssl', true);
  }

  // Global timeouts
  karate.configure('connectTimeout', 5000);
  karate.configure('readTimeout', 30000);

  // Dev-mode logging
  if (env === 'dev') {
    karate.configure('logPrettyRequest', true);
    karate.configure('logPrettyResponse', true);
  }

  return config;
}
```

Run with environment: `mvn test -Dkarate.env=staging`

#### Environment-Specific Overrides

Create `karate-config-<env>.js` alongside `karate-config.js`. Values merge automatically:

```javascript
// karate-config-dev.js
function fn() {
  return {
    baseUrl: 'http://localhost:8080',
    debugMode: true,
    mockExternalServices: true
  };
}
```

Load order: `karate-base.js` → `karate-config.js` → `karate-config-<env>.js`

### Authentication Setup (JWT / Bearer Token)

#### Reusable Login Feature

```gherkin
# auth/login.feature
@ignore
Feature: Login helper

  Scenario: Get auth token
    Given url baseUrl
    And path '/api/auth/login'
    And request { email: 'test@example.com', password: 'password123' }
    When method POST
    Then status 200
    * def token = response.accessToken
```

#### Using in Tests

```gherkin
Background:
  * url baseUrl
  # callonce — runs login ONCE per feature, cached for all scenarios
  * def auth = callonce read('classpath:auth/login.feature')
  * header Authorization = 'Bearer ' + auth.token
```

#### Global Auth via karate-config.js

```javascript
function fn() {
  var config = { baseUrl: 'http://localhost:8080' };

  // Runs once globally across ALL features, even in parallel
  var auth = karate.callSingle('classpath:auth/login.feature');
  config.authToken = auth.token;

  karate.configure('headers', {
    Authorization: 'Bearer ' + config.authToken
  });

  return config;
}
```

#### Auth Hierarchy

| Scope | Mechanism | Runs |
|-------|-----------|------|
| Per scenario | `call read('login.feature')` | Every scenario |
| Per feature | `callonce read('login.feature')` in Background | Once per feature |
| Global | `karate.callSingle()` in karate-config.js | Once across all features |

### Data-Driven Testing

```gherkin
Scenario Outline: Validate recipe creation with various inputs
  Given path '/api/recipes'
  And request { name: '<name>', cookTimeMinutes: <cookTime> }
  When method POST
  Then status <status>

  Examples:
    | name           | cookTime | status |
    | Valid Recipe    | 30       | 201    |
    |                | 30       | 400    |
    | Valid Recipe    | -1       | 400    |
    | A              | 0        | 201    |
```

#### Data-Driven Calling

```gherkin
# Call a feature once per element in an array
* table users
  | name   | role    |
  | 'John' | 'admin' |
  | 'Jane' | 'user'  |
* def results = call read('create-user.feature') users
* match results == '#[2]'
```

### Match & Assertions Quick Reference

| Operator | Purpose | Example |
|----------|---------|---------|
| `match ==` | Exact equality | `match response == { id: 1 }` |
| `match !=` | Not equals | `match response.status != 'error'` |
| `match contains` | Subset match | `match response contains { name: 'John' }` |
| `match !contains` | Does not contain | `match response !contains { deleted: true }` |
| `match contains only` | Exact elements, any order | `match items contains only [3, 1, 2]` |
| `match contains any` | At least one match | `match tags contains any ['a', 'b']` |
| `match contains deep` | Recursive subset | `match response contains deep { user: { name: 'John' } }` |
| `match each` | Validate every array element | `match each response == { id: '#number' }` |
| `match header` | Case-insensitive header | `match header Content-Type contains 'json'` |
| `assert` | Boolean expression (>, <) | `assert responseTime < 1000` |

### Fuzzy Markers

| Marker | Validates |
|--------|-----------|
| `#ignore` | Skip validation |
| `#null` | Must be null (key exists) |
| `#notnull` | Must not be null |
| `#present` | Key must exist |
| `#notpresent` | Key must not exist |
| `#string` | Must be a string |
| `#number` | Must be a number |
| `#boolean` | Must be boolean |
| `#array` | Must be an array |
| `#object` | Must be an object |
| `#uuid` | Must be UUID format |
| `#regex STR` | Must match regex (double-escape: `#regex a\\.b`) |
| `#? EXPR` | Custom JS expression, `_` = current value |
| `#[N]` | Array of exactly N items |
| `#[] SCHEMA` | Array with element schema |
| `##type` | Optional — field can be missing or match type |

#### Reusable Schemas

```gherkin
Background:
  * def ingredientSchema = { id: '#number', name: '#string', quantity: '#number', unit: '##string' }
  * def recipeSchema = { id: '#number', name: '#string', ingredients: '#[] ingredientSchema' }

Scenario: Validate recipe response shape
  Given path '/api/recipes', 1
  When method GET
  Then status 200
  And match response == recipeSchema
```

### Reusability Patterns

| Pattern | Purpose |
|---------|---------|
| `call read('f.feature')` | Isolated scope — get result |
| `call read('f.feature') { arg: 1 }` | Pass parameters |
| `call read('f.feature')` (no assignment) | Shared scope — merge variables |
| `callonce read('f.feature')` | Once per feature, cached |
| `karate.callSingle('f.feature')` | Once globally |
| `call read('@tag')` | Call scenario in same file by tag |
| `copy data = original` | Deep clone to prevent mutation |

Called features must be tagged `@ignore` to avoid standalone execution.

### Tagging Convention

| Tag | Purpose |
|-----|---------|
| `@smoke` | Critical path — run on every deployment |
| `@regression` | Full suite — run nightly or on PR |
| `@negative` | Error / edge-case scenarios |
| `@auth` | Authentication tests |
| `@recipes` | Recipe domain |
| `@users` | User domain |
| `@PT-NNNN` | PractiTest test case mapping |
| `@ignore` | Skip at runtime (helper features) |
| `@setup` | Setup scenario (called via `karate.setup()`) |
| `@env=dev` | Run only when `karate.env` matches |
| `@envnot=prod` | Skip when `karate.env` matches |
| `@parallel=false` | Force sequential execution |

### Project Structure

```
src/test/java/
├── karate-config.js              # Global configuration
├── karate-config-dev.js          # Dev overrides (optional)
├── logback-test.xml              # Logging config
├── KarateRunner.java             # Parallel runner (JUnit 5)
├── auth/
│   └── login.feature             # Reusable auth helper (@ignore)
├── recipes/
│   ├── create-recipe.feature
│   ├── get-recipes.feature
│   ├── update-recipe.feature
│   └── delete-recipe.feature
├── users/
│   ├── register.feature
│   └── user-profile.feature
├── common/
│   ├── schemas/                  # Reusable JSON schemas
│   │   ├── recipe-schema.json
│   │   └── user-schema.json
│   └── helpers/                  # Shared utility features
│       └── cleanup.feature
└── mocks/                        # Mock server features
    └── external-service-mock.feature
```

### Parallel Runner

```java
import com.intuit.karate.Results;
import com.intuit.karate.Runner;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

class KarateRunner {
    @Test
    void testParallel() {
        Results results = Runner.path("classpath:")
                .tags("~@ignore")
                .outputJunitXml(true)
                .parallel(5);
        assertEquals(0, results.getFailCount(), results.getErrorMessages());
    }
}
```

Start with 1–2× CPU cores for thread count. Monitor `efficiency` in output (aim > 0.7).

### Maven Configuration

```xml
<build>
    <testResources>
        <testResource>
            <directory>src/test/java</directory>
            <excludes>
                <exclude>**/*.java</exclude>
            </excludes>
        </testResource>
    </testResources>
</build>
```

This ensures `.feature` files and `karate-config.js` in `src/test/java/` are on the classpath.

### Best Practices

1. **Scenario isolation** — each scenario runs standalone; no shared state between scenarios.
2. **Background resets** — variables in Background reset before every Scenario; use `callonce` for expensive setup.
3. **One assertion per concern** — split validation across multiple `match` steps for clear failure messages.
4. **Prefer `match` over `assert`** — `match` gives better error messages and supports fuzzy markers.
5. **External test data** — use `read('data.json')` or `read('data.csv')` for large datasets.
6. **Never hardcode secrets** — load from env vars via `java.lang.System.getenv('SECRET')` or system properties.
7. **Clean up test data** — use `afterScenario` hooks or dedicated cleanup features.
8. **URL reset behavior** — `url` persists across requests; `path` resets after each `method` call.
9. **Method triggers request** — complete all setup (url, path, header, param) BEFORE calling `method`.
10. **Reserved variable names** — `url` and `request` are keywords; use `baseUrl`, `requestBody` instead.
