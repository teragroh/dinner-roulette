# Mock Servers (Test Doubles) Reference

Karate's built-in test doubles for mocking HTTP services. No external libraries needed.

## Table of Contents
- [Overview](#overview)
- [Mock Feature File](#mock-feature-file)
- [Request Variables](#request-variables)
- [Request Matching](#request-matching)
- [Response Configuration](#response-configuration)
- [Stateful Mocks](#stateful-mocks)
- [CRUD Mock Example](#crud-mock-example)
- [Starting Mock Servers](#starting-mock-servers)
- [Proxy Mode](#proxy-mode)
- [CORS & Custom Headers](#cors--custom-headers)
- [Error Simulation](#error-simulation)
- [Standalone Server](#standalone-server)

## Overview

Karate can spin up HTTP servers (mock services) defined in `.feature` files. A mock is a feature file where each `Scenario` acts as a request handler matched by conditions.

## Mock Feature File

```gherkin
Feature: Payment Service Mock

  Background:
    * configure cors = true
    * def payments = {}

  Scenario: pathMatches('/payments') && methodIs('post')
    * def id = karate.uuid()
    * def body = request
    * set body.id = id
    * set body.status = 'pending'
    * payments[id] = body
    * def response = body
    * def responseStatus = 201

  Scenario: pathMatches('/payments/{id}') && methodIs('get')
    * def payment = payments[pathParams.id]
    * def response = payment || ''
    * def responseStatus = payment ? 200 : 404

  Scenario:
    # Catch-all — return 404 for unmatched requests
    * def responseStatus = 404
    * def response = { error: 'Not found' }
```

## Request Variables

These variables are available in mock scenarios for inspecting the incoming request:

| Variable | Type | Description |
|----------|------|-------------|
| `request` | any | Request body (auto-parsed JSON/XML) |
| `requestBytes` | byte[] | Raw request body bytes |
| `requestUrlBase` | string | Base URL (e.g. `http://localhost:8080`) |
| `requestUri` | string | Full request URI path |
| `requestMethod` | string | HTTP method (`GET`, `POST`, etc.) |
| `requestHeaders` | object | All request headers |
| `requestParams` | object | Query parameters |
| `pathParams` | object | Path parameters from `pathMatches` template |
| `requestParts` | object | Multipart form parts |

## Request Matching

Scenarios are evaluated **top to bottom** — first match wins. The `Scenario:` expression is a JavaScript boolean.

### Matching Functions

| Function | Description | Example |
|----------|-------------|---------|
| `pathMatches(pattern)` | Path template match | `pathMatches('/users/{id}')` |
| `methodIs(method)` | HTTP method check | `methodIs('post')` |
| `paramExists(name)` | Query param exists | `paramExists('page')` |
| `paramValue(name)` | Query param value | `paramValue('status') == 'active'` |
| `headerContains(name, val)` | Header value check | `headerContains('Accept', 'json')` |
| `bodyPath(jsonpath)` | Extract from body | `bodyPath('$.type') == 'premium'` |
| `typeContains(val)` | Content-Type check | `typeContains('json')` |
| `acceptContains(val)` | Accept header check | `acceptContains('xml')` |

### Compound Conditions

```gherkin
Scenario: pathMatches('/users/{id}') && methodIs('get') && paramExists('verbose')
```

### Path Parameters

Path templates extract named segments via `pathParams`:

```gherkin
Scenario: pathMatches('/api/v1/recipes/{recipeId}/ingredients/{ingredientId}')
  * def rId = pathParams.recipeId
  * def iId = pathParams.ingredientId
```

## Response Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `response` | `''` | Response body (JSON, XML, string) |
| `responseStatus` | `200` | HTTP status code |
| `responseHeaders` | `null` | Response headers (object) |
| `responseDelay` | `0` | Delay in ms before response |
| `afterScenario` | — | JS function run after response sent |

```gherkin
Scenario: pathMatches('/slow')
  * def responseDelay = 3000
  * def responseStatus = 200
  * def responseHeaders = { 'X-Custom': 'value', 'Cache-Control': 'no-cache' }
  * def response = { message: 'slow response' }
```

## Stateful Mocks

Use `Background` to initialize state. State persists across requests within the same mock server lifecycle:

```gherkin
Background:
  * def nextId =
    """
    function() {
      var result = karate.get('count') || 0;
      karate.set('count', result + 1);
      return result;
    }
    """
  * def inventory = karate.get('inventory') || {}
```

> **Important:** In `Background`, use `karate.get('varName') || default` to preserve state across requests — plain `def` would reset it.

## CRUD Mock Example

```gherkin
Feature: Recipe Service Mock

  Background:
    * def recipes = karate.get('recipes') || {}
    * def idCounter = karate.get('idCounter') || 0

  Scenario: pathMatches('/api/recipes') && methodIs('post')
    * def idCounter = idCounter + 1
    * karate.set('idCounter', idCounter)
    * def recipe = request
    * set recipe.id = idCounter
    * recipes[idCounter + ''] = recipe
    * karate.set('recipes', recipes)
    * def response = recipe
    * def responseStatus = 201

  Scenario: pathMatches('/api/recipes') && methodIs('get')
    * def response = karate.valuesOf(recipes)

  Scenario: pathMatches('/api/recipes/{id}') && methodIs('get')
    * def recipe = recipes[pathParams.id]
    * def response = recipe || { error: 'Not found' }
    * def responseStatus = recipe ? 200 : 404

  Scenario: pathMatches('/api/recipes/{id}') && methodIs('put')
    * def id = pathParams.id
    * def existing = recipes[id]
    * def updated = request
    * set updated.id = id
    * recipes[id] = updated
    * karate.set('recipes', recipes)
    * def response = updated
    * def responseStatus = existing ? 200 : 404

  Scenario: pathMatches('/api/recipes/{id}') && methodIs('delete')
    * def id = pathParams.id
    * def existed = recipes[id] != null
    * karate.remove('recipes', id)
    * def responseStatus = existed ? 204 : 404
    * def response = ''

  Scenario:
    * def responseStatus = 404
    * def response = { error: 'Route not found' }
```

## Starting Mock Servers

### From Karate Test (`karate.start`)
```gherkin
Background:
  * def mockPort = karate.start('classpath:mocks/payment-mock.feature').port
  * url 'http://localhost:' + mockPort
```

### From Java (Runner / JUnit)
```java
import com.intuit.karate.core.MockServer;

MockServer server = MockServer
    .feature("classpath:mocks/payment-mock.feature")
    .http(0)   // 0 = random available port
    .build();

int port = server.getPort();
// ... run tests ...
server.stop();
```

### From karate-config.js
```javascript
function fn() {
  var config = {};
  if (karate.env == 'mock') {
    var mock = karate.start('classpath:mocks/all-mocks.feature');
    config.baseUrl = 'http://localhost:' + mock.port;
  } else {
    config.baseUrl = 'http://localhost:8080';
  }
  return config;
}
```

## Proxy Mode

Forward unmatched or partially handled requests to a real backend:

```gherkin
Scenario: pathMatches('/api/recipes') && methodIs('get')
  # Intercept and add a header before forwarding
  * karate.proceed('http://real-backend:8080')
  # Modify the response before returning
  * def response = karate.filter(response, function(x){ return x.active })
```

`karate.proceed(url)` sends the request to the real backend and populates `response`, `responseStatus`, and `responseHeaders` with the real values. You can modify them after.

## CORS & Custom Headers

```gherkin
Background:
  * configure cors = true
  # OR fine-grained:
  * configure responseHeaders = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
```

`configure cors = true` automatically handles `OPTIONS` preflight requests and adds standard CORS headers.

## Error Simulation

```gherkin
# Timeout simulation
Scenario: pathMatches('/api/slow') && methodIs('get')
  * def responseDelay = 30000
  * def response = { data: 'late' }

# Server error
Scenario: pathMatches('/api/error') && methodIs('get')
  * def responseStatus = 500
  * def response = { error: 'Internal Server Error' }

# Connection reset (abort)
Scenario: pathMatches('/api/abort')
  * karate.abort()
```

## Standalone Server

Run a mock as a standalone HTTP server (no tests, just the server):

### Using JBang
```bash
jbang com.intuit.karate:karate-core:1.5.2 -m classpath:mocks/my-mock.feature -p 8090
```

### Using JAR
```bash
java -jar karate.jar -m classpath:mocks/my-mock.feature -p 8090
```

### CLI Options
| Flag | Description |
|------|-------------|
| `-m FILE` | Mock feature file path |
| `-p PORT` | Port (default 8080) |
| `-s` | SSL/HTTPS mode |
| `-c FILE` | SSL certificate |
| `-k FILE` | SSL key |
| `-P PREFIX` | Context path prefix |
| `-W` | Watch mode (auto-reload on file change) |
