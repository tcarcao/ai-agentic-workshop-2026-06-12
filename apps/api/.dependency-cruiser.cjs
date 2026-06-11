/** Architecture boundary rules for every module hexagon under src/modules/*. */
module.exports = {
  forbidden: [
    {
      name: "domain-stays-pure",
      comment: "any module's domain must not import application, infrastructure, prisma, or react",
      severity: "error",
      from: { path: "^src/modules/[^/]+/domain" },
      to: { path: "(^src/modules/[^/]+/(application|infrastructure))|(@prisma/client)|(^react)" },
    },
    {
      name: "application-depends-on-ports-not-prisma",
      comment: "use cases must not import infrastructure or prisma directly",
      severity: "error",
      from: { path: "^src/modules/[^/]+/application" },
      to: { path: "(^src/modules/[^/]+/infrastructure)|(@prisma/client)" },
    },
    {
      name: "server-uses-the-facades",
      comment: "server.ts must reach modules only through their containers — never infrastructure or prisma",
      severity: "error",
      from: { path: "^src/server" },
      to: { path: "(^src/modules/[^/]+/infrastructure)|(@prisma/client)" },
    },
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-cross-module-internals",
      comment: "modules meet only via container facades, never each other's internal layers",
      severity: "error",
      from: { path: "^src/modules/([^/]+)/(domain|application|infrastructure)/" },
      to:   {
        path:    "^src/modules/[^/]+/(domain|application|infrastructure)/",
        pathNot: "^src/modules/$1/",
      },
    },
    {
      name: "prisma-only-via-shared",
      comment: "only src/shared/prismaClient.ts may import @prisma/client; infrastructure adapters (the adapter layer) and integration tests (which wire an ephemeral DB) are exempt",
      severity: "error",
      from: { path: "^src/(?!shared/prismaClient|modules/[^/]+/infrastructure|tests/)" },
      to:   { path: "@prisma/client" },
    },
    {
      name: "domain-zero-external-deps",
      comment: "domain may import only its own module + @workshop/shared (+ node:crypto for CSPRNG)",
      severity: "error",
      from: { path: "^src/modules/[^/]+/domain" },
      to: {
        pathNot: ["^src/modules/[^/]+/domain", "@workshop/shared", "^node:crypto$"],
        dependencyTypes: ["npm", "local"],
      },
    },
  ],
  options: { tsConfig: { fileName: "tsconfig.json" }, doNotFollow: { path: "node_modules" } },
};
