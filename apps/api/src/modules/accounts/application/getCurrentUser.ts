import type { UserRepository } from "./ports.js";
import type { User } from "../domain/user.js";

export function makeGetCurrentUser(users: UserRepository) {
  return async function getCurrentUser(userId: string): Promise<User | null> {
    const rec = await users.findById(userId);
    return rec ? { id: rec.id, email: rec.email, confirmed: rec.confirmed } : null;
  };
}
