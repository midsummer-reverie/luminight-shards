import { createHmac, timingSafeEqual } from "node:crypto";

export type Session = { uid: number; exp: number };

const sign = (body: string) =>
  createHmac("sha256", process.env.SESSION_SECRET!).update(body).digest("base64url");

export function signToken(s: Session) {
  const body = Buffer.from(JSON.stringify(s)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyToken(token: string): Session | null {
  const [body, sig] = token.split(".");
  if (!body || !sig || !process.env.SESSION_SECRET) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(body));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const s = JSON.parse(Buffer.from(body, "base64url").toString()) as Session;
    return s.exp > Date.now() ? s : null;
  } catch {
    return null;
  }
}