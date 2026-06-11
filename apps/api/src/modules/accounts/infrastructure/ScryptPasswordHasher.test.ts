import { describe, it, expect } from "vitest";
import { ScryptPasswordHasher } from "./ScryptPasswordHasher.js";

describe("ScryptPasswordHasher", () => {
  const hasher = new ScryptPasswordHasher();

  it("verifies the correct password and rejects a wrong one", async () => {
    const stored = await hasher.hash("correct horse battery staple");
    expect(stored).toContain(":");
    expect(await hasher.verify("correct horse battery staple", stored)).toBe(true);
    expect(await hasher.verify("wrong password", stored)).toBe(false);
  });

  it("produces a different hash each time (random salt)", async () => {
    const a = await hasher.hash("samepassword");
    const b = await hasher.hash("samepassword");
    expect(a).not.toBe(b);
  });
});
