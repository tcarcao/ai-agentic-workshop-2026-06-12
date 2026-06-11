import type { UserRepository } from "./ports.js";
import { normalizeEmail, InvalidConfirmationCodeError, type User } from "../domain/user.js";

export function makeConfirmEmail(users: UserRepository) {
  return async function confirmEmail(input: { email: string; code: string }): Promise<User> {
    const email = normalizeEmail(input.email);
    const rec = await users.findByEmail(email);
    if (!rec) throw new InvalidConfirmationCodeError("Invalid confirmation code.");
    if (rec.confirmed) return { id: rec.id, email: rec.email, confirmed: true };
    if (rec.confirmationCode !== input.code.trim())
      throw new InvalidConfirmationCodeError("Invalid confirmation code.");
    await users.markConfirmed(rec.id);
    return { id: rec.id, email: rec.email, confirmed: true };
  };
}
