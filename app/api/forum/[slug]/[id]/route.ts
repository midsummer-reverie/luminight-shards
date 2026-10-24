import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params;
    const threadId = Number(id);

    const session = await getSession();
    const currentUserId = session?.userId ? Number(session.userId) : null;

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isNaN(threadId)) {
      return NextResponse.json({ error: "Invalid thread ID" }, { status: 400 });
    }

    const body = await req.json();

    // บันทึกโพสต์ใหม่ลงตาราง posts
    const [newPost] = await db
      .insert(schema.posts)
      .values({
        threadId: threadId,
        userId: currentUserId,
        characterId: body.characterId ? Number(body.characterId) : null,
        userCodeId: body.userCodeId ? Number(body.userCodeId) : null,
        // 🟢 แก้ชื่อเป็น postVariablesJson ให้ตรงกับ DB และไม่ต้อง JSON.stringify
        postVariablesJson: body.postValuesJson || null,
        renderedHtml: body.renderedHtml || "",
        body: "",
      })
      .returning();

    // อัปเดตเวลาตอบกลับล่าสุดของกระทู้
    await db
      .update(schema.threads)
      .set({ updatedAt: new Date() })
      .where(eq(schema.threads.id, threadId));

    return NextResponse.json({ success: true, data: newPost });
  } catch (error) {
    console.error("🚨 Create Post Error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}