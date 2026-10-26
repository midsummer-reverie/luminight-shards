// app/(game)/guilds/[id]/page.tsx
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { Suspense } from "react";
import { GuildIconSvg } from "../new/GuildForm";
import ForumThemeStyle from "@/components/ForumThemeStyle"; // 🟢 ดึง Component เทพของคุณมาใช้!

interface PageProps {
  params: Promise<{ id: string }>;
}

function sortMembers(members: any[], rolesOrder: string[] = []) {
  const rankPriority: Record<string, number> = { S: 1, A: 2, B: 3, C: 4, D: 5, E: 6, F: 7 };

  const roleWeight: Record<string, number> = {};
  rolesOrder.forEach((role, index) => {
    roleWeight[role] = index + 1;
  });

  return members.sort((a, b) => {
    const titleA = a.guildTitle || "สมาชิก";
    const titleB = b.guildTitle || "สมาชิก";

    const wA = roleWeight[titleA] !== undefined ? roleWeight[titleA] : 999;
    const wB = roleWeight[titleB] !== undefined ? roleWeight[titleB] : 999;

    if (wA !== wB) return wA - wB;

    const rA = rankPriority[a.rank?.toUpperCase()] || 99;
    const rB = rankPriority[b.rank?.toUpperCase()] || 99;
    if (rA !== rB) return rA - rB;

    const nameA = `${a.lastName || ""} ${a.firstName || ""}`;
    const nameB = `${b.lastName || ""} ${b.firstName || ""}`;
    return nameA.localeCompare(nameB, "ja");
  });
}

