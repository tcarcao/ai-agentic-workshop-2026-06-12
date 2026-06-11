import { type Page } from "@playwright/test";

export class CartPage {
  constructor(private page: Page) {}

  // The cart's Input has label="Your name"
  fillName(v: string) {
    return this.page.getByLabel("Your name").fill(v);
  }

  // The checkout button text is "Checkout · {price}" — match on "Checkout"
  placeOrder() {
    return this.page.getByRole("button", { name: /checkout/i }).click();
  }
}
