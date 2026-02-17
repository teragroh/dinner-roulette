@recipes @regression
Feature: Recipe API

  Background:
    * url baseUrl
    * def auth = callonce read('classpath:com/teragroh/dinner_roulette/auth/auth.feature')
    * header Authorization = 'Bearer ' + auth.token

  # ── GET /recipes ──────────────────────────────────────────────

  @smoke @PT-1001
  Scenario: List all recipes returns 200
    Given path '/recipes'
    When method GET
    Then status 200
    And match response == '#array'

  @PT-1002
  Scenario: List recipes response contains expected schema
    # Seed a recipe first so the list is non-empty
    Given path '/recipes'
    And request
      """
      {
        "name": "Schema Check Recipe",
        "description": "For schema validation",
        "instructions": "Step 1: validate",
        "servings": 2,
        "cookTimeMinutes": 15,
        "prepTimeMinutes": 5,
        "ingredients": [
          { "name": "Salt", "quantity": 1, "unit": "tsp" }
        ]
      }
      """
    When method POST
    Then status 201

    # Now fetch all recipes
    Given path '/recipes'
    When method GET
    Then status 200
    And match each response contains
      """
      {
        id: '#number',
        name: '#string',
        ingredients: '#array'
      }
      """

  # ── POST /recipes (happy path) ───────────────────────────────

  @smoke @PT-1010
  Scenario: Create a recipe with all fields
    Given path '/recipes'
    And request
      """
      {
        "name": "Spaghetti Bolognese",
        "description": "Classic Italian pasta",
        "instructions": "1. Cook pasta. 2. Make sauce. 3. Combine.",
        "servings": 4,
        "cookTimeMinutes": 30,
        "prepTimeMinutes": 15,
        "ingredients": [
          { "name": "Spaghetti", "quantity": 500, "unit": "g" },
          { "name": "Ground beef", "quantity": 400, "unit": "g" },
          { "name": "Tomato sauce", "quantity": 2, "unit": "cups" }
        ]
      }
      """
    When method POST
    Then status 201
    And match response.id == '#number'
    And match response.name == 'Spaghetti Bolognese'
    And match response.description == 'Classic Italian pasta'
    And match response.servings == 4
    And match response.cookTimeMinutes == 30
    And match response.prepTimeMinutes == 15
    And match response.ingredients == '#[3]'
    And match response.ingredients[*].name contains 'Spaghetti'
    And match response.ingredients[*].name contains 'Ground beef'

  @PT-1011
  Scenario: Create a recipe with only required fields
    Given path '/recipes'
    And request
      """
      {
        "name": "Minimal Recipe",
        "ingredients": [
          { "name": "Item", "quantity": 1, "unit": "pc" }
        ]
      }
      """
    When method POST
    Then status 201
    And match response.id == '#number'
    And match response.name == 'Minimal Recipe'
    And match response.description == '#null'
    And match response.servings == '#null'

  @PT-1012
  Scenario: Create a recipe with ingredients containing no unit
    Given path '/recipes'
    And request
      """
      {
        "name": "Eggs Benedict",
        "ingredients": [
          { "name": "Eggs", "quantity": 4 }
        ]
      }
      """
    When method POST
    Then status 201
    And match response.ingredients == '#[1]'
    And match response.ingredients[0].name == 'Eggs'
    And match response.ingredients[0].quantity == 4

  @PT-1013
  Scenario: Created recipe appears in list
    # Create a recipe with a unique name
    * def uniqueName = 'Unique Recipe ' + java.util.UUID.randomUUID().toString().substring(0, 8)

    Given path '/recipes'
    And request { name: '#(uniqueName)', servings: 1, ingredients: [{ name: 'Item', quantity: 1, unit: 'pc' }] }
    When method POST
    Then status 201
    * def createdId = response.id

    # Verify it shows up in the list
    Given path '/recipes'
    When method GET
    Then status 200
    And match response[*].id contains createdId

  # ── POST /recipes (validation errors) ────────────────────────

  @PT-1020
  Scenario: Fail to create recipe without name
    Given path '/recipes'
    And request { description: 'Missing name field', ingredients: [{ name: 'Item', quantity: 1, unit: 'pc' }] }
    When method POST
    Then status 400

  @PT-1021
  Scenario: Fail to create recipe with blank name
    Given path '/recipes'
    And request { name: '', ingredients: [{ name: 'Item', quantity: 1, unit: 'pc' }] }
    When method POST
    Then status 400

  @PT-1022
  Scenario: Fail to create recipe with name exceeding 200 characters
    * def longName = ''
    * def fun = function(){ var s = ''; for(var i = 0; i < 201; i++) s += 'a'; return s; }
    * def longName = fun()

    Given path '/recipes'
    And request { name: '#(longName)', ingredients: [{ name: 'Item', quantity: 1, unit: 'pc' }] }
    When method POST
    Then status 400

  @PT-1023
  Scenario: Fail to create recipe with description exceeding 1000 characters
    * def fun = function(){ var s = ''; for(var i = 0; i < 1001; i++) s += 'a'; return s; }
    * def longDesc = fun()

    Given path '/recipes'
    And request { name: 'Valid Name', description: '#(longDesc)', ingredients: [{ name: 'Item', quantity: 1, unit: 'pc' }] }
    When method POST
    Then status 400

  @PT-1024
  Scenario: Fail to create recipe with zero servings
    Given path '/recipes'
    And request { name: 'Zero Servings', servings: 0, ingredients: [{ name: 'Item', quantity: 1, unit: 'pc' }] }
    When method POST
    Then status 400

  @PT-1025
  Scenario: Fail to create recipe with negative servings
    Given path '/recipes'
    And request { name: 'Negative Servings', servings: -1, ingredients: [{ name: 'Item', quantity: 1, unit: 'pc' }] }
    When method POST
    Then status 400

  @PT-1026
  Scenario: Fail to create recipe with servings exceeding 100
    Given path '/recipes'
    And request { name: 'Too Many Servings', servings: 101, ingredients: [{ name: 'Item', quantity: 1, unit: 'pc' }] }
    When method POST
    Then status 400

  @PT-1027
  Scenario: Fail to create recipe with cook time exceeding 1440 minutes
    Given path '/recipes'
    And request { name: 'Long Cook', cookTimeMinutes: 1441, ingredients: [{ name: 'Item', quantity: 1, unit: 'pc' }] }
    When method POST
    Then status 400

  @PT-1028
  Scenario: Fail to create recipe with prep time exceeding 1440 minutes
    Given path '/recipes'
    And request { name: 'Long Prep', prepTimeMinutes: 1441, ingredients: [{ name: 'Item', quantity: 1, unit: 'pc' }] }
    When method POST
    Then status 400

  @PT-1029
  Scenario: Fail to create recipe with negative cook time
    Given path '/recipes'
    And request { name: 'Negative Cook', cookTimeMinutes: -5, ingredients: [{ name: 'Item', quantity: 1, unit: 'pc' }] }
    When method POST
    Then status 400

  @PT-1030
  Scenario: Fail to create recipe with ingredient missing name
    Given path '/recipes'
    And request
      """
      {
        "name": "Bad Ingredient",
        "ingredients": [
          { "quantity": 2, "unit": "cups" }
        ]
      }
      """
    When method POST
    Then status 400

  @PT-1031
  Scenario: Fail to create recipe with ingredient having negative quantity
    Given path '/recipes'
    And request
      """
      {
        "name": "Negative Qty",
        "ingredients": [
          { "name": "Sugar", "quantity": -1, "unit": "tsp" }
        ]
      }
      """
    When method POST
    Then status 400

  # ── POST /recipes (boundary values) ─────────────────────────

  @PT-1040
  Scenario: Create recipe with max allowed servings (100)
    Given path '/recipes'
    And request { name: 'Max Servings', servings: 100, ingredients: [{ name: 'Item', quantity: 1, unit: 'pc' }] }
    When method POST
    Then status 201
    And match response.servings == 100

  @PT-1041
  Scenario: Create recipe with max allowed cook time (1440)
    Given path '/recipes'
    And request { name: 'Max Cook', cookTimeMinutes: 1440, ingredients: [{ name: 'Item', quantity: 1, unit: 'pc' }] }
    When method POST
    Then status 201
    And match response.cookTimeMinutes == 1440

  @PT-1042
  Scenario: Create recipe with max allowed prep time (1440)
    Given path '/recipes'
    And request { name: 'Max Prep', prepTimeMinutes: 1440, ingredients: [{ name: 'Item', quantity: 1, unit: 'pc' }] }
    When method POST
    Then status 201
    And match response.prepTimeMinutes == 1440

  @PT-1043
  Scenario: Create recipe with single serving
    Given path '/recipes'
    And request { name: 'Single Serving', servings: 1, ingredients: [{ name: 'Item', quantity: 1, unit: 'pc' }] }
    When method POST
    Then status 201
    And match response.servings == 1

  # ── POST /recipes (data-driven validation) ──────────────────

  @PT-1050
  Scenario Outline: Fail to create recipe with invalid <field>
    Given path '/recipes'
    And request <payload>
    When method POST
    Then status 400

    Examples:
      | field              | payload                                                                                  |
      | zero cook time     | { name: 'Test', cookTimeMinutes: 0, ingredients: [{ name: 'Item', quantity: 1, unit: 'pc' }] }   |
      | zero prep time     | { name: 'Test', prepTimeMinutes: 0, ingredients: [{ name: 'Item', quantity: 1, unit: 'pc' }] }   |
      | zero servings      | { name: 'Test', servings: 0, ingredients: [{ name: 'Item', quantity: 1, unit: 'pc' }] }          |
      | negative servings  | { name: 'Test', servings: -10, ingredients: [{ name: 'Item', quantity: 1, unit: 'pc' }] }        |
      | negative cook time | { name: 'Test', cookTimeMinutes: -10, ingredients: [{ name: 'Item', quantity: 1, unit: 'pc' }] } |
      | negative prep time | { name: 'Test', prepTimeMinutes: -10, ingredients: [{ name: 'Item', quantity: 1, unit: 'pc' }] } |

  # ── Authentication / Authorization ──────────────────────────

  @PT-1060
  Scenario: Fail to create recipe without auth token
    * header Authorization = ''
    Given path '/recipes'
    And request { name: 'No Auth Recipe', ingredients: [{ name: 'Item', quantity: 1, unit: 'pc' }] }
    When method POST
    * assert responseStatus == 401 || responseStatus == 403

  @PT-1061
  Scenario: Fail to create recipe with invalid auth token
    * header Authorization = 'Bearer invalid.token.value'
    Given path '/recipes'
    And request { name: 'Bad Token Recipe', ingredients: [{ name: 'Item', quantity: 1, unit: 'pc' }] }
    When method POST
    * assert responseStatus == 401 || responseStatus == 403
