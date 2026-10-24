// app/(game)/forums/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/session";

async function ForumList() {
  const { locations, threads, characters } = schema;

  const allChars = await db
    .select({
      id: characters.id,
      faceUrl: characters.faceUrl,
      firstName: characters.firstName,
      nameJp: characters.nameJp,
    })
    .from(characters);

  const charMap = new Map(allChars.map((c) => [c.id, c.faceUrl]));

  const rows = await db
    .select({
      id: locations.id,
      slug: locations.slug,
      name: locations.name,
      nameJp: locations.nameJp,
      nameEn: locations.nameEn,
      description: locations.description,
      themeColor: locations.themeColor,
      danger: locations.danger,
      residentChars: locations.residentChars,
      threadCount: count(threads.id),
    })
    .from(locations)
    .leftJoin(threads, eq(threads.locationId, locations.id))
    .where(eq(locations.isMainMapZone, true))
    .groupBy(locations.id)
    .orderBy(asc(locations.slug));

  return (
    <div className="fgrid">
      {rows.map((l) => {
        let residentIds: number[] = [];
        if (Array.isArray(l.residentChars)) {
          residentIds = l.residentChars;
        } else if (typeof l.residentChars === "string") {
          const names = l.residentChars.split(/[, &\n\t]+/).map(s => s.trim()).filter(Boolean);
          residentIds = allChars
            .filter(c => names.includes(c.firstName) || (c.nameJp && names.includes(c.nameJp)))
            .map(c => c.id);
        }

        const charsList = residentIds.map((id) => charMap.get(id)).filter(Boolean) as string[];
        const tColor = l.themeColor || "#38c8ff";

        return (
          <Link 
            key={l.id} 
            href={`/forums/${l.slug}`} 
            className="fcard" 
            style={{ 
              textDecoration: "none", 
              position: "relative", 
              overflow: "hidden",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "stretch",
              border: `1px solid ${tColor}44`,
              background: `linear-gradient(135deg, ${tColor}18 0%, #0a060c 50%)`,
              ["--cy" as string]: tColor,
            }}
          >
            <div style={{ position: "absolute", right: "-10px", top: "-10px", opacity: 0.15, pointerEvents: "none" }}>
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke={tColor} strokeWidth="1.5">
                <circle cx="50" cy="50" r="40" strokeDasharray="4 4" />
                <circle cx="50" cy="50" r="25" />
                <path d="M50 10V90M10 50H90" strokeDasharray="2 2" />
              </svg>
            </div>

            {/* 🟢 เพิ่ม display: flex และ flexDirection: column เพื่อให้จัดระเบียบแนวตั้งได้ */}
            <div style={{ flex: 1, paddingRight: "12px", zIndex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
              {l.nameJp && <div className="fjp">{l.nameJp}</div>}
              <h3 style={{ margin: "4px 0" }}>{l.name}</h3>
              {l.nameEn && (
                <div style={{ fontSize: "11px", color: tColor, letterSpacing: "1px", marginBottom: "8px", fontWeight: "bold" }}>
                  {l.nameEn}
                </div>
              )}
              <div style={{ fontSize: "13px", opacity: 0.8, marginTop: "30px", marginBottom: "12px", lineHeight: "1.4" }}>
                {l.description}
              </div>
              {/* 🟢 ใช้ marginTop: auto เพื่อดันแท็กนี้ลงไปติดขอบล่างสุดเสมอ และแสดงค่าเสี่ยงแม้เป็น 0 */}
              <div className="tag" style={{ color: tColor, borderLeftColor: tColor, marginTop: "auto" }}>
                {l.threadCount} กระทู้ · ⚠️ เสี่ยง {l.danger || 0}%
              </div>
            </div>

            {charsList.length > 0 && (
              <div 
                style={{ 
                  display: "flex", 
                  flexDirection: "row-reverse", 
                  justifyContent: "flex-start",
                  alignItems: "center", 
                  flexWrap: "wrap",
                  gap: "6px",
                  width: "45px",
                  flexShrink: 0,
                  overflow: "hidden",
                  paddingLeft: "6px",
                  zIndex: 1,
                  alignSelf: "center"
                }}
              >
                {charsList.map((charImg, idx) => (
                  <div 
                    key={idx}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: `1px solid ${tColor}`,
                      background: "#000",
                      flexShrink: 0,
                      boxShadow: `0 0 8px ${tColor}66`
                    }}
                  >
                    <img 
                      src={charImg} 
                      alt="Resident" 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                  </div>
                ))}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}

async function AdminAction() {
  const session = await getSession();
  const isAdmin = session?.role === "admin";

  if (!isAdmin) return null;

  return (
    <Link href="/forums/new" style={{ textDecoration: "none" }}>
      <button
        style={{
          padding: "6px 14px",
          fontSize: "12px",
          background: "rgba(255, 95, 168, 0.15)",
          border: "1px solid #ff5fa8",
          color: "#ff5fa8",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 0 10px rgba(255, 95, 168, 0.3)",
          borderRadius: "2px"
        }}
      >
        + สร้างเขตหลัก (Admin)
      </button>
    </Link>
  );
}

export default function ForumsPage() {
  return (
    <main>
      <div className="tag">// DISTRICT INDEX // แผนที่เขตเมืองชินเซ</div>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <h2 style={{ margin: 0 }}>หน้ารวมฟอรั่มหลัก</h2>
        
        <Suspense fallback={null}>
          <AdminAction />
        </Suspense>
      </div>

      <p className="mut" style={{ marginBottom: "24px", fontSize: "13px" }}>
        เลือกย่านหลักบนแผนที่เพื่อเข้าสู่พื้นที่ปฏิบัติการ หรือสำรวจเขตที่อยู่อาศัยส่วนตัวภายในแต่ละย่าน
      </p>

      <Suspense fallback={<div className="mut">กำลังโหลดข้อมูลแผนที่...</div>}>
        <ForumList />
      </Suspense>
    </main>
  );
}