import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { PasswordHasher } from "../application/ports.js";

const scryptAsync = promisify(scrypt);
const KEY_LEN = 64;

export class ScryptPasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const derived = (await scryptAsync(plain, salt, KEY_LEN)) as Buffer;
    return `${salt}:${derived.toString("hex")}`;
  }

  async verify(plain: string, stored: string): Promise<boolean> {
    const [salt, key] = stored.split(":");
    if (!salt || !key) return false;
    const keyBuf = Buffer.from(key, "hex");
    const derived = (await scryptAsync(plain, salt, KEY_LEN)) as Buffer;
    return keyBuf.length === derived.length && timingSafeEqual(keyBuf, derived);
  }
}
