import { createBdd } from "playwright-bdd";
import { expect } from "@playwright/test";
import { AccountPage } from "../pages/AccountPage.js";
import { RestaurantsPage } from "../pages/RestaurantsPage.js";
import { MenuPage } from "../pages/MenuPage.js";
import { CartPage } from "../pages/CartPage.js";
import { OrdersPage } from "../pages/OrdersPage.js";
import { getDevConfirmationCode } from "../support/api.js";

const { Given, When, Then } = createBdd();
let email = "";

Given("I sign up and confirm a fresh account", async ({ page, request }) => {
  email = `e2e+${Date.now()}@example.com`;
  const account = new AccountPage(page);
  await account.goto();
  await account.switchToSignup();
  await account.fillEmail(email);
  await account.fillPassword("TestPass99!");
  await account.submitSignup();

  // Wait for the confirmation-code input to appear — confirms signup request completed.
  await expect(page.getByLabel("6-digit code")).toBeVisible();

  const code = await getDevConfirmationCode(request, email);
  await account.fillCode(code);
  await account.submitConfirm();
  await expect(page).toHaveURL("/");
});

When("I place an order as {string}", async ({ page }, name: string) => {
  await new RestaurantsPage(page).openFirstRestaurant();
  await new MenuPage(page).addFirstItem();
  await new MenuPage(page).goToCart();
  const cart = new CartPage(page);
  await cart.fillName(name);
  await cart.placeOrder();
  await expect(page).toHaveURL(/\/orders\//);
});

When("I open my order history", async ({ page }) => {
  await new OrdersPage(page).goto();
});

Then(
  "I should see my order for {string}",
  async ({ page }, name: string) => {
    await expect(page.getByText(name).first()).toBeVisible();
  },
);
