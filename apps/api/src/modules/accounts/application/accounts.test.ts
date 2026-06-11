import { describe, it, expect } from "vitest";
import { makeSignup } from "./signup.js";
import { makeConfirmEmail } from "./confirmEmail.js";
import { makeLogin } from "./login.js";
import type { AccountRecord, UserRepository, PasswordHasher, TokenService } from "./ports.js";
import {
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  EmailNotConfirmedError,
  InvalidConfirmationCodeError,
  WeakPasswordError,
} from "../domain/user.js";

function fakeUsers() {
  const rows: AccountRecord[] = [];
  const repo: UserRepository = {
    findByEmail: async (email) => rows.find((r) => r.email === email) ?? null,
    findById: async (id) => rows.find((r) => r.id === id) ?? null,
    create: async (rec) => {
      const row: AccountRecord = {
        id: `u${rows.length + 1}`,
        email: rec.email,
        passwordHash: rec.passwordHash,
        confirmed: false,
        confirmationCode: rec.confirmationCode,
        createdAt: new Date(),
      };
      rows.push(row);
      return row;
    },
    markConfirmed: async (id) => {
      const r = rows.find((x) => x.id === id);
      if (r) r.confirmed = true;
    },
  };
  return { repo, rows };
}

const fakeHasher: PasswordHasher = {
  hash: async (p) => `hashed:${p}`,
  verify: async (p, stored) => stored === `hashed:${p}`,
};
const fakeTokens: TokenService = {
  sign: async (userId) => `token:${userId}`,
  verify: async (t) => (t.startsWith("token:") ? t.slice(6) : null),
};

describe("accounts use cases", () => {
  it("signs up an unconfirmed user and stores a code", async () => {
    const { repo, rows } = fakeUsers();
    const signup = makeSignup(repo, fakeHasher);
    const res = await signup({ email: " Ana@Example.com ", password: "longenough" });
    expect(res).toEqual({ email: "ana@example.com", confirmed: false });
    expect(rows[0].confirmed).toBe(false);
    expect(rows[0].confirmationCode).toMatch(/^\d{6}$/);
    expect(rows[0].passwordHash).toBe("hashed:longenough");
  });

  it("rejects a weak password and a duplicate email", async () => {
    const { repo } = fakeUsers();
    const signup = makeSignup(repo, fakeHasher);
    await expect(signup({ email: "a@b.com", password: "short" })).rejects.toBeInstanceOf(
      WeakPasswordError,
    );
    await signup({ email: "a@b.com", password: "longenough" });
    await expect(signup({ email: "a@b.com", password: "longenough" })).rejects.toBeInstanceOf(
      EmailAlreadyRegisteredError,
    );
  });

  it("confirms with the right code and refuses the wrong one", async () => {
    const { repo, rows } = fakeUsers();
    await makeSignup(repo, fakeHasher)({ email: "a@b.com", password: "longenough" });
    const confirm = makeConfirmEmail(repo);
    await expect(confirm({ email: "a@b.com", code: "000000" })).rejects.toBeInstanceOf(
      InvalidConfirmationCodeError,
    );
    const user = await confirm({ email: "a@b.com", code: rows[0].confirmationCode });
    expect(user.confirmed).toBe(true);
  });

  it("logs in only after confirmation and with the right password", async () => {
    const { repo, rows } = fakeUsers();
    await makeSignup(repo, fakeHasher)({ email: "a@b.com", password: "longenough" });
    const login = makeLogin(repo, fakeHasher, fakeTokens);
    await expect(login({ email: "a@b.com", password: "longenough" })).rejects.toBeInstanceOf(
      EmailNotConfirmedError,
    );
    await makeConfirmEmail(repo)({ email: "a@b.com", code: rows[0].confirmationCode });
    await expect(login({ email: "a@b.com", password: "wrong" })).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
    const res = await login({ email: "a@b.com", password: "longenough" });
    expect(res.token).toBe(`token:${rows[0].id}`);
    expect(res.user).toEqual({ id: rows[0].id, email: "a@b.com", confirmed: true });
  });
});
