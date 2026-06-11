import { sign, verify } from "hono/jwt";
import type { TokenService } from "../application/ports.js";

// In production a real secret is mandatory — never sign tokens with a public,
// in-repo default (that would let anyone forge a session for any userId).
// The dev fallback keeps local setup zero-config.
if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET environment variable is required in production");
}
const SECRET = process.env.AUTH_SECRET ?? "dev-ember-secret-change-me";
const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export class JwtTokenService implements TokenService {
  async sign(userId: string): Promise<string> {
    const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
    return sign({ userId, exp }, SECRET, "HS256");
  }

  async verify(token: string): Promise<string | null> {
    try {
      const payload = await verify(token, SECRET, "HS256");
      const userId = (payload as { userId?: unknown }).userId;
      return typeof userId === "string" ? userId : null;
    } catch {
      return null;
    }
  }
}
