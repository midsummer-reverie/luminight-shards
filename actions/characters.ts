//actions/characters.ts
"use server";

import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/session";
import { RANKS } from "@/lib/constants";
import { revalidatePath } from "next/cache";

const { characters } = schema;

async function requireUid() {
  const s = await getSession();
  if (!s) redirect("/login");
  return s.userId;
}

const getVal = (fd: any, k: string): string => {
  if (fd && typeof fd.get === "function") return String(fd.get(k) ?? "");
  if (fd && typeof fd === "object" && k in fd) return String(fd[k] ?? "");
  return "";
};

const str = (fd: any, k: string, max = 200) => {
  return getVal(fd, k).trim().slice(0, max);
};

const num = (fd: any, k: string, min: number, max: number, def: number) => {
  const val = getVal(fd, k);
  const n = Number(val);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : def;
};

const color = (fd: any, k: string, def: string) => (/^#[0-9a-f]{6}$/i.test(str(fd, k, 9)) ? str(fd, k, 9) : def);
const url = (fd: any, k: string) => {
  try {
    const u = new URL(str(fd, k, 500));
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
};

export async function createCharacter(type: "esper" | "guide", _fd?: FormData) {
  const userId = await requireUid();
  if (type !== "esper" && type !== "guide") return;
  const [c] = await db.insert(characters).values({ userId, type, nameJp: "新規", firstName: "new" }).returning({ id: characters.id });
  redirect(`/characters/${c.id}/edit`);
}

export async function updateCharacter(id: number, fd: FormData) {
  const userId = await requireUid();
  const nameJp = str(fd, "nameJp", 60);
  const firstName = str(fd, "firstName", 60);
  if (!nameJp || !firstName) redirect(`/characters/${id}/edit`);

  const rankIn = str(fd, "rank", 1);
  const rank = (RANKS as readonly string[]).includes(rankIn) ? (rankIn as (typeof RANKS)[number]) : "C";

  // 🟢 แปลงค่า tiesJson ที่ส่งมาจาก RelationshipEditor ให้เป็น Object Array ที่ปลอดภัย
  let parsedTies: any[] = [];
  const tiesJsonStr = getVal(fd, "tiesJson");
  if (tiesJsonStr) {
    try {
      const raw = JSON.parse(tiesJsonStr);
      if (Array.isArray(raw)) {
        parsedTies = raw
          .filter(t => t && (t.targetId || t.relation || t.note))
          .map(t => ({
            targetId: t.targetId ? Number(t.targetId) : "",
            relation: String(t.relation || "").trim().slice(0, 50),
            note: String(t.note || "").trim().slice(0, 300),
          }));
      }
    } catch (e) {
      console.error("Failed to parse tiesJson:", e);
    }
  }

  const statusLocationIdVal = getVal(fd, "statusLocationId");

  await db.update(characters).set({
    type: str(fd, "type") === "guide" ? "guide" : "esper",
    guildId: Number(getVal(fd, "guildId")) || null,
    statusLocationId: statusLocationIdVal ? Number(statusLocationIdVal) : null,
    rank, nameJp, firstName,
    lastName: str(fd, "lastName", 60) || null,
    className: str(fd, "className", 60) || null,
    note: str(fd, "note", 120) || null,
    age: num(fd, "age", 20, 200, 20),
    birthday: str(fd, "birthday", 20) || null,
    heightWeight: str(fd, "heightWeight", 30) || null,
    bloodType: str(fd, "bloodType", 10) || null,
    mbti: str(fd, "mbti", 8).toUpperCase() || null,
    quote: str(fd, "quote", 200) || null,
    traits: str(fd, "traits", 300).split(",").map((x) => x.trim()).filter(Boolean).slice(0, 12),
    
    // 🟢 บันทึกข้อมูลความสัมพันธ์ในรูปแบบ JSON Object Array
    ties: parsedTies,

    stats: [0, 1, 2, 3, 4, 5].map((i) => num(fd, `s${i}`, 0, 100, 50)),
    abilityName: str(fd, "abilityName", 80) || null,
    abilityDesc: str(fd, "abilityDesc", 600) || null,
    doomLevel: num(fd, "doomLevel", 0, 100, 0),
    story: getVal(fd, "story").trim().slice(0, 5000) || null,
    colorPrimary: color(fd, "colorPrimary", "#ff5fa8"),
    imageMainUrl: url(fd, "imageMainUrl"),
    verticalBannerUrl: url(fd, "vertical_banner_url"),
    faceUrl: url(fd, "faceUrl"),
    updatedAt: new Date(),
  }).where(and(eq(characters.id, id), eq(characters.userId, userId)));

  revalidatePath("/");
  redirect(`/characters/${id}`);
}

export async function updateCharacterStatus(input: any, maybeFormData?: FormData) {
  const userId = await requireUid();
  
  const fd = maybeFormData instanceof FormData 
    ? maybeFormData 
    : input instanceof FormData 
      ? input 
      : input;

  if (!fd) {
    console.error("updateCharacterStatus received invalid form data");
    return;
  }

  const characterId = Number(getVal(fd, "characterId"));
  const locationIdVal = getVal(fd, "locationId");
  const status = str(fd, "status", 50);

  if (!characterId) return;

  const updateData: Partial<typeof characters.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (locationIdVal) {
    updateData.statusLocationId = Number(locationIdVal);
  }

  if (status) {
    updateData.status = status as any; 
  }

  try {
    await db.update(characters)
      .set(updateData)
      .where(and(eq(characters.id, characterId), eq(characters.userId, userId)));
  } catch (dbErr) {
    console.error("Database update error in updateCharacterStatus:", dbErr);
    throw dbErr;
  }

  revalidatePath("/");
}