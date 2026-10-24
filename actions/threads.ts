// actions/threads.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/session";

function cleanString(val: FormDataEntryValue | null): string | null {
  if (!val || typeof val !== "string") return null;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : null;
}

// 🟢 1. สร้างกระทู้ใหม่
export async function createThreadAction(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("คุณต้องเข้าสู่ระบบก่อนสร้างกระทู้");
  }

  // รับค่าจากฟอร์ม
  let locationSlug = cleanString(formData.get("locationSlug"));
  const locationId = Number(formData.get("locationId"));
  const title = cleanString(formData.get("title"));
  const content = cleanString(formData.get("content"));

  const threadType = cleanString(formData.get("threadType")) ?? "public";
  const isLocked = threadType === "password";
  const isClosed = threadType === "closed";
  const isPinned = formData.get("isPinned") === "true";

  const password = isLocked ? cleanString(formData.get("password")) : null;

  if (!title || !content || !locationId || isNaN(locationId)) {
    throw new Error("กรุณากรอกข้อมูลหัวข้อและเนื้อหากระทู้ให้ครบถ้วน");
  }

  // ค้นหาย่านจาก locationId ในฐานข้อมูล เพื่อความถูกต้องและดึง slug อัตโนมัติถ้าฟอร์มไม่ได้ส่งมา
  const [forum] = await db
    .select()
    .from(schema.locations)
    .where(eq(schema.locations.id, locationId));

  if (!forum) {
    throw new Error("ไม่พบข้อมูลย่านที่ระบุในระบบ");
  }

  // ถ้าฟอร์มไม่ได้ส่ง locationSlug มา ให้ดึงจากข้อมูลย่านที่เจอใน DB แทน
  if (!locationSlug) {
    locationSlug = forum.slug;
  }

  const userId = Number(session.userId);

  const [newThread] = await db
    .insert(schema.threads)
    .values({
      locationId: forum.id,
      authorUserId: userId,
      title: title,
      content: content,
      pinned: isPinned,
      locked: isLocked,
      closed: isClosed,
      password: password,
    })
    .returning();

  if (!newThread) {
    throw new Error("ไม่สามารถสร้างกระทู้ได้");
  }

  revalidatePath(`/forums/${locationSlug}`);
  redirect(`/forums/${locationSlug}/${newThread.id}`);
}

// 🟢 2. แก้ไขกระทู้
export async function updateThreadAction(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("คุณต้องเข้าสู่ระบบก่อนแก้ไขกระทู้");
  }

  const threadId = Number(formData.get("threadId"));
  const locationSlug = cleanString(formData.get("locationSlug"));
  const title = cleanString(formData.get("title"));
  const content = cleanString(formData.get("content"));

  const threadType = cleanString(formData.get("threadType")) ?? "public";
  const isLocked = threadType === "password";
  const isClosed = threadType === "closed";
  const isPinned = formData.get("isPinned") === "true";

  const password = isLocked ? cleanString(formData.get("password")) : null;

  if (!threadId || isNaN(threadId) || !title || !content) {
    throw new Error("กรุณากรอกข้อมูลให้ครบถ้วน");
  }

  const userId = Number(session.userId);
  const isAdmin = session.role === "admin";

  const [existingThread] = await db
    .select()
    .from(schema.threads)
    .where(eq(schema.threads.id, threadId));

  if (!existingThread) {
    throw new Error("ไม่พบกระทู้ที่ต้องการแก้ไข");
  }

  if (existingThread.authorUserId !== userId && !isAdmin) {
    throw new Error("คุณไม่มีสิทธิ์แก้ไขกระทู้นี้");
  }

  // อัปเดตกระทู้หลัก
  await db
    .update(schema.threads)
    .set({
      title: title,
      content: content,
      pinned: isPinned,
      locked: isLocked,
      closed: isClosed,
      password: password,
      updatedAt: new Date(),
    })
    .where(eq(schema.threads.id, threadId));

  const targetSlug = locationSlug || "general";

  revalidatePath(`/forums/${targetSlug}`);
  revalidatePath(`/forums/${targetSlug}/${threadId}`);
  redirect(`/forums/${targetSlug}/${threadId}`);
}