# Advanced Karate Reference

Hooks, lifecycle, parallel execution, Java interop, `karate` object API, and magic variables.

## Table of Contents
- [Hooks & Lifecycle](#hooks--lifecycle)
- [Parallel Execution](#parallel-execution)
- [Java Interop](#java-interop)
- [Karate Object API](#karate-object-api)
- [Magic Variables](#magic-variables)
- [Performance & Thread Safety](#performance--thread-safety)

---

## Hooks & Lifecycle

### Hook Types

| Hook | Scope | Defined In |
|------|-------|-----------|
| `Background` | Runs before each Scenario | Feature file |
| `callonce` | Once per feature file | Feature file |
| `karate.callSingle()` | Once per test suite | `karate-config.js` |
| `afterScenario` | After each Scenario | Feature file or `karate-config.js` |
| `afterFeature` | After all Scenarios in a feature | Feature file |

### Background

Runs before **every** Scenario in a Feature. Use for shared setup:

```gherkin
Background:
  * url baseUrl
  * header Authorization = 'Bearer ' + authToken
  * def schema = read('classpath:schemas/user.json')
```

### callonce

Executed once per feature, even if multiple Scenarios exist. Result is cached and shared:

```gherkin
Background:
  * callonce read('classpath:helpers/login.feature')
  # authToken is now available in all Scenarios
```

### karate.callSingle

Execute once per **entire test suite** (across all features). Defined in `karate-config.js`:

```javascript
function fn() {
  var config = {};
  // Runs once across ALL features in the suite
  var auth = karate.callSingle('classpath:helpers/setup-test-data.feature');
  config.testData = auth;
  return config;
}
```

Results are cached by file path. Use for expensive one-time operations (DB setup, token fetch).

### afterScenario

```gherkin
Feature: Cleanup after each scenario

  Background:
    * configure afterScenario =
      """
      function() {
        var id = karate.get('createdId');
        if (id) {
          karate.call('classpath:helpers/cleanup.feature', { id: id });
        }
      }
      """
```

### afterFeature

```gherkin
Feature: Full lifecycle example

  * configure afterFeature = function(){ karate.log('Feature complete') }

  Scenario: Test 1
    # ...

  Scenario: Test 2
    # ...
```

### Execution Order

```
karate-config.js (once per suite)
  └─ callSingle (once per suite, cached)

Feature:
  ├─ Background (before each Scenario)
  │   └─ callonce (once per feature)
  ├─ Scenario 1
  │   └─ afterScenario
  ├─ Scenario 2
  │   └─ afterScenario
  └─ afterFeature
```

---

## Parallel Execution

### Runner API (JUnit 5)

```java
import com.intuit.karate.Results;
import com.intuit.karate.Runner;
import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

class KarateRunnerTest {
    @Test
    void testAll() {
        Results results = Runner.path("classpath:features")
            .tags("~@ignore", "~@wip")
            .outputCucumberJson(true)
            .parallel(5);
        assertEquals(0, results.getFailCount(), results.getErrorMessages());
    }
}
```

### Tag Filtering

```java
// Include specific tags
Runner.path("classpath:features").tags("@smoke").parallel(5);

// Exclude tags
Runner.path("classpath:features").tags("~@slow", "~@flaky").parallel(5);

// Combine (AND logic between separate strings, OR within comma-separated)
Runner.path("classpath:features")
    .tags("@smoke,@regression")   // @smoke OR @regression
    .tags("~@wip")                // AND NOT @wip
    .parallel(5);
```

### Path Selection

```java
// Multiple paths
Runner.path("classpath:features/users", "classpath:features/recipes")
    .parallel(5);

// Single feature file
Runner.path("classpath:features/users/get-user.feature")
    .parallel(1);
```

### Thread Optimization

- **Default**: 1 thread per feature file
- **Rule of thumb**: Start with `parallel(5)`, increase if tests are I/O-bound
- **Thread safety**: Each feature gets its own `karate-config.js` execution, variables are isolated per thread
- **Avoid shared mutable state** between features — use `callSingle` for read-only shared data

### Designing for Parallel

| Do | Don't |
|----|-------|
| Make features independent | Share state between features |
| Use unique test data per feature | Rely on execution order |
| Use `callSingle` for read-only shared setup | Mutate `callSingle` results |
| Clean up data in `afterScenario` | Leave test data for other features |

---

## Java Interop

### Calling Java from Karate

```gherkin
# Static method
* def UUID = Java.type('java.util.UUID')
* def id = UUID.randomUUID().toString()

# Instance methods
* def ArrayList = Java.type('java.util.ArrayList')
* def list = new ArrayList()
* list.add('one')
* list.add('two')
* match list == ['one', 'two']

# Custom Java class
* def MyUtils = Java.type('com.teragroh.dinner_roulette.utils.TestUtils')
* def hash = MyUtils.sha256('input')
```

### Wrapping in Functions

```gherkin
* def basicAuth =
  """
  function(creds) {
    var Base64 = Java.type('java.util.Base64');
    var encoded = Base64.getEncoder().encodeToString((creds.username + ':' + creds.password).getBytes());
    return 'Basic ' + encoded;
  }
  """
* header Authorization = basicAuth({ username: 'admin', password: 'secret' })
```

### Reading Files from Java

```gherkin
* def data = read('classpath:testdata/users.json')      # JSON → native object
* def csv = read('classpath:testdata/users.csv')         # CSV → array of objects
* def text = read('classpath:testdata/template.txt')     # Plain text → string
* def bytes = read('classpath:testdata/image.png')       # Binary → byte array
```

---

## Karate Object API

The `karate` object is globally available in all feature files and JS functions.

### Properties

| Property | Description |
|----------|-------------|
| `karate.env` | Environment string from `-Dkarate.env` |
| `karate.info` | Current scenario info (feature name, scenario name, etc.) |
| `karate.tags` | Tags on the current Scenario |
| `karate.tagValues` | Tag values (e.g., `@id=123` → `{ id: ['123'] }`) |
| `karate.prevRequest` | The previous HTTP request for debugging |

### Core Methods

| Method | Description |
|--------|-------------|
| `karate.call(path)` | Call another feature (same as `call read(path)`) |
| `karate.callSingle(path)` | Call once per suite, cached by path |
| `karate.read(path)` | Read file from classpath or filesystem |
| `karate.get(name)` | Get variable by name (returns null if missing) |
| `karate.set(name, value)` | Set variable by name |
| `karate.remove(name, key)` | Remove key from variable |
| `karate.log(args...)` | Log to console and report |
| `karate.match(actual, expected)` | Programmatic match, returns `{ pass: bool, message: str }` |

### JSON Methods

| Method | Description |
|--------|-------------|
| `karate.toJson(obj)` | Convert to JSON string |
| `karate.fromString(str)` | Parse JSON string to object |
| `karate.pretty(obj)` | Pretty-print JSON |
| `karate.prettyXml(obj)` | Pretty-print XML |
| `karate.jsonPath(obj, expr)` | Evaluate JsonPath expression |
| `karate.xmlPath(obj, expr)` | Evaluate XPath expression |

### Collection Methods

| Method | Description |
|--------|-------------|
| `karate.filter(arr, fn)` | Filter array with predicate |
| `karate.map(arr, fn)` | Map array with transform function |
| `karate.forEach(arr, fn)` | Iterate array with side-effect function |
| `karate.sort(arr, fn)` | Sort array with comparator |
| `karate.repeat(n, fn)` | Create array of N elements |
| `karate.range(start, end)` | Create range array |
| `karate.keysOf(obj)` | Object keys as array |
| `karate.valuesOf(obj)` | Object values as array |
| `karate.filterKeys(obj, keys)` | Keep only specified keys |
| `karate.merge(obj1, obj2)` | Merge objects (shallow) |
| `karate.append(arr1, arr2)` | Concatenate arrays |
| `karate.distinct(arr)` | Remove duplicates |
| `karate.flatten(arr)` | Flatten nested arrays |

### String & Utility Methods

| Method | Description |
|--------|-------------|
| `karate.lowerCase(str)` | Convert to lowercase |
| `karate.trim(str)` | Trim whitespace |
| `karate.contains(str, sub)` | String contains check |
| `karate.uuid()` | Generate UUID |
| `karate.millis()` | Current time in milliseconds |
| `karate.timestamp()` | Current time in seconds |
| `karate.waitForPort(host, port)` | Wait for port to become available |

### Type Conversion

| Method | Description |
|--------|-------------|
| `karate.toBean(obj, class)` | Convert to Java POJO |
| `karate.toMap(obj)` | Convert to Java Map |
| `karate.toList(obj)` | Convert to Java List |
| `karate.typeOf(obj)` | Get type string (`'object'`, `'array'`, etc.) |
| `karate.sizeOf(obj)` | Get size/length |

### Async & OS

| Method | Description |
|--------|-------------|
| `karate.listen(timeout)` | Block until `karate.signal(result)` called |
| `karate.signal(result)` | Unblock `karate.listen()` with result |
| `karate.fork(config)` | Start a process |
| `karate.exec(command)` | Execute OS command, return exit code |
| `karate.os` | OS info object `{ type, name }` |
| `karate.start(mockFeature)` | Start a mock server |

---

## Magic Variables

Special variables available in certain contexts:

| Variable | Context | Description |
|----------|---------|-------------|
| `__arg` | Called feature | The single argument when `call` is used with one arg |
| `__loop` | Called feature (data-driven) | True when called with array (looping) |
| `__row` | Called feature (data-driven) | Current row object in data-driven `call` |
| `__num` | Called feature (data-driven) | Zero-based loop index |
| `listenResult` | After `karate.listen()` | The value passed to `karate.signal()` |
| `_` | Self-validation `#?` | Current value being validated |
| `$` | Match expressions | JSON root |
| `_$` | `match each` + `#?` | Parent element in iteration |

### Data-Driven Call Example

```gherkin
# caller.feature
* def users = [{ name: 'A', role: 'admin' }, { name: 'B', role: 'user' }]
* def results = call read('classpath:helpers/create-user.feature') users

# create-user.feature (called feature)
Scenario:
  # __row.name, __row.role — current row data
  # __num — 0, then 1
  # __loop — true
  Given path '/api/users'
  And request { name: '#(__row.name)', role: '#(__row.role)' }
  When method POST
  Then status 201
```

---

## Performance & Thread Safety

### Variable Isolation
- Each feature file gets its **own** copy of config variables from `karate-config.js`
- Variables defined in one feature are NOT visible in other features running in parallel
- `callonce` results are shared within a single feature only
- `callSingle` results are shared across the entire suite (read-only recommended)

### Resource Cleanup
```gherkin
* configure afterScenario =
  """
  function() {
    // Clean up resources created during the scenario
    var createdIds = karate.get('createdIds') || [];
    for (var i = 0; i < createdIds.length; i++) {
      karate.call('classpath:helpers/delete-resource.feature', { id: createdIds[i] });
    }
  }
  """
```

### Retry Configuration
```gherkin
# Retry a specific request
* configure retry = { count: 3, interval: 1000 }
* path '/api/status'
* retry until responseStatus == 200
* method GET
```

### Timeouts
```gherkin
# Connection and read timeouts (ms)
* configure connectTimeout = 5000
* configure readTimeout = 30000
```
