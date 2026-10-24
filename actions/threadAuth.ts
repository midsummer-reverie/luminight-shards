// actions/threadAuth.ts
"use server";

import { eq } from "drizzle-orm";
import { db, schema } from "@/db";

export async function verifyThreadPasswordAction(threadId: number, passwordInput: string) {
  const [thread] = await db
    .select({ password: schema.threads.password, locked: schema.threads.locked })
    .from(schema.threads)
    .where(eq(schema.threads.id, threadId));

  if (!thread || !thread.locked) {
    return { success: true };
  }

  if (thread.password === passwordInput) {
    return { success: true };
  }

  return { success: false, error: "รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง" };
}