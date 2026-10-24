import { NextResponse } from "next/server";
import { db } from "@/db";
import { userCodes, userCodeCharacters, characters, templates } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/session";

// 🟢 GET: ดึงข้อมูลที่จำเป็นสำหรับสตูดิโอ (เทมเพลต, ตัวละครของผู้ใช้, และโค้ดที่เคยเซฟไว้)
export async function GET(req: Request) {
  try {
    const session = await getSession();
    const currentUserId = session?.userId ? Number(session.userId) : null;

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. ดึงเทมเพลตที่ Active
    const availableTemplates = await db.select().from(templates).where(eq(templates.isActive, true));
    
    // 2. ดึงตัวละครทั้งหมดของ User คนนี้
    const userCharacters = await db.select().from(characters).where(eq(characters.userId, currentUserId));

    // 3. ดึงโค้ดที่เคยบันทึกไว้พร้อมกับไอดีตัวละครที่ผูกไว้
    const userSavedCodes = await db.select().from(userCodes).where(eq(userCodes.userId, currentUserId));
    
    const savedCodesWithChars = await Promise.all(
      userSavedCodes.map(async (code) => {
        const charLinks = await db
          .select({ characterId: userCodeCharacters.characterId })
          .from(userCodeCharacters)
          .where(eq(userCodeCharacters.userCodeId, code.id));
        
        return {
          ...code,
          characterIds: charLinks.map((l) => l.characterId),
        };
      })
    );

    return NextResponse.json({ 
      templates: availableTemplates, 
      characters: userCharacters,
      savedCodes: savedCodesWithChars
    });
  } catch (error) {
    console.error("GET Studio Data Error:", error);
    return NextResponse.json({ error: "Failed to fetch studio data" }, { status: 500 });
  }
}

// 🟢 POST: บันทึก Code ใหม่ลง DB พร้อมผูก Many-to-Many ตัวละคร
export async function POST(req: Request) {
  try {
    const session = await getSession();
    const currentUserId = session?.userId ? Number(session.userId) : null;

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // 1. บันทึกลงตาราง user_codes
    const [newUserCode] = await db.insert(userCodes).values({
      userId: currentUserId,
      templateId: Number(body.templateId),
      customName: body.customName,
      studioValuesJson: body.studioValuesJson,
    }).returning();

    // 2. ผูกโค้ดนี้เข้ากับตัวละครที่เลือก (Many-to-Many)
    if (body.characterIds && Array.isArray(body.characterIds) && body.characterIds.length > 0) {
      const charLinks = body.characterIds.map((charId: number) => ({
        userCodeId: newUserCode.id,
        characterId: charId,
      }));
      await db.insert(userCodeCharacters).values(charLinks);
    }

    return NextResponse.json({ success: true, data: newUserCode });
  } catch (error) {
    console.error("Save UserCode Error:", error);
    return NextResponse.json({ error: "Failed to save user code" }, { status: 500 });
  }
}

// 🟢 PUT: อัปเดต Code เดิมที่เคยบันทึกไว้
export async function PUT(req: Request) {
  try {
    const session = await getSession();
    const currentUserId = session?.userId ? Number(session.userId) : null;

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const codeId = Number(body.id);

    if (!codeId) {
      return NextResponse.json({ error: "Missing Code ID" }, { status: 400 });
    }

    // 1. อัปเดตตาราง user_codes เฉพาะของ user คนนี้
    await db.update(userCodes)
      .set({
        templateId: Number(body.templateId),
        customName: body.customName,
        studioValuesJson: body.studioValuesJson,
        updatedAt: new Date(),
      })
      .where(and(eq(userCodes.id, codeId), eq(userCodes.userId, currentUserId)));

    // 2. อัปเดตตารางผูกตัวละคร (ลบของเก่าแล้วลงใหม่)
    await db.delete(userCodeCharacters).where(eq(userCodeCharacters.userCodeId, codeId));

    if (body.characterIds && Array.isArray(body.characterIds) && body.characterIds.length > 0) {
      const charLinks = body.characterIds.map((charId: number) => ({
        userCodeId: codeId,
        characterId: charId,
      }));
      await db.insert(userCodeCharacters).values(charLinks);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update UserCode Error:", error);
    return NextResponse.json({ error: "Failed to update user code" }, { status: 500 });
  }
}