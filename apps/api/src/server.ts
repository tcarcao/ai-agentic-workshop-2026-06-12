import { Hono } from "hono";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import type {
  SignupRequest,
  ConfirmRequest,
  LoginRequest,
  PlaceOrderRequest,
  ClaimOrdersRequest,
} from "@workshop/shared";
import { ordering as defaultOrdering } from "./modules/ordering/container.js";
import { accounts as defaultAccounts } from "./modules/accounts/container.js";
import {
  EmptyOrderError,
  UnknownMenuItemError,
  InvalidQuantityError,
} from "./modules/ordering/domain/order.js";
import {
  InvalidEmailError,
  WeakPasswordError,
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  EmailNotConfirmedError,
  InvalidConfirmationCodeError,
} from "./modules/accounts/domain/user.js";

type Variables = { userId: string | null };
type Ordering = typeof defaultOrdering;
type Accounts = typeof defaultAccounts;

const SESSION_COOKIE = "ember_session";
const isDev = process.env.NODE_ENV !== "production";

function authError(e: unknown): number | null {
  if (e instanceof InvalidEmailError || e instanceof WeakPasswordError) return 422;
  if (e instanceof EmailAlreadyRegisteredError) return 409;
  if (e instanceof InvalidCredentialsError || e instanceof EmailNotConfirmedError) return 401;
  if (e instanceof InvalidConfirmationCodeError) return 400;
  return null;
}

export function createApp(
  ordering: Ordering = defaultOrdering,
  accounts: Accounts = defaultAccounts,
) {
  const app = new Hono<{ Variables: Variables }>();

  // --- identity at the edge: resolve userId (or null) from the session cookie ---
  app.use("*", async (c, next) => {
    const token = getCookie(c, SESSION_COOKIE);
    c.set("userId", token ? await accounts.verifyToken(token) : null);
    await next();
  });

  // --- auth routes ---
  // Request bodies are typed as Partial<contract type> from @workshop/shared:
  // the field NAMES are compile-checked against the contract (a rename breaks both
  // sides at once), while Partial<> stays honest about unvalidated runtime JSON.
  app.post("/api/auth/signup", async (c) => {
    const body = await c.req.json<Partial<SignupRequest>>();
    try {
      const res = await accounts.signup({ email: body.email ?? "", password: body.password ?? "" });
      return c.json(res, 201);
    } catch (e) {
      const status = authError(e);
      if (status) return c.json({ error: (e as Error).message }, status as 400);
      throw e;
    }
  });

  app.post("/api/auth/confirm", async (c) => {
    const body = await c.req.json<Partial<ConfirmRequest>>();
    try {
      const user = await accounts.confirmEmail({ email: body.email ?? "", code: body.code ?? "" });
      return c.json({ user });
    } catch (e) {
      const status = authError(e);
      if (status) return c.json({ error: (e as Error).message }, status as 400);
      throw e;
    }
  });

  app.post("/api/auth/login", async (c) => {
    const body = await c.req.json<Partial<LoginRequest>>();
    try {
      const { token, user } = await accounts.login({
        email: body.email ?? "",
        password: body.password ?? "",
      });
      setCookie(c, SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "Lax",
        path: "/",
        secure: !isDev,
        maxAge: 60 * 60 * 24 * 7,
      });
      return c.json({ user });
    } catch (e) {
      const status = authError(e);
      if (status) return c.json({ error: (e as Error).message }, status as 400);
      throw e;
    }
  });

  app.post("/api/auth/logout", (c) => {
    deleteCookie(c, SESSION_COOKIE, { path: "/" });
    return c.json({ ok: true });
  });

  app.get("/api/auth/me", async (c) => {
    const userId = c.get("userId");
    if (!userId) return c.json({ user: null });
    const user = await accounts.getCurrentUser(userId);
    return c.json({ user });
  });

  // --- DEV ONLY: reveal the confirmation code a real system would email ---
  if (isDev) {
    app.get("/api/dev/confirmation-code", async (c) => {
      const email = c.req.query("email") ?? "";
      const code = await accounts.getConfirmationCode(email);
      return c.json({ code });
    });
  }

  // GET /api/restaurants
  app.get("/api/restaurants", async (c) => {
    const restaurants = await ordering.listRestaurants();
    return c.json(restaurants);
  });

  // GET /api/restaurants/:id
  app.get("/api/restaurants/:id", async (c) => {
    const id = c.req.param("id");
    const restaurant = await ordering.getRestaurantMenu(id);
    if (!restaurant) return c.json({ error: "Not found" }, 404);
    return c.json(restaurant);
  });

  // POST /api/orders
  app.post("/api/orders", async (c) => {
    const body = await c.req.json<Partial<PlaceOrderRequest>>();
    try {
      const result = await ordering.placeOrder({
        customer: body.customer ?? "",
        items: body.items ?? [],
        userId: c.get("userId"),
      });
      return c.json(result, 201);
    } catch (e) {
      if (
        e instanceof EmptyOrderError ||
        e instanceof UnknownMenuItemError ||
        e instanceof InvalidQuantityError
      ) {
        return c.json({ error: (e as Error).message }, 400);
      }
      throw e;
    }
  });

  // GET /api/orders/:id  (NEW — was missing in original Next app)
  app.get("/api/orders/:id", async (c) => {
    const id = c.req.param("id");
    const order = await ordering.getOrder(id);
    if (!order) return c.json({ error: "Not found" }, 404);
    return c.json(order);
  });

  app.get("/api/me/orders", async (c) => {
    const userId = c.get("userId");
    if (!userId) return c.json({ error: "Not authenticated" }, 401);
    return c.json(await ordering.listUserOrders(userId));
  });

  app.post("/api/me/orders/claim", async (c) => {
    const userId = c.get("userId");
    if (!userId) return c.json({ error: "Not authenticated" }, 401);
    const { orderIds } = await c.req.json<Partial<ClaimOrdersRequest>>();
    await ordering.claimOrders(orderIds ?? [], userId);
    return c.json(await ordering.listUserOrders(userId));
  });

  return app;
}
