/** Architecture boundary rules for the web SPA. */
module.exports = {
  forbidden: [
    {
      name: "no-api-app-import",
      comment: "web must not import apps/api; use @workshop/shared",
      severity: "error",
      from: { path: "^src" },
      to: { path: "@workshop/api" },
    },
    {
      name: "ui-stays-primitive",
      comment: "design-system primitives must not depend on features or pages",
      severity: "error",
      from: { path: "^src/components/ui" },
      to: { path: "^src/(features|pages)/" },
    },
    {
      name: "features-dont-import-pages",
      comment: "dependency direction is pages -> features",
      severity: "error",
      from: { path: "^src/features/" },
      to: { path: "^src/pages/" },
    },
    {
      name: "no-cross-feature-imports",
      comment: "features are vertical slices — feature A must not import feature B",
      severity: "error",
      from: { path: "^src/features/([^/]+)/" },
      to: { path: "^src/features/[^/]+/", pathNot: "^src/features/$1/" },
    },
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true },
    },
  ],
  options: { tsConfig: { fileName: "tsconfig.json" }, doNotFollow: { path: "node_modules" } },
};
