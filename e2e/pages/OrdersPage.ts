import { type Page } from "@playwright/test";

export class OrdersPage {
  constructor(private page: Page) {}

  goto() {
    return this.page.goto("/orders");
  }
}
