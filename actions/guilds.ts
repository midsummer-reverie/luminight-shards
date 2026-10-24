// actions/guilds.ts
"use server";

import { db, schema } from "@/db";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export async function saveGuildAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/guilds");

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const name = formData.get("name") as string;
  const nameEn = formData.get("nameEn") as string;
  const motto = formData.get("motto") as string;
  const description = formData.get("description") as string;
  const color = formData.get("color") as string || "#ff5fa8";
  const logoUrl = formData.get("logoUrl") as string;
  const icon = formData.get("icon") as string || "star";
  
  // 🟢 รับค่ารายชื่อตัวละครที่ถูกเลือกเข้ามา (ส่งมาเป็น comma-separated หรือหลายค่า)
  const memberIdsRaw = formData.getAll("memberIds") as string[];
  const memberIds = memberIdsRaw.map(Number).filter(Boolean);

  let targetGuildId = id;

  if (id) {
    const [guild] = await db.select().from(schema.guilds).where(eq(schema.guilds.id, id));
    if (!guild) return;

    if (session.role !== "admin" && guild.createdByUserId !== Number(session.userId)) {
      return;
    }

    await db.update(schema.guilds).set({
      name, nameEn, motto, description, color, logoUrl, icon
    }).where(eq(schema.guilds.id, id));

  } else {
    // 🟢 สร้างกิลด์ใหม่และดึง ID ที่เพิ่งสร้างกลับมา
    const [newGuild] = await db.insert(schema.guilds).values({
      name, nameEn, motto, description, color, logoUrl, icon,
      createdByUserId: Number(session.userId),
    }).returning({ id: schema.guilds.id });

    targetGuildId = newGuild.id;
  }

  // 🟢 อัปเดตผูกสมาชิกเข้ากิลด์นี้ (เฉพาะตอนสร้างใหม่หรือที่มีการเลือกเพิ่ม)
  if (targetGuildId && memberIds.length > 0) {
    await db.update(schema.characters)
      .set({ guildId: targetGuildId })
      .where(inArray(schema.characters.id, memberIds));
  }

  revalidatePath("/guilds");
  redirect(`/guilds/${targetGuildId}`); // สร้างเสร็จพาไปหน้าดูรายละเอียดกิลด์นั้นๆ เลย
}

export async function updateGuildMemberAction(characterId: number, guildId: number | null) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  await db.update(schema.characters)
    .set({ guildId })
    .where(eq(schema.characters.id, characterId));

  revalidatePath(`/guilds`);
  return { success: true };
}

export async function updateCharacterGuildTitleAction(characterId: number, guildTitle: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  await db.update(schema.characters)
    .set({ guildTitle })
    .where(eq(schema.characters.id, characterId));

  revalidatePath("/guilds");
  return { success: true };
}

export async function updateGuildRolesOrderAction(guildId: number, rolesOrder: string[]) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  await db.update(schema.guilds)
    .set({ guildRolesOrder: rolesOrder })
    .where(eq(schema.guilds.id, guildId));

  revalidatePath(`/guilds/${guildId}`);
  revalidatePath(`/guilds/${guildId}/edit`);
  return { success: true };
}