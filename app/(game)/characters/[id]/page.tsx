import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/session";
import { STATUS, CHAR_TYPES } from "@/lib/constants";
import Radar from "@/components/character/Radar";
import FaceScan from "@/components/character/FaceScan";
import BBContent from "@/components/bbcode/BBContent";
import ThemeInjector from "@/components/ThemeInjector";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function Sheet({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cid = Number(id);
  if (!Number.isInteger(cid)) notFound();

  // 1. ดึงข้อมูลตัวละคร พร้อม Join กิลด์, ผู้ใช้ และสถานที่ปัจจุบัน (locations)
  const [row] = await db
    .select({ 
      c: schema.characters, 
      g: schema.guilds, 
      owner: schema.users.username,
      locationName: schema.locations.name
    })
    .from(schema.characters)
    .innerJoin(schema.users, eq(schema.users.id, schema.characters.userId))
    .leftJoin(schema.guilds, eq(schema.guilds.id, schema.characters.guildId))
    .leftJoin(schema.locations, eq(schema.locations.id, schema.characters.statusLocationId))
    .where(eq(schema.characters.id, cid))
    .limit(1);

  if (!row) notFound();

  // 🟢 ดึงข้อมูลตัวละครทั้งหมดมาทำ Map สำหรับความสัมพันธ์
  const allCharacters = await db
    .select({
      id: schema.characters.id,
      nameJp: schema.characters.nameJp,
      firstName: schema.characters.firstName,
      lastName: schema.characters.lastName,
      imageMainUrl: schema.characters.imageMainUrl,
      colorPrimary: schema.characters.colorPrimary,
    })
    .from(schema.characters)
    .orderBy(asc(schema.characters.id));

  const charMap = new Map(allCharacters.map(ch => [ch.id, ch]));

  const { c, g, owner, locationName } = row;

  // 2. ตรวจสอบ Session & สิทธิ์ความเป็นเจ้าของ
  const session = await getSession();
  const isOwner = session?.userId === c.userId;
  const isAdmin = session?.role === "admin";
  const canEdit = isOwner || isAdmin;

  const st = STATUS[c.status];
  const kv: [string, string | number | null][] = [
    ["BIRTH", c.birthday],
    ["AGE", c.age],
    ["HEIGHT/WEIGHT", c.heightWeight],
    ["BLOOD", c.bloodType],
    ["MBTI", c.mbti],
    ["LOCATION", locationName ?? "ยังไม่ระบุตำแหน่ง"],
    ["PLAYER", owner],
  ];

  const portrait = c.imageMainUrl
    ? `url("${c.imageMainUrl}") 50% 4%/cover`
    : `linear-gradient(135deg, ${c.colorPrimary}88, #130c15)`;

  return (
    <>
      {/* Inject CSS ทับ :root เฉพาะหน้านี้ */}
      <ThemeInjector color={c.colorPrimary} />

      <div className="box">
        {canEdit && (
          <Link href={`/characters/${c.id}/edit`} className="mini" style={{ float: "right", padding: "3px 10px" }}>
            ✎ แก้ไขตัวละคร
          </Link>
        )}
        <div className="tag">// CHARACTER FILE · ID {String(c.id).padStart(3, "0")}166</div>
        <div className="head" style={{ marginTop: "8px" }}>
          <h1 style={{ font: "700 38px var(--font-jp)", color: "#fff", textShadow: `0 0 16px ${c.colorPrimary}`, margin: 0 }}>
            {c.nameJp}
          </h1>
          <b style={{ fontSize: 22, color: "var(--cy)" }}>RANK {c.rank}</b>
          <span className="sb" style={{ ["--sc" as string]: st.color }}>
            {st.label}
          </span>
          {g && <span className="tag" style={{ color: g.color }}>{g.name}</span>}
        </div>
        <div style={{ marginTop: "6px", font: "600 16px 'Chakra Petch'", letterSpacing: "0.1em", color: "#f2e3ec" }}>
          {c.lastName ?? ""} {c.firstName} <span className="mut" style={{ fontWeight: 400, fontSize: "14px" }}>· {CHAR_TYPES[c.type]} · {c.className ?? "-"}</span>
        </div>
      </div>

      <div className="cg">
        {/* คอลัมน์ซ้าย */}
        <div>
          <div className="box" style={{ padding: 8 }}>
            <div className="av" style={{ width: "100%", height: 240, margin: 0, position: "relative", background: portrait }}>
              <span style={{ position: "absolute", right: 8, bottom: 2, font: "700 60px var(--font-jp)", color: c.colorPrimary, opacity: 0.4 }}>
                {Array.from(c.nameJp)[0]}
              </span>
            </div>
          </div>
          <div className="box">
            <div className="tag">BIOMETRIC</div>
            <FaceScan url={c.faceUrl} color={c.colorPrimary} id={c.id} />
          </div>
        </div>

        {/* คอลัมน์ขวา */}
        <div>
          <div className="box">
            <div className="tag">STATUS</div>
            <div className="two" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <Radar stats={c.stats} color={c.colorPrimary} />
              <div>
                {kv.map(([k, v]) => (
                  <div key={k} className="kv">
                    <b>{k}</b>
                    <span>{v ?? "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="box">
            <div className="tag">{c.type === "esper" ? "TALENT · ทาเล้นท์" : "ABILITY · โซลลิงก์"}</div>
            <h3 style={{ color: c.colorPrimary, marginTop: "8px" }}>{c.abilityName ?? "—"}</h3>
            <p>{c.abilityDesc}</p>
            <div className="tag" style={{ marginTop: "16px" }}>
              {c.type === "esper" ? "DOOM LEVEL" : "SYNC LOAD"} {c.doomLevel}%
            </div>
            <div className="gg">
              <i style={{ width: `${c.doomLevel}%`, background: `linear-gradient(90deg, ${c.colorPrimary}88, ${c.colorPrimary})` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="box">
          <div className="tag">QUOTE</div>
          <p style={{ fontStyle: "italic", borderLeft: `3px solid ${c.colorPrimary}`, paddingLeft: "12px", color: "#f2e3ec" }}>
            {c.quote ?? "—"}
          </p>

          <div className="tag" style={{ marginTop: "20px" }}>
            PERSONALITY
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
            {c.traits?.length
              ? c.traits.map((t) => (
                  <span
                    key={t}
                    className="chip"
                    style={{ borderColor: c.colorPrimary, color: c.colorPrimary, backgroundColor: `${c.colorPrimary}1A` }}
                  >
                    {t}
                  </span>
                ))
              : "—"}
          </div>
        </div>
        
        <div className="box">
          <div className="tag">BACKGROUND</div>
          {c.story ? <BBContent text={c.story} /> : <p>—</p>}
        </div>

        {/* 🟢 ส่วนแสดงผลความสัมพันธ์ ปรับ UI ให้สวยงามและเรียบร้อยขึ้น */}
        <div className="box">
          <div className="tag">RELATIONSHIPS</div>
          {Array.isArray(c.ties) && c.ties.length > 0 ? (
            <div style={{ display: "grid", gap: "10px", marginTop: "10px" }}>
              {c.ties.map((t: any, i: number) => {
                const tieObj = typeof t === "string" ? { targetId: "", relation: "", note: t } : t;
                const targetChar = tieObj.targetId ? charMap.get(Number(tieObj.targetId)) : null;

                const targetPortrait = targetChar?.imageMainUrl
                  ? `url("${targetChar.imageMainUrl}") center/cover`
                  : `linear-gradient(135deg, ${targetChar?.colorPrimary ?? c.colorPrimary}55, #130c15)`;

                return (
                  <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid var(--line)", padding: "12px", borderRadius: "6px" }}>
                    {targetChar ? (
                      <Link href={`/characters/${targetChar.id}`} style={{ flexShrink: 0 }}>
                        <div style={{ width: "52px", height: "52px", borderRadius: "4px", background: targetPortrait, border: `1px solid ${targetChar.colorPrimary ?? c.colorPrimary}` }} />
                      </Link>
                    ) : (
                      <div style={{ width: "52px", height: "52px", borderRadius: "4px", background: "rgba(255,255,255,0.1)", display: "grid", placeItems: "center", fontSize: "10px" }}>N/A</div>
                    )}
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                        <b style={{ fontSize: "15px", color: "#fff", lineHeight: "1.3" }}>
                          {targetChar ? (
                            <Link href={`/characters/${targetChar.id}`} style={{ color: "#fff", textDecoration: "none" }}>
                              {targetChar.lastName ?? ""} {targetChar.firstName} <span className="mut" style={{ fontSize: "13px", fontWeight: 400 }}>({targetChar.nameJp})</span>
                            </Link>
                          ) : (
                            "ตัวละครไม่ระบุ"
                          )}
                        </b>
                        {tieObj.relation && (
                          <span style={{ fontSize: "11px", padding: "2px 8px", background: `${c.colorPrimary}22`, color: c.colorPrimary, border: `1px solid ${c.colorPrimary}44`, borderRadius: "4px", fontWeight: "bold", whiteSpace: "nowrap", flexShrink: 0 }}>
                            {tieObj.relation}
                          </span>
                        )}
                      </div>
                      {tieObj.note && <div className="mut" style={{ marginTop: "6px", fontSize: "13px", color: "var(--tx)", lineHeight: "1.4" }}>{tieObj.note}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ marginTop: "8px" }}>—</p>
          )}
        </div>
      </div>
    </>
  );
}

export default async function CharacterPage({ params }: PageProps) {
  return (
    <main>
      <Suspense fallback={<div className="mut">กำลังโหลดข้อมูล...</div>}>
        <Sheet params={params} />
      </Suspense>
    </main>
  );
}