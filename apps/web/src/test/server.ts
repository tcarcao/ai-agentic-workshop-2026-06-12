import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

export const server = setupServer(
  http.get("/api/auth/me", () => HttpResponse.json({ user: null })),
  http.get("/api/restaurants", () => HttpResponse.json([])),
  http.get("/api/me/orders", () => HttpResponse.json([])),
);
