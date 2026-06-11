import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**", "*.config.*", ".dependency-cruiser.cjs"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    rules: {
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/explicit-module-boundary-types": "error",
    },
  },
  { files: ["**/*.test.ts"], rules: { "@typescript-eslint/explicit-module-boundary-types": "off" } },
);
