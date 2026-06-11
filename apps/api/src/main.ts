import { serve } from "@hono/node-server";
import { createApp } from "./server.js";

const port = 3001;
const app = createApp();
console.log(`API server listening on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
