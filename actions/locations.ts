"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, or } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/session";

/**
 * 🟢 ฟังก์ชันแปลงข้อความให้เป็น Clean Slug ที่ปลอดภัยสำหรับ URL
 * - แปลงเป็นตัวพิมพ์เล็ก
 * - ลบสัญลักษณ์พิเศษ Unicode (ภาษาไทย/ญี่ปุ่น/Emoji)
 * - เปลี่ยนช่องว่างเป็นขีดกลาง (-)
 */
function slugify(text: string): string {
  const clean = text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")     // ลบ Accent/Diacritics
    .replace(/[^a-z0-9\s-]/g, "")       // กรองเหลือเฉพาะภาษาอังกฤษ ตัวเลข และขีด
    .replace(/[\s_]+/g, "-")            // เปลี่ยนช่องว่าง/underscore เป็นขีด
    .replace(/^-+|-+$/g, "");           // ตัดขีดหัวท้ายออก

  // ถ้ากรองแล้วไม่เหลือตัวอักษรภาษาอังกฤษเลย ให้ fallback เป็น timestamp
  if (!clean) {
    return `sub-${Date.now().toString(36)}`;
  }

  return `${clean}-${Date.now().toString().slice(-4)}`;
}

export async function createSubForumAction(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("UNAUTHORIZED: กรุณาเข้าสู่ระบบก่อนดำเนินการ");
  }

  // รองรับทั้ง parentId หรือ parentSlug ที่ส่งมาจากฟอร์ม
  const parentIdOrSlug = (formData.get("parentId") as string) || (formData.get("parentSlug") as string);
  const nameEn = formData.get("nameEn") as string;
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || "";
  const bannerUrl = (formData.get("bannerUrl") as string) || null;
  const themeColor = (formData.get("themeColor") as string) || "#38c8ff"; // 🎨 สีธีมประจำเขต

  let residentChars: number[] = [];
  try {
    const rawResident = formData.get("residentChars") as string;
    if (rawResident) {
      residentChars = JSON.parse(rawResident);
    }
  } catch {
    residentChars = [];
  }

  if (!parentIdOrSlug || !nameEn || !name) {
    throw new Error("BAD_REQUEST: กรุณากรอกข้อมูลให้ครบถ้วน");
  }

  // 🟢 ค้นหา Parent Location รองรับทั้งแบบส่งเป็น ID (number) หรือ Slug (string)
  const parentNum = Number(parentIdOrSlug);
  const isNum = !isNaN(parentNum);

  const [parentForum] = await db
    .select()
    .from(schema.locations)
    .where(
      isNum
        ? eq(schema.locations.id, parentNum)
        : or(
            eq(schema.locations.slug, parentIdOrSlug),
            eq(schema.locations.id, Number(parentIdOrSlug.replace(/\D/g, "")) || 0)
          )
    )
    .limit(1);

  if (!parentForum) {
    throw new Error(`NOT_FOUND: ไม่พบฟอรั่มหลัก: ${parentIdOrSlug}`);
  }

  // 🟢 Auto-Generate Slug ที่ปลอดภัยจาก Unicode
  const generatedSlug = slugify(nameEn);

  await db.insert(schema.locations).values({
    slug: generatedSlug,
    name,
    nameEn: nameEn.toUpperCase(),
    description,
    bannerUrl,
    residentChars,
    themeColor, // 🟢 บันทึกสีธีม
    parentId: parentForum.id,
    isMainMapZone: false,
    danger: 0,
    sortOrder: 10,
    createdByUserId: Number(session.userId),
  });

  // Revalidate แคชของหน้าฟอรั่มแม่
  revalidatePath(`/forums/${parentForum.slug}`, "page");
  revalidatePath("/forums", "page");

  // Redirect กลับไปยังฟอรั่มหลัก
  redirect(`/forums/${parentForum.slug}`);
}

export async function updateSubForumAction(forumId: number, formData: FormData) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("UNAUTHORIZED: กรุณาเข้าสู่ระบบก่อนดำเนินการ");
  }

  const nameEn = formData.get("nameEn") as string;
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || "";
  const bannerUrl = (formData.get("bannerUrl") as string) || null;
  const themeColor = (formData.get("themeColor") as string) || "#38c8ff"; 

  // 🟢 แปลง string ของ JSON ให้กลับเป็น number[] สำหรับคอลัมน์ jsonb
  let residentChars: number[] = [];
  try {
    const rawResident = formData.get("residentChars") as string;
    if (rawResident) {
      residentChars = JSON.parse(rawResident);
    }
  } catch {
    residentChars = [];
  }

  const [forum] = await db
    .select()
    .from(schema.locations)
    .where(eq(schema.locations.id, Number(forumId)))
    .limit(1);

  if (!forum) {
    throw new Error(`NOT_FOUND: ไม่พบฟอรั่มที่ต้องการแก้ไขในระบบ`);
  }

  // อัปเดตข้อมูลลงฐานข้อมูล
  await db
    .update(schema.locations)
    .set({
      name,
      nameEn: nameEn ? nameEn.toUpperCase() : "",
      themeColor,
      description,
      bannerUrl,
      residentChars, // ส่งค่าเป็น number[] ถูกต้องตาม schema
    })
    .where(eq(schema.locations.id, forum.id));

  revalidatePath(`/forums/${forum.slug}`, "page");
  revalidatePath("/forums", "page");

  redirect(`/forums/${forum.slug}`);
}