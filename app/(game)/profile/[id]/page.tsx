// app/(game)/profile/[id]/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/session";
import { CHAR_TYPES, STATUS } from "@/lib/constants";
import Avatar from "@/components/character/Avatar";

async function UserProfileContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const profileId = Number(resolvedParams.id);
  
  if (isNaN(profileId)) {
    redirect("/");
  }

  const session = await getSession();
  const isOwner = session?.userId === profileId;

  const rows = await db
    .select({ c: schema.characters, guild: schema.guilds.name })
    .from(schema.characters)
    .leftJoin(schema.guilds, eq(schema.guilds.id, schema.characters.guildId))
    .where(eq(schema.characters.userId, profileId))
    .orderBy(asc(schema.characters.id));

  return (
    <>
      <div className="tag">// USER PROFILE · #{profileId}</div>
      
      {/* 🟢 ส่วนหัวข้อและย้ายปุ่มสร้างตัวละครมาไว้ตรงนี้ปุ่มเดียว */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0 20px 0" }}>
        <h2 style={{ margin: 0 }}>Character List</h2>
        {isOwner && (
          <Link href="/characters/new">
            <button className="mini" type="button">+ สร้างตัวละครใหม่</button>
          </Link>
        )}
      </div>

      {/* 🟢 เพิ่ม "citizen" เข้าไปในหมวดหมู่การวนลูป */}
      {(["esper", "guide", "citizen"] as const).map((type) => {
        const list = rows.filter((r) => r.c.type === type);
        const typeLabel = CHAR_TYPES[type] || type.toUpperCase();

        return (
          <section key={type} style={{ marginBottom: "32px" }}>
            <div className="tag" style={{ marginTop: 14 }}>
              <span>// {typeLabel} · {type.toUpperCase()} ({list.length})</span>
            </div>

            <div className="grid" style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {list.map(({ c, guild }) => {
                const st = STATUS[c.status] || { color: "#888", label: c.status };
                
                return (
                  <Link 
                    key={c.id} 
                    href={`/characters/${c.id}`} 
                    className="card" 
                    style={{ 
                      position: "relative",
                      overflow: "hidden",
                      border: `1px solid ${c.colorPrimary}55`,
                      background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.2) 100%)",
                      padding: "16px",
                      borderRadius: "8px",
                      transition: "all 0.2s ease",
                      textDecoration: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px"
                    }}
                  >
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: c.colorPrimary }} />

                    <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                      <div style={{ position: "relative" }}>
                        <Avatar url={c.faceUrl ?? c.imageMainUrl} color={c.colorPrimary} />
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <b style={{ font: "700 16px var(--font-jp)", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {c.nameJp}
                          </b>
                          <span style={{ fontSize: "12px", fontWeight: "bold", color: c.colorPrimary, padding: "1px 6px", background: `${c.colorPrimary}15`, borderRadius: "4px" }}>
                            RANK {c.rank}
                          </span>
                        </div>

                        <div className="mut" style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>
                            {c.firstName} {c.lastName ?? ""} {c.className ? `· ${c.className}` : ""}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px", fontSize: "12px" }}>
                      <span className="mut" style={{ color: "rgba(255,255,255,0.5)" }}>
                        🏛️ {guild ?? "ไม่มีสังกัดกิลด์"}
                      </span>
                      <span className="sb" style={{ "--sc": st.color } as React.CSSProperties}>
                        {st.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
              {list.length === 0 && (
                <div className="mut" style={{ gridColumn: "1 / -1", padding: "20px", textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: "6px" }}>
                  — ยังไม่มีตัวละครในหมวดหมู่นี้ —
                </div>
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main style={{ paddingBottom: "40px" }}>
      <Suspense fallback={<div className="mut">กำลังโหลดข้อมูลโปรไฟล์...</div>}>
        <UserProfileContent params={params} />
      </Suspense>
    </main>
  );
}