import type { UserRepository } from "./ports.js";
import { normalizeEmail } from "../domain/user.js";

// DEV ONLY: surfaces the code a real system would email. The route that calls
// this must be mounted only when NODE_ENV !== "production".
export function makeGetConfirmationCode(users: UserRepository) {
  return async function getConfirmationCode(email: string): Promise<string | null> {
    const rec = await users.findByEmail(normalizeEmail(email));
    return rec && !rec.confirmed ? rec.confirmationCode : null;
  };
}
