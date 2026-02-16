---
name: Karate Testing
description: Karate API test patterns — feature file structure, authentication, data-driven tests, reusable scenarios, and CI integration.
---

## Overview

This skill provides the canonical patterns for writing Karate API tests in the project.

## Instructions

### Feature File Structure

```gherkin
@recipes @regression
Feature: Recipe CRUD API

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

### Environment Configuration

```javascript
// karate-config.js
function fn() {
  var env = karate.env || 'dev';
  var config = {
    baseUrl: 'http://localhost:8080'
  };

  if (env === 'staging') {
    config.baseUrl = 'https://staging-api.example.com';
  } else if (env === 'prod') {
    config.baseUrl = 'https://api.example.com';
  }

  return config;
}
```

### Reusable Authentication

```gherkin
# auth/login.feature
Feature: Login
  Scenario: Get auth token
    Given url baseUrl
    And path '/api/auth/login'
    And request { email: 'test@example.com', password: 'password123' }
    When method POST
    Then status 200
    * def token = response.accessToken
```

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

### Match Patterns

| Pattern | Use For |
|---------|---------|
| `#number` | Any numeric value |
| `#string` | Any string value |
| `#boolean` | Any boolean value |
| `#present` | Field exists (any value) |
| `#notpresent` | Field does not exist |
| `#null` | Field is null |
| `#notnull` | Field is not null |
| `#array` | Any array |
| `#[N]` | Array of exactly N items |
| `##string` | Optional string (string or absent) |

### Tagging Convention

| Tag | Purpose |
|-----|---------|
| `@smoke` | Critical path — run on every deployment |
| `@regression` | Full test suite — run nightly or on PR |
| `@auth` | Authentication-related tests |
| `@recipes` | Recipe domain tests |
| `@PT-NNNN` | PractiTest test case mapping |

### File Organization

```
src/test/java/
├── karate-config.js
├── KarateRunner.java
├── auth/
│   └── login.feature
├── recipes/
│   ├── create-recipe.feature
│   ├── get-recipes.feature
│   ├── update-recipe.feature
│   └── delete-recipe.feature
└── users/
    ├── register.feature
    └── user-profile.feature
```
