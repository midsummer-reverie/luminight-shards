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
export async function createThreadAction(
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const session = await getSession();
  if (!session?.userId) {
    return { error: "คุณต้องเข้าสู่ระบบก่อนสร้างกระทู้" };
  }

  let redirectUrl = "";

  try {
    let locationSlug = cleanString(formData.get("locationSlug"));
    const locationId = Number(formData.get("locationId"));
    const title = cleanString(formData.get("title"));
    const content = cleanString(formData.get("content"));

    const threadType = cleanString(formData.get("threadType")) ?? "public";
    const isLocked = threadType === "password" || formData.get("locked") === "true";
    const isClosed = threadType === "closed" || formData.get("closed") === "true";
    const isPinned = formData.get("isPinned") === "true" || formData.get("pinned") === "true";

    const password = isLocked ? cleanString(formData.get("password")) : null;

    if (!title || !content || !locationId || isNaN(locationId)) {
      return { error: "กรุณากรอกข้อมูลหัวข้อและเนื้อหากระทู้ให้ครบถ้วน" };
    }

    const [forum] = await db
      .select()
      .from(schema.locations)
      .where(eq(schema.locations.id, locationId));

    if (!forum) {
      return { error: "ไม่พบข้อมูลย่านที่ระบุในระบบ" };
    }

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
      return { error: "ไม่สามารถสร้างกระทู้ได้" };
    }

    revalidatePath(`/forums/${locationSlug}`);
    redirectUrl = `/forums/${locationSlug}/${newThread.id}`;
  } catch (err: any) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("🚨 [createThreadAction Error]:", err);
    return { error: "เกิดข้อผิดพลาดในการบันทึกข้อมูลเข้าฐานข้อมูล" };
  }

  if (redirectUrl) {
    redirect(redirectUrl);
  }

  return { success: true };
}

// 🟢 2. แก้ไขกระทู้
export async function updateThreadAction(
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const session = await getSession();
  if (!session?.userId) {
    return { error: "คุณต้องเข้าสู่ระบบก่อนแก้ไขกระทู้" };
  }

  let redirectUrl = "";

  try {
    const threadId = Number(formData.get("threadId"));
    const locationSlug = cleanString(formData.get("locationSlug"));
    const title = cleanString(formData.get("title"));
    const content = cleanString(formData.get("content"));

    const threadType = cleanString(formData.get("threadType")) ?? "public";
    const isLocked = threadType === "password" || formData.get("locked") === "true";
    const isClosed = threadType === "closed" || formData.get("closed") === "true";
    const isPinned = formData.get("isPinned") === "true" || formData.get("pinned") === "true";

    const password = isLocked ? cleanString(formData.get("password")) : null;

    if (!threadId || isNaN(threadId) || !title || !content) {
      return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
    }

    const userId = Number(session.userId);
    const isAdmin = session.role === "admin";

    const [existingThread] = await db
      .select()
      .from(schema.threads)
      .where(eq(schema.threads.id, threadId));

    if (!existingThread) {
      return { error: "ไม่พบกระทู้ที่ต้องการแก้ไข" };
    }

    if (existingThread.authorUserId !== userId && !isAdmin) {
      return { error: "คุณไม่มีสิทธิ์แก้ไขกระทู้นี้" };
    }

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
    redirectUrl = `/forums/${targetSlug}/${threadId}`;
  } catch (err: any) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("🚨 [updateThreadAction Error]:", err);
    return { error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" };
  }

  if (redirectUrl) {
    redirect(redirectUrl);
  }

  return { success: true };
}