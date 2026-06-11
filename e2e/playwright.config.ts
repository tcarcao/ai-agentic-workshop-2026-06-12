import { defineConfig } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

const testDir = defineBddConfig({ features: "features/**/*.feature", steps: "steps/**/*.ts" });

export default defineConfig({
  testDir,
  fullyParallel: false,
  workers: 1,
  reporter: process.env.CI ? "list" : "html",
  // The e2e database is prepared by setup-e2e-db.mjs (run from the `e2e` npm script)
  // BEFORE Playwright starts the API webServer — see that file for why.
  use: { baseURL: "http://localhost:5173", trace: "on-first-retry" },
  webServer: [
    // The API runs against a dedicated e2e database so the suite never touches dev.db.
    // reuseExistingServer is false so we never accidentally reuse a dev server bound to dev.db.
    {
      command: "npm run dev:api",
      cwd: "..",
      env: { ...process.env, DATABASE_URL: "file:prisma/e2e.db" },
      url: "http://localhost:3001/api/restaurants",
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: "npm run dev:web",
      cwd: "..",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
