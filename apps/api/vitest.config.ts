import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["src/tests/**", "node_modules/**"],
    coverage: {
      // Count ALL source files, not just the ones tests import —
      // otherwise untested files are invisible and the number flatters.
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/tests/**", "src/main.ts"],
    },
  },
});
