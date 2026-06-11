import type {
  Restaurant,
  Order,
  PlaceOrderRequest,
  PlaceOrderResponse,
  User,
  SignupRequest,
  SignupResponse,
  ConfirmRequest,
  LoginRequest,
  AuthResponse,
} from "@workshop/shared";

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...init });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function postJson<T>(url: string, payload: unknown): Promise<T> {
  return apiFetch<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// --- catalog + orders (existing) ---
export function getRestaurants(): Promise<Restaurant[]> {
  return apiFetch<Restaurant[]>("/api/restaurants");
}
export function getRestaurant(id: string): Promise<Restaurant> {
  return apiFetch<Restaurant>(`/api/restaurants/${id}`);
}
export function getOrder(id: string): Promise<Order> {
  return apiFetch<Order>(`/api/orders/${id}`);
}
export function placeOrder(req: PlaceOrderRequest): Promise<PlaceOrderResponse> {
  return postJson<PlaceOrderResponse>("/api/orders", req);
}

// --- auth ---
export function signup(req: SignupRequest): Promise<SignupResponse> {
  return postJson<SignupResponse>("/api/auth/signup", req);
}
export function confirmEmail(req: ConfirmRequest): Promise<AuthResponse> {
  return postJson<AuthResponse>("/api/auth/confirm", req);
}
export function login(req: LoginRequest): Promise<AuthResponse> {
  return postJson<AuthResponse>("/api/auth/login", req);
}
export function logout(): Promise<{ ok: boolean }> {
  return postJson<{ ok: boolean }>("/api/auth/logout", {});
}
export async function getMe(): Promise<User | null> {
  const res = await apiFetch<{ user: User | null }>("/api/auth/me");
  return res.user;
}
// DEV ONLY helper — returns null in production (route absent → 404 → null).
export async function getDevConfirmationCode(email: string): Promise<string | null> {
  try {
    const res = await apiFetch<{ code: string | null }>(
      `/api/dev/confirmation-code?email=${encodeURIComponent(email)}`,
    );
    return res.code;
  } catch {
    return null;
  }
}

// --- my orders (logged-in) ---
export function listMyOrders(): Promise<Order[]> {
  return apiFetch<Order[]>("/api/me/orders");
}
export function claimOrders(orderIds: string[]): Promise<Order[]> {
  return postJson<Order[]>("/api/me/orders/claim", { orderIds });
}
