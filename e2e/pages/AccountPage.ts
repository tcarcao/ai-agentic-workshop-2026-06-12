import { type Page } from "@playwright/test";

export class AccountPage {
  constructor(private page: Page) {}

  goto() {
    return this.page.goto("/account");
  }

  switchToSignup() {
    return this.page.getByRole("button", { name: "Create an account" }).click();
  }

  fillEmail(v: string) {
    return this.page.getByLabel("Email").fill(v);
  }

  fillPassword(v: string) {
    return this.page.getByLabel("Password").fill(v);
  }

  fillCode(v: string) {
    return this.page.getByLabel("6-digit code").fill(v);
  }

  submitSignup() {
    return this.page.getByRole("button", { name: "Create account" }).click();
  }

  submitConfirm() {
    return this.page.getByRole("button", { name: /confirm/i }).click();
  }
}
