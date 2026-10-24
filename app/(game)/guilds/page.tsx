// app/(game)/guilds/page.tsx
import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/session";
import { GuildIconSvg } from "./new/GuildForm";
import { Suspense } from "react";

async function GuildsContent() {
  const session = await getSession();
  
  const guildsData = await db
    .select({
      id: schema.guilds.id,
      name: schema.guilds.name,
      nameEn: schema.guilds.nameEn,
      motto: schema.guilds.motto,
      description: schema.guilds.description,
      color: schema.guilds.color,
      logoUrl: schema.guilds.logoUrl,
      icon: schema.guilds.icon,
      memberCount: count(schema.characters.id),
    })
    .from(schema.guilds)
    .leftJoin(schema.characters, eq(schema.characters.guildId, schema.guilds.id))
    .groupBy(schema.guilds.id)
    .orderBy(asc(schema.guilds.id));

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <div className="tag">// FACTIONS</div>
          <h2 style={{ margin: 0 }}>กิลด์ / ฝ่าย</h2>
        </div>
        {session && (
          <Link href="/guilds/new">
            <button className="mini" style={{ padding: "6px 14px", borderRadius: "2px" }}>+ เพิ่มกิลด์</button>
          </Link>
        )}
      </div>

      <div className="grid">
        {guildsData.map((g) => {
          const tColor = g.color || "#ff5fa8";
          return (
            <Link 
              key={g.id} 
              href={`/guilds/${g.id}`}
              style={{ textDecoration: "none" }}
            >
              <div 
                className="card" 
                style={{ 
                  border: `1px solid ${tColor}44`,
                  background: `linear-gradient(135deg, ${tColor}18 0%, #0a060c 50%)`,
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "space-between",
                  height: "100%",
                  ["--cy" as string]: tColor,
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ font: "700 44px 'Noto Sans JP'", color: tColor, textShadow: `0 0 14px ${tColor}` }}>
                      {g.logoUrl ? (
                        <img src={g.logoUrl} alt={g.name} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "10px" }} />
                      ) : (
                        <GuildIconSvg iconKey={g.icon} color={tColor} />
                      )}
                    </div>
                  </div>
                  <h3 style={{ margin: "10px 0 4px", color: "#fff" }}>{g.name}</h3>
                  {g.nameEn && <div className="tag" style={{ color: tColor, marginBottom: "8px" }}>{g.nameEn}</div>}
                  <div className="mut" style={{ marginBottom: "12px", fontStyle: "italic" }}>{g.motto}</div>
                </div>
                
                <div className="tag" style={{ marginTop: "6px", borderTop: "1px dashed var(--line)", paddingTop: "10px", color: tColor }}>
                  {g.memberCount} สมาชิก
                </div>
              </div>
            </Link>
          );
        })}
        
        {guildsData.length === 0 && (
          <div className="mut" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
            — ยังไม่มีข้อมูลกิลด์ —
          </div>
        )}
      </div>
    </>
  );
}

export default function GuildsPage() {
  return (
    <main style={{ padding: "20px 0" }}>
      <Suspense fallback={<div className="mut">กำลังโหลดข้อมูลกิลด์...</div>}>
        <GuildsContent />
      </Suspense>
    </main>
  );
}