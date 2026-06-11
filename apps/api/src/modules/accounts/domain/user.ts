import { randomInt } from "node:crypto";

export interface User {
  id: string;
  email: string;
  confirmed: boolean;
}

export class InvalidEmailError extends Error {}
export class WeakPasswordError extends Error {}
export class EmailAlreadyRegisteredError extends Error {}
export class InvalidCredentialsError extends Error {}
export class EmailNotConfirmedError extends Error {}
export class InvalidConfirmationCodeError extends Error {}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function assertValidEmail(email: string): void {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new InvalidEmailError("Please enter a valid email address.");
  }
}

export function assertValidPassword(password: string): void {
  if (password.length < 8) {
    throw new WeakPasswordError("Password must be at least 8 characters.");
  }
}

export function generateConfirmationCode(): string {
  // CSPRNG (not Math.random) — uniform over the 6-digit range [100000, 999999].
  return String(randomInt(100000, 1000000));
}
