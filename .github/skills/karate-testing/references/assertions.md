# Assertions & Schema Validation Reference

Detailed reference for Karate `match` variants, fuzzy markers, schema validation, and contains shortcuts.

## Table of Contents
- [Match Variants](#match-variants)
- [Fuzzy Markers](#fuzzy-markers)
- [Optional Fields](#optional-fields)
- [Self-Validation Expressions](#self-validation-expressions)
- [Cross-Field Validation](#cross-field-validation)
- [Array Validation](#array-validation)
- [Reusable Schemas](#reusable-schemas)
- [Contains Shortcuts](#contains-shortcuts)
- [Symbol Reference](#symbol-reference)
- [Data Manipulation](#data-manipulation)

## Match Variants

### Exact Equality (`match ==`)
```gherkin
* match response == { id: 1, name: 'John' }
* match response.id == 1
# Key order and whitespace don't matter
* match response == { name: 'John', id: 1 }
```

### Not Equals (`match !=`)
```gherkin
* match response.status != 'error'
* match response != { error: true }
```

### Contains (subset match)
```gherkin
# Object — only checks specified keys
* match response contains { name: 'John' }

# Array — single element
* match tags contains 'admin'

# Array — multiple elements (order doesn't matter)
* match tags contains ['admin', 'verified']
```

### Not Contains
```gherkin
* match response !contains { deleted: true }
* match tags !contains 'suspended'
```

### Contains Only (exact elements, any order)
```gherkin
* match numbers contains only [3, 2, 1]
# Fails if any element is missing or extra
```

### Contains Any (at least one)
```gherkin
* match tags contains any ['urgent', 'high']
* match data contains any { b: 'x', c: true }
```

### Contains Deep (recursive)
```gherkin
* def original = { a: 1, b: 2, c: 3, d: { a: 1, b: 2 } }
* def expected = { a: 1, c: 3, d: { b: 2 } }
* match original contains deep expected
```

### Contains Only Deep (exact + recursive)
```gherkin
* def response = { foo: [ 'a', 'b', 'c' ] }
* match response contains only deep { foo: [ 'c', 'a', 'b' ] }
```

### Match Each (validate every array element)
```gherkin
* match each response == { id: '#number', name: '#string' }
* match each response contains { active: true }
```

### Match Each Contains Deep
```gherkin
* match each response contains deep { a: 1, arr: [ { b: 2 } ] }
```

### Match Header (case-insensitive)
```gherkin
* match header Content-Type contains 'json'
```

## Fuzzy Markers

| Marker | Validates | Example |
|--------|-----------|---------|
| `#ignore` | Skip validation | `id: '#ignore'` |
| `#null` | Must be null (key exists) | `value: '#null'` |
| `#notnull` | Must not be null | `name: '#notnull'` |
| `#present` | Key must exist (any value) | `field: '#present'` |
| `#notpresent` | Key must not exist | `deleted: '#notpresent'` |
| `#string` | Must be a string | `name: '#string'` |
| `#number` | Must be a number | `id: '#number'` |
| `#boolean` | Must be boolean | `active: '#boolean'` |
| `#array` | Must be an array | `items: '#array'` |
| `#object` | Must be an object | `address: '#object'` |
| `#uuid` | Must be UUID format | `id: '#uuid'` |
| `#regex STR` | Must match regex | `email: '#regex .+@.+'` |
| `#? EXPR` | Custom JS expression | `age: '#? _ > 18'` |
| `#[N]` | Array of exactly N items | `'#[10]'` |
| `#[] SCHEMA` | Array with element type | `'#[] #object'` |

**Regex escaping**: use double backslash — `#regex a\\.dot` matches `a.dot`.

## Optional Fields

Prefix any marker with `##` to mark a field as optional (can be missing or match the type):

```gherkin
* def user = { name: 'John', age: 30 }
# bio is missing but passes because ## makes it optional
* match user == { name: '#string', age: '#number', bio: '##string' }
```

`##null` matches BOTH missing keys AND keys with null values:
```gherkin
* def foo = { a: 1 }
* match foo == { a: 1, b: '##null' }    # b missing — passes

* def bar = { a: 1, b: null }
* match bar == { a: 1, b: '##null' }    # b null — passes
```

## Self-Validation Expressions

Use `#? EXPR` where `_` represents the current field value:

```gherkin
* match product == {
    price: '#number? _ > 0 && _ < 10000',
    discount: '#number? _ >= 0 && _ <= 100',
    quantity: '#number? _ > 0'
  }

# Combine type check with validation
* match user == { name: '#string? _.length > 0', age: '#number? _ > 0' }

# Using external variables
* def min = 1
* def max = 100
* match value == { count: '#? _ >= min && _ <= max' }

# Using functions
* def isValidEmail = function(e) { return e.indexOf('@') > 0 }
* match user.email == '#? isValidEmail(_)'
```

## Cross-Field Validation

Use `$` to reference the JSON root:

```gherkin
* def temp = { celsius: 100, fahrenheit: 212 }
* match temp == { celsius: '#number', fahrenheit: '#? _ == $.celsius * 1.8 + 32' }
```

### Match Each with Parent Reference (`_$`)

In `match each`, use `_$` to reference the current array element (parent):

```gherkin
* def orders = [
    { items: 3, total: 30, pricePerItem: 10 },
    { items: 5, total: 25, pricePerItem: 5 }
  ]
* match each orders contains { total: '#? _ == _$.items * _$.pricePerItem' }
```

## Array Validation

```gherkin
* match response == '#[]'              # Must be an array (any size)
* match response == '#[10]'            # Exactly 10 items
* match response == '#[] #object'      # Array of objects
* match tags == '#[3] #string'         # Exactly 3 strings
* match tags == '#[] #string? _.length > 0'  # Non-empty strings
```

## Reusable Schemas

Define schemas as variables and reference with `#(schemaName)`:

```gherkin
Background:
  * def geoSchema = { lat: '#string', lng: '#string' }
  * def addressSchema = { street: '#string', city: '#string', geo: '#(geoSchema)' }
  * def userSchema = {
      id: '#number',
      name: '#string',
      email: '#regex .+@.+',
      address: '#(addressSchema)'
    }

Scenario: Validate user response
  Given path '/api/users', 1
  When method GET
  Then status 200
  And match response == userSchema
```

### External Schema Files

```gherkin
* def userSchema = read('classpath:schemas/user-schema.json')
* match response == userSchema
```

## Contains Shortcuts

Shortcut symbols for inline `match` with embedded expressions:

| Symbol | Equivalent |
|--------|-----------|
| `^` | contains |
| `^^` | contains only |
| `^*` | contains any |
| `^+` | contains deep |
| `!^` | not contains |

```gherkin
* def requiredFields = { id: '#number', title: '#string' }
* match response == '#(^requiredFields)'    # contains

* def expected = [{ id: 42 }, { id: 23 }]
* match cat.kittens == '#(^^expected)'       # contains only (any order)
```

## Symbol Reference

| Symbol | Meaning |
|--------|---------|
| `_` | Current value (self) being validated |
| `$` | JSON root of the document (response by default) |
| `_$` | Parent object in `match each` iterations |

## Data Manipulation

### set — add or modify
```gherkin
* def user = { id: 123, name: 'John' }
* set user.active = true
* set user.profile.email = 'john@test.com'   # auto-creates nested path
```

### set multiple (table form)
```gherkin
* set user
  | path          | value              |
  | name.first    | 'John'             |
  | name.last     | 'Doe'              |
  | age           | 30                 |
```

### remove
```gherkin
* remove response.password
* remove response..internal     # deep scan remove
* remove items[1]               # by index
```

### delete (dynamic key)
```gherkin
* def key = 'tempData'
* delete user[key]
```
