import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**", "prisma/migrations/**", "*.config.*", "*.config.cjs", ".dependency-cruiser.cjs"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    plugins: { import: importPlugin },
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
    rules: {
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "import/extensions": ["error", "always", { ignorePackages: true }],
      "no-console": ["warn", { allow: ["error", "warn", "log"] }],
    },
  },
  {
    files: ["src/modules/*/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", { paths: [
        { name: "@prisma/client", message: "domain must stay pure" },
        { name: "hono", message: "domain must not know HTTP" },
      ]}],
    },
  },
  { files: ["**/*.test.ts"], rules: { "@typescript-eslint/no-floating-promises": "off" } },
);
