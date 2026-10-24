import { NextResponse } from "next/server";
import { db } from "@/db"; // เปลี่ยน Path ให้ตรงกับที่คุณเซ็ต db ไว้
import { templates } from "@/db/schema"; // เปลี่ยน Path ให้ตรงกับ schema
import { eq, desc } from "drizzle-orm";

// 🟢 GET: ดึงรายการเทมเพลตทั้งหมดไปแสดงใน Dropdown
export async function GET() {
  try {
    const data = await db.select().from(templates).orderBy(desc(templates.createdAt));
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET Templates Error:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

// 🟢 POST: สร้างเทมเพลตใหม่ (Create)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const newTemplate = await db.insert(templates).values({
      name: body.name,
      htmlContent: body.htmlContent,
      cssLink: body.cssLink,
      schemaJson: body.schemaJson,
      authorUserId: 1, // ⚠️ สมมติว่าเป็น ID ของแอดมิน (ถ้ามีระบบ Login ให้ดึงจาก Session)
      isActive: true,
    }).returning();

    return NextResponse.json(newTemplate[0], { status: 201 });
  } catch (error) {
    console.error("POST Template Error:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

// 🟢 PUT: อัปเดตเทมเพลตเดิม (Update)
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Missing template ID" }, { status: 400 });
    }

    const updated = await db.update(templates).set({
      name: body.name,
      htmlContent: body.htmlContent,
      cssLink: body.cssLink,
      schemaJson: body.schemaJson,
      updatedAt: new Date(),
    })
    .where(eq(templates.id, body.id))
    .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("PUT Template Error:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}