import { describe, it, expect } from "vitest";
import {
  normalizeEmail,
  assertValidEmail,
  assertValidPassword,
  generateConfirmationCode,
  InvalidEmailError,
  WeakPasswordError,
} from "./user.js";

describe("accounts domain", () => {
  it("normalizes email (trim + lowercase)", () => {
    expect(normalizeEmail("  Ana@Example.COM ")).toBe("ana@example.com");
  });

  it("accepts a valid email and rejects a bad one", () => {
    expect(() => assertValidEmail("ana@example.com")).not.toThrow();
    expect(() => assertValidEmail("nope")).toThrow(InvalidEmailError);
  });

  it("requires passwords of at least 8 chars", () => {
    expect(() => assertValidPassword("longenough")).not.toThrow();
    expect(() => assertValidPassword("short")).toThrow(WeakPasswordError);
  });

  it("generates a 6-digit numeric confirmation code", () => {
    const code = generateConfirmationCode();
    expect(code).toMatch(/^\d{6}$/);
  });
});
