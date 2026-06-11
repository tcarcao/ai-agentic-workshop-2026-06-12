import { randomUUID } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaRestaurantRepository } from "../modules/ordering/infrastructure/PrismaRestaurantRepository.js";
import { PrismaOrderRepository } from "../modules/ordering/infrastructure/PrismaOrderRepository.js";
import { PrismaUserRepository } from "../modules/accounts/infrastructure/PrismaUserRepository.js";
import { ScryptPasswordHasher } from "../modules/accounts/infrastructure/ScryptPasswordHasher.js";
import { JwtTokenService } from "../modules/accounts/infrastructure/JwtTokenService.js";
import { makeListRestaurants } from "../modules/ordering/application/listRestaurants.js";
import { makeGetRestaurantMenu } from "../modules/ordering/application/getRestaurantMenu.js";
import { makePlaceOrder } from "../modules/ordering/application/placeOrder.js";
import { makeGetOrder } from "../modules/ordering/application/getOrder.js";
import { makeListUserOrders } from "../modules/ordering/application/listUserOrders.js";
import { makeClaimOrders } from "../modules/ordering/application/claimOrders.js";
import { makeSignup } from "../modules/accounts/application/signup.js";
import { makeConfirmEmail } from "../modules/accounts/application/confirmEmail.js";
import { makeLogin } from "../modules/accounts/application/login.js";
import { makeGetCurrentUser } from "../modules/accounts/application/getCurrentUser.js";
import { makeGetConfirmationCode } from "../modules/accounts/application/getConfirmationCode.js";
import { createApp } from "../server.js";

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export function makeTestDb() {
  const dbPath = path.join(os.tmpdir(), `ember-test-${randomUUID()}.db`);
  const url = `file:${dbPath}`;
  execSync("npx prisma migrate deploy", {
    cwd: apiRoot,
    env: { ...process.env, DATABASE_URL: url },
    stdio: "ignore",
  });
  const db = new PrismaClient({ adapter: new PrismaLibSql({ url }) });
  return { db, dbPath };
}

export async function seedOneItem(db: PrismaClient) {
  const r = await db.restaurant.create({
    data: {
      name: "Test Bistro",
      cuisine: "Test",
      imageUrl: "",
      ratingAvg: 5,
      ratingCount: 1,
      deliveryMinutes: 15,
      deliveryFeeCents: 0,
      priceLevel: 1,
      description: "",
    },
  });
  const item = await db.menuItem.create({
    data: {
      name: "Burger",
      description: "",
      priceCents: 999,
      dietaryTags: "",
      category: "Mains",
      popular: false,
      restaurantId: r.id,
    },
  });
  return { restaurantId: r.id, menuItemId: item.id };
}

export function wireApp(db: PrismaClient) {
  const restaurantRepo = new PrismaRestaurantRepository(db);
  const orderRepo = new PrismaOrderRepository(db);
  const userRepo = new PrismaUserRepository(db);
  const hasher = new ScryptPasswordHasher();
  const tokens = new JwtTokenService();
  const ordering = {
    listRestaurants: makeListRestaurants(restaurantRepo),
    getRestaurantMenu: makeGetRestaurantMenu(restaurantRepo),
    placeOrder: makePlaceOrder(restaurantRepo, orderRepo),
    getOrder: makeGetOrder(orderRepo),
    listUserOrders: makeListUserOrders(orderRepo),
    claimOrders: makeClaimOrders(orderRepo),
  };
  const accounts = {
    signup: makeSignup(userRepo, hasher),
    confirmEmail: makeConfirmEmail(userRepo),
    login: makeLogin(userRepo, hasher, tokens),
    getCurrentUser: makeGetCurrentUser(userRepo),
    getConfirmationCode: makeGetConfirmationCode(userRepo),
    verifyToken: (t: string) => tokens.verify(t),
  };
  return createApp(ordering, accounts);
}

export function cleanupDb(db: PrismaClient, dbPath: string) {
  return db.$disconnect().then(() => {
    try {
      fs.unlinkSync(dbPath);
    } catch {
      /* ignore */
    }
  });
}

export async function registerAndLogin(
  app: ReturnType<typeof createApp>,
  email: string,
  password: string,
) {
  const j = (p: string, body: unknown) =>
    new Request("http://t" + p, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  await app.fetch(j("/api/auth/signup", { email, password }));
  const codeRes = await app.fetch(
    new Request(`http://t/api/dev/confirmation-code?email=${encodeURIComponent(email)}`),
  );
  const { code } = (await codeRes.json()) as { code: string };
  await app.fetch(j("/api/auth/confirm", { email, code }));
  const loginRes = await app.fetch(j("/api/auth/login", { email, password }));
  return (loginRes.headers.get("set-cookie") ?? "").split(";")[0];
}

export async function placeAnonymousOrder(app: ReturnType<typeof createApp>, menuItemId: string) {
  const r = await Promise.resolve(
    app.fetch(
      new Request("http://t/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ customer: "Guest", items: [{ menuItemId, quantity: 1 }] }),
      }),
    ),
  );
  const b = (await r.json()) as { id: string };
  return b.id;
}
