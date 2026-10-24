import { cache } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { signToken, verifyToken } from "./token";

const MAX_AGE = 60 * 60 * 24 * 30; // 30 วัน

export interface UserSession {
  userId: number;
  username: string;
  role: "admin" | "user" | string;
  characterName?: string;
}

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

export const getSession = cache(async (): Promise<UserSession | null> => {
  await connection();
  const t = (await cookies()).get("session")?.value;
  if (!t) return null;

  const payload = verifyToken(t);
  if (!payload || !payload.uid) return null;

  // 🟢 ดึงข้อมูลผู้ใช้จาก DB
  const [user] = await db
    .select({
      id: schema.users.id,
      username: schema.users.username,
      // ใส่ (schema.users as any).role เผื่อในกรณีที่ schema ยังไม่ re-generate type
      role: schema.users.role,
    })
    .from(schema.users)
    .where(eq(schema.users.id, payload.uid))
    .limit(1);

  if (!user) return null;

  const [character] = await db
    .select({ firstName: schema.characters.firstName })
    .from(schema.characters)
    .where(eq(schema.characters.userId, user.id))
    .limit(1);

  return {
    userId: user.id,
    username: user.username,
    role: (user.role as string) || "user",
    characterName: character?.firstName || undefined,
  };
});

export const getCurrentUser = cache(async () => {
  return await getSession();
});