async function GuildDetailContent({ params }: PageProps) {
  const { id } = await params;
  const guildId = Number(id);
  if (isNaN(guildId)) return notFound();

  const session = await getSession();

  const [guild] = await db.select().from(schema.guilds).where(eq(schema.guilds.id, guildId));
  if (!guild) return notFound();

  const themeColor = guild.color || "#ff5fa8";
  const rolesOrder = (guild.guildRolesOrder as string[]) || [];
  const isAdmin = session?.role === "admin";
  const isOwner = guild.createdByUserId && session?.userId ? guild.createdByUserId === Number(session.userId) : false;
  const canEdit = isAdmin || isOwner;

  const rawMembers = await db
    .select({
      id: schema.characters.id,
      firstName: schema.characters.firstName,
      lastName: schema.characters.lastName,
      nameJp: schema.characters.nameJp,
      rank: schema.characters.rank,
      className: schema.characters.className,
      type: schema.characters.type,
      imageMainUrl: schema.characters.imageMainUrl,
      guildTitle: schema.characters.guildTitle,
    })
    .from(schema.characters)
    .where(eq(schema.characters.guildId, guildId));

  const members = sortMembers(rawMembers, rolesOrder);

  const classGroups: Record<string, typeof members> = {};
  members.forEach(m => {
    const cls = m.className || m.type || "general";
    if (!classGroups[cls]) classGroups[cls] = [];
    classGroups[cls].push(m);
  });

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* 🟢 ประกาศใช้ตัวคุมธีมของคุณ */}
      <ForumThemeStyle themeColor={themeColor} />

      {/* 🟢 เติมแท็ก style นี้ลงไปเพื่อกวาดล้างสีชมพูที่ซ่อนอยู่ในมุมตัดและขอบทั้งหมด! */}
      {/* 🟢 เคลียร์สีขอบ มุมตัด และแสงเรืองตอน Hover ให้วิ่งตามสีธีม 100% */}
      <style>{`
        .box, .card {
          border-color: var(--cy) !important;
        }
        .box::after {
          background: linear-gradient(to bottom left, transparent calc(50% - 0.5px), var(--cy) calc(50% - 0.5px), var(--cy) calc(50% + 1.5px), transparent calc(50% + 1.5px)) !important;
        }
        /* ลบแสงเรืองสีชมพูตอนเอาเมาส์ชี้การ์ดและปุ่ม */
        .card:hover {
          border-color: var(--cy) !important;
          box-shadow: 0 0 18px color-mix(in srgb, var(--cy) 30%, transparent) !important;
        }
        button:hover {
          box-shadow: 0 0 18px color-mix(in srgb, var(--cy) 50%, transparent) !important;
        }
      `}</style>

      <div>
        <Link href="/guilds" style={{ fontSize: "12px", color: "var(--cy)", textDecoration: "none" }}>
          ← กลับสู่หน้ารวมกิลด์
        </Link>
      </div>

      <div className="box" style={{ position: "relative", padding: "28px" }}>
        {canEdit && (
          <Link href={`/guilds/${guild.id}/edit`} style={{ position: "absolute", top: "20px", right: "20px" }}>
            <button className="mini" style={{ padding: "6px 14px", borderRadius: "2px" }}>✎ ตั้งค่ากิลด์</button>
          </Link>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
          <div style={{ font: "700 64px 'Noto Sans JP'", color: "var(--cy)", textShadow: `0 0 20px var(--cy)` }}>
            {guild.logoUrl ? (
                <img 
                    src={guild.logoUrl} 
                    alt={guild.name} 
                    style={{ 
                      width: "80px", 
                      height: "80px", 
                      objectFit: "cover", 
                      borderRadius: "12px", 
                      border: "none" // 🟢 เอาเส้นขอบรอบรูปโลโก้ออก
                    }} 
                />
            ) : (
                <GuildIconSvg iconKey={guild.icon} color={themeColor} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <div className="tag">// GUILD PROFILE</div>
            <h1 style={{ fontSize: "36px", margin: "4px 0 0", color: "#fff" }}>{guild.name}</h1>
            {guild.nameEn && <div style={{ fontSize: "12px", color: "var(--cy)", letterSpacing: "2px", fontWeight: "bold", marginTop: "4px" }}>{guild.nameEn}</div>}
          </div>
        </div>

        {guild.motto && (
          <div className="mut" style={{ fontSize: "15px", fontStyle: "italic", margin: "16px 0 10px" }}>
            “{guild.motto}”
          </div>
        )}

        {guild.description && (
          <div style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--tx)", borderTop: `1px dashed var(--cy)`, paddingTop: "14px", marginTop: "14px" }}>
            {guild.description}
          </div>
        )}
      </div>

      {Object.keys(classGroups).length > 0 ? (
        Object.entries(classGroups).map(([cls, groupMembers]) => (
          <div key={cls} className="box">
            <div className="tag">// MEMBER LIST</div>
            <h3 style={{ margin: "4px 0 16px", color: "#fff" }}>✧ CLASS — {cls.toUpperCase()}</h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "16px" }}>
              {groupMembers.map((m) => (
                <Link key={m.id} href={`/characters/${m.id}`} style={{ textDecoration: "none" }}>
                  <div className="card" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "12px", transition: "0.2s" }}>
                    
                    <div style={{ width: "100%", height: "220px", overflow: "hidden", background: "#000", border: `1px solid var(--cy)`, marginBottom: "12px" }}>
                      <img src={m.imageMainUrl || "https://placehold.co/300x400?text=No+Image"} alt={m.firstName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="tag" style={{ fontSize: "10px", padding: "1px 6px" }}>
                          {m.guildTitle || "สมาชิก"}
                        </span>
                        <span className="mut" style={{ fontSize: "11px" }}>Rank {m.rank}</span>
                      </div>

                      <div style={{ fontWeight: "bold", color: "#fff", fontSize: "15px", marginTop: "2px", textShadow: `0 0 6px var(--cy)` }}>
                        {m.lastName || ""} {m.firstName || ""}
                      </div>

                      {m.nameJp && (
                        <div style={{ fontSize: "12px", color: "var(--cy)", fontFamily: "'Noto Sans JP'" }}>
                          {m.nameJp}
                        </div>
                      )}
                    </div>

                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="box" style={{ textAlign: "center", padding: "40px" }}>
          <div className="mut">— ยังไม่มีสมาชิกในกิลด์นี้ —</div>
        </div>
      )}
    </div>
  );
}

export default function GuildDetailPage({ params }: PageProps) {
  return (
    <main style={{ padding: "30px 20px 96px" }}>
      <Suspense fallback={<div className="mut" style={{ textAlign: "center", padding: "40px" }}>กำลังโหลดข้อมูลกิลด์...</div>}>
        <GuildDetailContent params={params} />
      </Suspense>
    </main>
  );
}