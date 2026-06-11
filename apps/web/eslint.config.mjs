import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";

const HEX = "Literal[value=/#(?:[0-9a-fA-F]{3}){1,2}/]";
// Tailwind colour utility classes (e.g. text-gray-500, border-gray-300, bg-red-100) —
// bypass the Ember design tokens just like a raw hex would, so ban them too.
const TW_COLOR =
  "Literal[value=/(?:^|\\s)(?:text|bg|border|ring|from|via|to|fill|stroke|divide|outline|placeholder|accent|caret|decoration)-(?:gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}/]";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**", "*.config.*", ".dependency-cruiser.cjs"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { "react-hooks": reactHooks, "jsx-a11y": jsxA11y },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      ...jsxA11y.configs.recommended.rules,
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "no-restricted-imports": ["error", { patterns: [
        { group: ["@workshop/api", "**/apps/api/*"], message: "web talks to the API over HTTP, not by import — use @workshop/shared" },
      ]}],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/api.ts", "src/test/**", "src/**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-globals": ["error", { name: "fetch", message: "HTTP only via src/lib/api.ts" }],
    },
  },
  {
    files: ["src/**/*.tsx"],
    ignores: ["src/components/ui/Logo.tsx", "src/**/*.test.tsx"],
    rules: {
      "no-restricted-syntax": ["error",
        { selector: HEX, message: "Use Ember design tokens (CSS custom properties), not hardcoded hex colors" },
        { selector: TW_COLOR, message: "Use Ember design tokens / ui components, not Tailwind colour utility classes" },
      ],
    },
  },
  { files: ["src/**/*.test.{ts,tsx}"], rules: { "no-restricted-globals": "off" } },
);
