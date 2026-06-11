Feature: Authenticated customer journey
  Scenario: Sign up, confirm, log in, order, and see it in history
    Given I sign up and confirm a fresh account
    When I place an order as "Grace Hopper"
    And I open my order history
    Then I should see my order for "Grace Hopper"
