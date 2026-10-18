"use server";

import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/session";
import { RANKS } from "@/lib/constants";

const { characters } = schema;

async function requireUid() {
  const s = await getSession();
  if (!s) redirect("/login");
  return s.uid;
}

const str = (fd: FormData, k: string, max = 200) => String(fd.get(k) ?? "").trim().slice(0, max);
const num = (fd: FormData, k: string, min: number, max: number, def: number) => {
  const n = Number(fd.get(k));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : def;
};
const color = (fd: FormData, k: string, def: string) => (/^#[0-9a-f]{6}$/i.test(str(fd, k, 9)) ? str(fd, k, 9) : def);
const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 20);
const url = (fd: FormData, k: string) => {
  try {
    const u = new URL(str(fd, k, 500));
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
};

export async function createCharacter(type: "esper" | "guide", _fd: FormData) {
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

  await db.update(characters).set({
    type: str(fd, "type") === "guide" ? "guide" : "esper",
    guildId: Number(fd.get("guildId")) || null,
    rank, nameJp, firstName,
    lastName: str(fd, "lastName", 60) || null,
    className: str(fd, "className", 60) || null,
    homeText: str(fd, "homeText", 80) || null,
    note: str(fd, "note", 120) || null,
    age: num(fd, "age", 20, 200, 20),
    birthday: str(fd, "birthday", 20) || null,
    heightWeight: str(fd, "heightWeight", 30) || null,
    bloodType: str(fd, "bloodType", 10) || null,
    mbti: str(fd, "mbti", 8).toUpperCase() || null,
    quote: str(fd, "quote", 200) || null,
    traits: str(fd, "traits", 300).split(",").map((x) => x.trim()).filter(Boolean).slice(0, 12),
    ties: lines(String(fd.get("ties") ?? "").slice(0, 2000)),
    stats: [0, 1, 2, 3, 4, 5].map((i) => num(fd, `s${i}`, 0, 100, 50)),
    abilityName: str(fd, "abilityName", 80) || null,
    abilityDesc: str(fd, "abilityDesc", 600) || null,
    doomLevel: num(fd, "doomLevel", 0, 100, 0),
    story: String(fd.get("story") ?? "").trim().slice(0, 5000) || null,
    colorPrimary: color(fd, "colorPrimary", "#ff5fa8"),
    colorSecondary: color(fd, "colorSecondary", "#ffd6ea"),
    colorBg: color(fd, "colorBg", "#130c15"),
    sparkPercent: num(fd, "sparkPercent", 0, 100, 50),
    imageMainUrl: url(fd, "imageMainUrl"),
    imageSubUrl: url(fd, "imageSubUrl"),
    faceUrl: url(fd, "faceUrl"),
    updatedAt: new Date(),
  }).where(and(eq(characters.id, id), eq(characters.userId, userId)));

  redirect(`/characters/${id}`);
}