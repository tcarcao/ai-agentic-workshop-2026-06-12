import { type Page } from "@playwright/test";

export class MenuPage {
  constructor(private page: Page) {}

  addFirstItem() {
    return this.page.getByRole("button", { name: /^Add / }).first().click();
  }

  goToCart() {
    // The header cart icon has aria-label="Cart"; use first() to avoid strict-mode
    // violations when the menu page also shows a "View cart" link.
    return this.page.getByRole("link", { name: "Cart" }).first().click();
  }
}
