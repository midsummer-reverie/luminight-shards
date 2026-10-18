"use server";

import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { createSession, destroySession } from "@/lib/session";
import { checkPassword, hashPassword } from "@/lib/password";

export type AuthState = { error?: string; username?: string };

export async function login(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const username = String(fd.get("username") ?? "").trim();
  const password = String(fd.get("password") ?? "").slice(0, 200);

  const [u] = username
    ? await db.select().from(schema.users)
        .where(sql`lower(${schema.users.username}) = ${username.toLowerCase()}`).limit(1)
    : [];

  const { ok, upgrade } = await checkPassword(password, u?.password ?? null);
  if (!u || !ok) return { error: "ACCESS DENIED · ชื่อหรือรหัสผ่านไม่ถูกต้อง", username };

  // รหัสที่แอดมินพิมพ์ลงตารางเป็น plain text → แปลงเป็น hash ทันทีที่ล็อกอินครั้งแรก
  if (upgrade) {
    await db.update(schema.users).set({ password: await hashPassword(password) }).where(eq(schema.users.id, u.id));
  }

  await createSession(u.id);
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}