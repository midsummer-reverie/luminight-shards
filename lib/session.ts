import { cache } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { signToken, verifyToken } from "./token";

const MAX_AGE = 60 * 60 * 24 * 30; // 30 วัน

export async function createSession(uid: number) {
  (await cookies()).set("session", signToken({ uid, exp: Date.now() + MAX_AGE * 1000 }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete("session");
}

export const getSession = cache(async () => {
  // verifyToken ใช้ Date.now() ตรวจวันหมดอายุ → ต้องทำตอน request เท่านั้น (cacheComponents)
  await connection();
  const t = (await cookies()).get("session")?.value;
  return t ? verifyToken(t) : null;
});

// อ่าน cookies = dynamic → เรียกใน <Suspense> เท่านั้น
export const getCurrentUser = cache(async () => {
  const s = await getSession();
  if (!s) return null;
  const [u] = await db
    .select({ id: schema.users.id, username: schema.users.username })
    .from(schema.users)
    .where(eq(schema.users.id, s.uid))
    .limit(1);
  return u ?? null;
});