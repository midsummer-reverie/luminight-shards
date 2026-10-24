"use server";

import { db, schema } from "@/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createBulletin(formData: FormData) {
  try {
    const session = await getSession();

    // 1. ตรวจสอบสิทธิ์ Admin
    if (!session || session.role !== "admin") {
      return { success: false, error: "ไม่มีสิทธิ์ในการสร้างประกาศ" };
    }

    const tag = formData.get("tag") as string;
    const color = formData.get("color") as string;
    const title = formData.get("title") as string;
    const hook = formData.get("hook") as string;
    const linkUrl = formData.get("linkUrl") as string;

    // 2. Validate ข้อมูลจำเป็น
    if (!title || title.trim() === "") {
      return { success: false, error: "กรุณากรอกข้อความประกาศ" };
    }

    const authorUserId = session.userId ? Number(session.userId) : null;
    if (authorUserId === null || isNaN(authorUserId)) {
      return { success: false, error: "ไม่พบข้อมูลผู้ใช้งานที่ถูกต้อง" };
    }

    // 3. บันทึกลง Database
    await db.insert(schema.bulletins).values({
      tag: tag?.trim() || "ข่าวสาร",
      color: color?.trim() || "#38c8ff",
      title: title.trim(),
      hook: hook?.trim() || null,
      linkUrl: linkUrl?.trim() || null,
      authorUserId: authorUserId,
    });

    // 4. ล้างแคชหน้าแรกเพื่อให้ประกาศใหม่อัปเดตทันที
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    console.error("Error creating bulletin:", err);
    return { success: false, error: "เกิดข้อผิดพลาดในการบันทึกข้อมูลเข้าฐานข้อมูล" };
  }
}