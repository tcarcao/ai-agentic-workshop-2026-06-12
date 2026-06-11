import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  makeTestDb,
  seedOneItem,
  wireApp,
  cleanupDb,
  registerAndLogin,
  placeAnonymousOrder,
} from "./helpers.js";
import type { createApp } from "../server.js";

let db: PrismaClient;
let dbPath: string;
let app: ReturnType<typeof createApp>;
let menuItemId: string;

beforeAll(async () => {
  const t = makeTestDb();
  db = t.db;
  dbPath = t.dbPath;
  ({ menuItemId } = await seedOneItem(db));
  app = wireApp(db);
});

afterAll(async () => {
  await cleanupDb(db, dbPath);
});

// NOTE: these tests share one ephemeral DB + app (created once in beforeAll) and run
// serially (vitest config: maxWorkers 1, fileParallelism false). Each test MUST use a
// unique email and MUST NOT assert global state (e.g. a total row count) — rows
// accumulate across tests. If you need full isolation, build a fresh makeTestDb() in
// beforeEach instead.
describe("auth + order ownership (real DB, real HTTP)", () => {
  it("runs the full signup->confirm->login->me flow and sets a session cookie", async () => {
    const cookie = await registerAndLogin(app, "alice@test.com", "Password1!");
    expect(cookie).toContain("ember_session=");
    const me = await app.fetch(
      new Request("http://t/api/auth/me", { headers: { Cookie: cookie } }),
    );
    const body = (await me.json()) as { user: { email: string } | null };
    expect(body.user?.email).toBe("alice@test.com");
  });

  it("stamps a logged-in order with the user and lists it under /api/me/orders", async () => {
    const cookie = await registerAndLogin(app, "owner@test.com", "Password1!");
    const res = await app.fetch(
      new Request("http://t/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json", Cookie: cookie },
        body: JSON.stringify({ customer: "Owner", items: [{ menuItemId, quantity: 2 }] }),
      }),
    );
    expect(res.status).toBe(201);
    const mine = await (
      await app.fetch(new Request("http://t/api/me/orders", { headers: { Cookie: cookie } }))
    ).json();
    expect((mine as unknown[]).length).toBe(1);
  });

  it("claims an anonymous order but will NOT re-home an already-owned one", async () => {
    const alice = await registerAndLogin(app, "alice2@test.com", "Password1!");
    const bob = await registerAndLogin(app, "bob@test.com", "Password1!");
    const orderId = await placeAnonymousOrder(app, menuItemId);
    const claim = (cookie: string) =>
      app.fetch(
        new Request("http://t/api/me/orders/claim", {
          method: "POST",
          headers: { "content-type": "application/json", Cookie: cookie },
          body: JSON.stringify({ orderIds: [orderId] }),
        }),
      );
    const aliceList = (await (await claim(alice)).json()) as { id: string }[];
    expect(aliceList.some((o) => o.id === orderId)).toBe(true);
    const bobList = (await (await claim(bob)).json()) as { id: string }[];
    expect(bobList.some((o) => o.id === orderId)).toBe(false);
    const row = await db.order.findUnique({ where: { id: orderId } });
    const aliceUser = await db.user.findUnique({ where: { email: "alice2@test.com" } });
    expect(row?.userId).toBe(aliceUser?.id);
  });

  it("rejects an unauthenticated claim with 401", async () => {
    const orderId = await placeAnonymousOrder(app, menuItemId);
    const res = await app.fetch(
      new Request("http://t/api/me/orders/claim", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderIds: [orderId] }),
      }),
    );
    expect(res.status).toBe(401);
  });
});
