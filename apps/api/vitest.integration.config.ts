import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "integration",
    environment: "node",
    include: ["src/tests/**/*.test.ts"],
    testTimeout: 30_000,
    maxWorkers: 1,
    fileParallelism: false,
  },
});
