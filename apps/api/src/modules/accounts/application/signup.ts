import type { UserRepository, PasswordHasher } from "./ports.js";
import {
  normalizeEmail,
  assertValidEmail,
  assertValidPassword,
  generateConfirmationCode,
  EmailAlreadyRegisteredError,
} from "../domain/user.js";

export function makeSignup(users: UserRepository, hasher: PasswordHasher) {
  return async function signup(input: {
    email: string;
    password: string;
  }): Promise<{ email: string; confirmed: boolean }> {
    const email = normalizeEmail(input.email);
    assertValidEmail(email);
    assertValidPassword(input.password);
    if (await users.findByEmail(email))
      throw new EmailAlreadyRegisteredError("That email is already registered.");
    const passwordHash = await hasher.hash(input.password);
    const confirmationCode = generateConfirmationCode();
    await users.create({ email, passwordHash, confirmationCode });
    return { email, confirmed: false };
  };
}
