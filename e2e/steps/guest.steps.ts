import { createBdd } from "playwright-bdd";
import { expect } from "@playwright/test";
import { RestaurantsPage } from "../pages/RestaurantsPage.js";
import { MenuPage } from "../pages/MenuPage.js";
import { CartPage } from "../pages/CartPage.js";

const { Given, When, Then } = createBdd();

Given("I am on the restaurants page", async ({ page }) => {
  await new RestaurantsPage(page).goto();
});

When("I open the first restaurant and add the first dish", async ({ page }) => {
  await new RestaurantsPage(page).openFirstRestaurant();
  await new MenuPage(page).addFirstItem();
});

When(
  "I go to the cart and place the order as {string}",
  async ({ page }, name: string) => {
    await new MenuPage(page).goToCart();
    const cart = new CartPage(page);
    await cart.fillName(name);
    await cart.placeOrder();
  },
);

Then("I should see an order confirmation", async ({ page }) => {
  await expect(page).toHaveURL(/\/orders\//);
  // h1.confirm__title text is "Order placed!"
  await expect(
    page.getByRole("heading", { name: /order placed/i }),
  ).toBeVisible();
});
