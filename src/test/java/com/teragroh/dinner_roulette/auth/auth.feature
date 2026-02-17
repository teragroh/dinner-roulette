@auth
Feature: Authentication helper

  Scenario: Register and login to get auth token
    Given url baseUrl
    And path '/register'
    And request { username: 'karate_test_user', password: 'Test123!', email: 'karate_test@example.com' }
    When method POST
    # Ignore 409 if user already exists
    * if (responseStatus == 409) karate.log('User already exists, continuing to login')

    Given url baseUrl
    And path '/login'
    And request { username: 'karate_test_user', password: 'Test123!' }
    When method POST
    Then status 200
    * def token = response
