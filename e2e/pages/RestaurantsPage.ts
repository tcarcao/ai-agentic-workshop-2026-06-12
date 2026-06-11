import { type Page } from "@playwright/test";

export class RestaurantsPage {
  constructor(private page: Page) {}

  goto() {
    return this.page.goto("/");
  }

  openFirstRestaurant() {
    return this.page.locator("a.r-card").first().click();
  }
}
