Feature: Guest checkout
  Scenario: A guest browses, adds a dish, and places an order
    Given I am on the restaurants page
    When I open the first restaurant and add the first dish
    And I go to the cart and place the order as "Ada Lovelace"
    Then I should see an order confirmation
