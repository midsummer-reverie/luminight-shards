import { Suspense } from "react";
import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/session";
import TacticalMapContainer from "@/components/map/TacticalMapContainer";
import CharacterStatusBox from "@/components/CharacterStatusWidget";
import { GuildIconSvg } from "@/app/(game)/guilds/new/GuildForm";
import CreateBulletinModal from "@/components/CreateBulletinModal"; // 🟢 Import Modal เพิ่มเข้ามา

const { characters, threads, locations, users, guilds, bulletins } = schema;

async function LiveFeedSection() {
  let recentFeeds: any[] = [];
  try {
    recentFeeds = await db
      .select({
        id: threads.id,
        title: threads.title,
        locationName: locations.name,
        locationSlug: locations.slug,
        authorName: users.username,
      })
      .from(threads)
      .leftJoin(locations, eq(threads.locationId, locations.id))
      .leftJoin(users, eq(threads.authorUserId, users.id))
      .orderBy(desc(threads.createdAt))
      .limit(5);
  } catch (error) {
    console.error("Failed to fetch live feeds", error);
  }

  const fallbackFeeds = [
    { id: 1, locationSlug: "l1", title: "คืนนี้เสียงเตือนดังอีกแล้ว", authorName: "haru", locationName: "ย่านชินเซ" },
    { id: 2, locationSlug: "l5", title: "เศษผลึกที่ตอบสนองต่อเอสเปอร์", authorName: "ren", locationName: "แอเรีย" },
  ];

  const feeds = recentFeeds.length > 0 ? recentFeeds : fallbackFeeds;

  return (
    <div className="box" style={{ margin: 0, flex: 1, display: "flex", flexDirection: "column", minHeight: "360px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)", paddingBottom: "10px", marginBottom: "12px" }}>
        <div className="tag" style={{ margin: 0 }}>LIVE FEED</div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", color: "var(--cy)", fontWeight: "bold", letterSpacing: "1px" }}>
          <span style={{ width: "6px", height: "6px", background: "var(--cy)", borderRadius: "50%", animation: "blink 1.5s infinite" }} />
          REAL-TIME
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto" }}>
        {feeds.map((feed, i) => (
          <Link href={`/forums/${feed.locationSlug}/${feed.id}`} className="card" key={i} style={{ display: "block", borderLeft: "2px solid var(--cy)", padding: "12px" }}>
            <b style={{ color: "#fff", display: "block", marginBottom: "4px", fontSize: "13px" }}>{feed.title}</b>
            <div className="mut" style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
              <span>โดย {feed.authorName || "นิรนาม"}</span>
              <span style={{ color: "var(--cy)", opacity: 0.8 }}>@ {feed.locationName}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// 🟢 อัปเดตส่วน City Bulletin ให้ดึงข้อมูลจริงจาก DB และมีปุ่มเปิด Modal ของ Admin
async function CityBulletinSection() {
  const session = await getSession();
  const isAdmin = session?.role === "admin";

  let dbBulletins: any[] = [];
  try {
    dbBulletins = await db
      .select()
      .from(bulletins)
      .orderBy(desc(bulletins.createdAt))
      .limit(5);
  } catch (error) {
    console.error("Failed to fetch bulletins", error);
  }

  return (
    <div className="box" style={{ margin: 0, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "360px" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div className="tag" style={{ margin: 0 }}>CITY BULLETIN</div>
          {/* แสดงปุ่มเพิ่มประกาศเฉพาะ Admin */}
          {isAdmin && <CreateBulletinModal />}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {dbBulletins.length > 0 ? (
            dbBulletins.map((b) => (
              <Link 
                href={b.linkUrl || "#"}
                key={b.id} 
                className="bulletin-card"
                style={{ 
                  display: "block",
                  padding: "10px", 
                  textDecoration: "none",
                  border: `1px solid ${b.color}33`,
                  borderLeft: `3px solid ${b.color}`,
                  borderRadius: "4px",
                  ["--b-color" as string]: b.color
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span 
                    style={{ 
                      fontSize: "10px", 
                      fontWeight: "bold", 
                      color: b.color, 
                      background: `${b.color}22`, 
                      padding: "2px 6px", 
                      borderRadius: "2px",
                      letterSpacing: "1px"
                    }}
                  >
                    {b.tag.toUpperCase()}
                  </span>
                  <span className="mut" style={{ fontSize: "10px" }}>
                    {new Date(b.createdAt).toLocaleDateString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginBottom: "6px", lineHeight: 1.4 }}>{b.title}</div>
                {b.hook && (
                  <div className="hk" style={{ fontSize: "11px", opacity: 0.7, fontStyle: "italic", borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "6px" }}>
                    {b.hook}
                  </div>
                )}
              </Link>
            ))
          ) : (
            <div className="mut" style={{ padding: "20px 0", textAlign: "center" }}>
              — ยังไม่มีประกาศใหม่ในเมือง —
            </div>
          )}
        </div>
      </div>

      <div className="mut" style={{ fontSize: "11px", textAlign: "right", marginTop: "16px", opacity: 0.7 }}>
        ◆ ระบบกระจายข่าวสารอัตโนมัติ
      </div>
    </div>
  );
}

async function FactionsSection() {
  let dbGuilds: any[] = [];
  try {
    dbGuilds = await db.select().from(guilds);
  } catch (error) {
    console.error("Failed to fetch guilds", error);
  }

  if (dbGuilds.length === 0) {
    return (
      <div className="mut" style={{ padding: "16px 0", fontSize: "12px" }}>
        — ยังไม่มีข้อมูลฝ่าย/กิลด์ในระบบ —
      </div>
    );
  }

  return (
    <div className="grid" style={{ marginTop: "8px" }}>
      {dbGuilds.map((g) => {
        const color = g.color || "#ff5fa8";
        return (
          <Link 
            href={`/guilds/${g.id}`} 
            key={g.id} 
            className="card" 
            style={{ 
              border: `1px solid ${color}`,
              borderBottom: `3px solid ${color}`,
              background: "linear-gradient(135deg, rgba(19, 12, 21, 0.9) 0%, rgba(10, 6, 12, 0.95) 100%)",
              boxShadow: `0 0 12px ${color}22`,
              display: "block", 
              transition: "0.2s"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", color }}>
                {g.logoUrl ? (
                  <img 
                    src={g.logoUrl} 
                    alt={g.name} 
                    style={{ 
                      width: "36px", 
                      height: "36px", 
                      objectFit: "cover", 
                      borderRadius: "6px", 
                      border: "none"
                    }} 
                  />
                ) : (
                  <GuildIconSvg iconKey={g.icon} color={color} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {g.name}
                </div>
                {g.nameEn && (
                  <div style={{ fontSize: "10px", color, letterSpacing: "1px", fontWeight: "bold" }}>
                    {g.nameEn}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mut" style={{ fontSize: "12px", fontStyle: g.motto ? "italic" : "normal", lineHeight: "1.4" }}>
              {g.motto ? `“${g.motto}”` : g.description ? `${g.description.slice(0, 60)}...` : "ฝ่ายในสังกัดเมืองชินเซ"}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

async function CharacterStatusSection() {
  const session = await getSession();
  const userId = session?.userId;

  const userCharacters = userId 
    ? await db.select().from(characters).where(eq(characters.userId, userId))
    : [];

  return <CharacterStatusBox initialCharacters={userCharacters} />;
}

export default function HomePage() {
  return (
    <main id="app">
      <style>{`
        @keyframes spin-slow { 100% { transform: rotate(360deg); } }
        @keyframes spin-reverse { 100% { transform: rotate(-360deg); } }
        @keyframes pulse-glow { 
          0%, 100% { transform: scale(1); opacity: 0.8; box-shadow: 0 0 10px var(--cy); } 
          50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 25px var(--cy); } 
        }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        
        .bulletin-card {
          background: rgba(255,255,255,0.02);
          transition: background 0.2s ease;
        }
        .bulletin-card:hover {
          background: color-mix(in srgb, var(--b-color) 15%, transparent);
        }
      `}</style>

      <div className="box hero" style={{ padding: "16px" }}>
        <div className="tag tw" data-t="// 新星市 · TACTICAL MAP">
          // 新星市 · TACTICAL MAP
        </div>
          <h2>แผนที่เมือง</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", alignItems: "stretch" }}>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <TacticalMapContainer />
          
          <Suspense fallback={<div className="box"><div className="mut">กำลังซิงค์สัญญาณเครือข่าย...</div></div>}>
            <LiveFeedSection />
          </Suspense>
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "20px" }}>
          
          <div className="box" style={{ margin: 0, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(255,95,168,0.04) 1px, transparent 1px), linear-gradient(rgba(255,95,168,0.04) 1px, transparent 1px)", backgroundSize: "15px 15px", zIndex: 0 }} />
            
            <div className="tag" style={{ position: "relative", zIndex: 1 }}>WORLD BALANCE</div>
            
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative", height: "120px", margin: "10px 0", zIndex: 1 }}>
              <div style={{ position: "absolute", width: "100px", height: "100px", borderRadius: "50%", border: "1px dashed var(--cy)", animation: "spin-slow 15s linear infinite", opacity: 0.4 }} />
              <div style={{ position: "absolute", width: "70px", height: "70px", borderRadius: "50%", border: "2px solid rgba(255, 95, 168, 0.2)", animation: "spin-reverse 8s linear infinite" }} />
              <div style={{ position: "absolute", width: "24px", height: "24px", background: "var(--cy)", borderRadius: "50%", animation: "pulse-glow 2.5s ease-in-out infinite" }} />
              
              <div id="bl2" style={{ font: "700 36px var(--font-hud)", color: "#fff", zIndex: 2, textShadow: "0 0 15px var(--cy)", background: "rgba(10, 6, 12, 0.7)", padding: "0 12px", borderRadius: "8px" }}>
                62 : 38
              </div>
            </div>

            <div className="bal" style={{ position: "relative", zIndex: 1 }}><i /></div>
            <div className="mut" style={{ position: "relative", zIndex: 1, textAlign: "center", marginTop: "8px" }}>ลูมิแยร์ ⇆ น็อกซ์ทีส<br/>สมดุลเอียงไปทางฝั่งสีขาว แต่รอยร้าวยังขยาย</div>
          </div>

          <Suspense fallback={<div className="box"><div className="mut">กำลังโหลดข่าวสารเมือง...</div></div>}>
            <CityBulletinSection />
          </Suspense>

          <Suspense fallback={<div className="box"><div className="mut">กำลังโหลดสถานะตัวละคร...</div></div>}>
            <CharacterStatusSection />
          </Suspense>

        </div>
      </div>

      <div className="tag" style={{ marginTop: "24px" }}>// FACTIONS</div>
      <Suspense fallback={<div className="mut" style={{ padding: "16px 0" }}>กำลังโหลดข้อมูลฝ่าย...</div>}>
        <FactionsSection />
      </Suspense>
    </main>
  );
}