import { execSync } from "node:child_process";

// Prepare a DEDICATED e2e database BEFORE Playwright boots the API webServer.
// (Playwright starts webServer before globalSetup, so the DB must already have its
// schema + seed data here — otherwise the API boots against an empty DB and its
// health check never passes.) This never touches the developer's dev.db.
const env = { ...process.env, DATABASE_URL: "file:prisma/e2e.db" };

console.log("[e2e] preparing file:prisma/e2e.db (migrate + seed)…");
execSync("npm run db:migrate -w apps/api", { cwd: "..", stdio: "inherit", env });
execSync("npm run db:seed -w apps/api", { cwd: "..", stdio: "inherit", env });
console.log("[e2e] e2e database ready.");
