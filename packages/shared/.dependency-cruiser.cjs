module.exports = {
  forbidden: [
    {
      name: "shared-imports-no-app",
      comment: "@workshop/shared is a leaf — must not import from either app",
      severity: "error",
      from: { path: "^src" },
      to: { path: "(@workshop/api|@workshop/web|apps/)" },
    },
    { name: "no-circular", severity: "error", from: {}, to: { circular: true } },
  ],
  options: { tsConfig: { fileName: "tsconfig.json" }, doNotFollow: { path: "node_modules" } },
};
