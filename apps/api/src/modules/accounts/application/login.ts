import type { UserRepository, PasswordHasher, TokenService } from "./ports.js";
import {
  normalizeEmail,
  InvalidCredentialsError,
  EmailNotConfirmedError,
  type User,
} from "../domain/user.js";

export function makeLogin(users: UserRepository, hasher: PasswordHasher, tokens: TokenService) {
  return async function login(input: {
    email: string;
    password: string;
  }): Promise<{ token: string; user: User }> {
    const email = normalizeEmail(input.email);
    const rec = await users.findByEmail(email);
    if (!rec) throw new InvalidCredentialsError("Invalid email or password.");
    if (!(await hasher.verify(input.password, rec.passwordHash))) {
      throw new InvalidCredentialsError("Invalid email or password.");
    }
    if (!rec.confirmed) throw new EmailNotConfirmedError("Please confirm your email first.");
    const token = await tokens.sign(rec.id);
    return { token, user: { id: rec.id, email: rec.email, confirmed: true } };
  };
}
