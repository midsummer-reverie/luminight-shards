import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;
const HASHED = /^[0-9a-f]{32}:[0-9a-f]{128}$/;

export const isHashed = (stored: string) => HASHED.test(stored);

export async function hashPassword(pw: string) {
  const salt = randomBytes(16);
  const key = await scrypt(pw, salt, 64);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifyPassword(pw: string, stored: string) {
  const [s, k] = stored.split(":");
  if (!s || !k) return false;
  const key = await scrypt(pw, Buffer.from(s, "hex"), 64);
  const expected = Buffer.from(k, "hex");
  return key.length === expected.length && timingSafeEqual(key, expected);
}

// แอดมินพิมพ์รหัสตรง ๆ ลงตาราง → เทียบแบบ plain แล้วบอกให้ผู้เรียกแปลงเป็น hash
export async function checkPassword(pw: string, stored: string | null) {
  const s = (stored ?? "").trim();
  if (!s) return { ok: false, upgrade: false };
  if (isHashed(s)) return { ok: await verifyPassword(pw, s), upgrade: false };
  const a = Buffer.from(pw), b = Buffer.from(s);
  const ok = a.length === b.length && timingSafeEqual(a, b);
  return { ok, upgrade: ok };
}