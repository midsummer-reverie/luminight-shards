// app/(game)/forums/[slug]/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/session";
import { generateLocationSvg } from "@/lib/generateLocationSvg";
import ForumThemeStyle from "@/components/ForumThemeStyle";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function ForumContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { locations, threads, characters, users } = schema;

  if (["create-sub", "new-sub", "edit", "new"].includes(slug)) {
    notFound();
  }

  const session = await getSession();

  const [forum] = await db
    .select()
    .from(locations)
    .where(eq(locations.slug, slug));

  if (!forum) {
    return notFound();
  }

  const isAdmin = session?.role === "admin";
  const isCreator = forum.createdByUserId === Number(session?.userId);
  const canEditForum = isAdmin || isCreator;

  let parentForum = null;
  if (forum.parentId) {
    const [parent] = await db
      .select()
      .from(locations)
      .where(eq(locations.id, forum.parentId));
    parentForum = parent;
  }

  const subForumsList = forum.parentId
    ? []
    : await db
        .select()
        .from(locations)
        .where(eq(locations.parentId, forum.id));

  const allCharacters = await db
    .select({
      id: characters.id,
      firstName: characters.firstName,
      nameJp: characters.nameJp,
      faceUrl: characters.faceUrl,
    })
    .from(characters);

  const threadList = await db
    .select({
      id: threads.id,
      title: threads.title,
      pinned: threads.pinned,
      locked: threads.locked,
      closed: threads.closed,
      password: threads.password,
      createdAt: threads.createdAt,
      authorName: users.username,
    })
    .from(threads)
    .leftJoin(users, eq(threads.authorUserId, users.id))
    .where(eq(threads.locationId, forum.id))
    .orderBy(desc(threads.pinned), desc(threads.createdAt));

  const themeColor = forum.themeColor || "#38c8ff";
  const bannerImg =
    forum.bannerUrl || generateLocationSvg(forum.slug, themeColor, "mixed");

  return (
    <div
      style={{
        maxWidth: "1020px",
        margin: "0 auto",
        fontFamily: "'Google Sans', sans-serif",
      }}
    >
      <ForumThemeStyle themeColor={themeColor} />

      {/* แถบบนสุด */}
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div>
          {parentForum ? (
            <Link
              href={`/forums/${parentForum.slug}`}
              style={{
                fontSize: "12px",
                textDecoration: "none",
                color: themeColor,
                opacity: 0.9,
              }}
            >
              ← กลับสู่ฟอรั่มหลัก ({parentForum.name})
            </Link>
          ) : (
            <Link
              href="/forums"
              style={{
                fontSize: "12px",
                textDecoration: "none",
                color: themeColor,
                opacity: 0.9,
              }}
            >
              ← กลับไปหน้ารวมแผนที่เมือง
            </Link>
          )}
        </div>

        {canEditForum && (
          <Link href={`/forums/${slug}/edit`} style={{ textDecoration: "none" }}>
            <button
              style={{
                padding: "6px 14px",
                fontSize: "12px",
                background: `${themeColor}18`,
                border: `1px solid ${themeColor}`,
                cursor: "pointer",
                color: themeColor,
                fontWeight: "bold",
                boxShadow: `0 0 10px ${themeColor}33`,
              }}
            >
              ⚙️ แก้ไขฟอรั่ม
            </button>
          </Link>
        )}
      </div>

      {/* Banner Box */}
      <div style={{ marginBottom: "30px" }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            minHeight: "240px",
            border: `1px solid ${themeColor}`,
            background: "#08050a",
            overflow: "hidden",
            boxShadow: `0 0 25px ${themeColor}40`,
          }}
        >
          <img
            src={bannerImg}
            alt={forum.name}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "brightness(0.7) contrast(1.1)",
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.4) 50%)",
              backgroundSize: "100% 4px",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          {forum.nameJp && (
            <div
              style={{
                position: "absolute",
                top: "12px",
                right: "24px",
                fontFamily: "'Noto Sans JP', sans-serif",
                fontWeight: 700,
                fontSize: "64px",
                color: "#ffffff",
                opacity: 0.85,
                textShadow: `0 0 16px ${themeColor}, 0 0 30px ${themeColor}`,
                pointerEvents: "none",
                zIndex: 2,
                lineHeight: 1,
              }}
            >
              {forum.nameJp}
            </div>
          )}

          <div
            style={{
              position: "relative",
              zIndex: 3,
              padding: "32px 28px 24px 28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              minHeight: "240px",
              background:
                "linear-gradient(to top, rgba(8, 5, 10, 0.95) 0%, rgba(8, 5, 10, 0.6) 60%, rgba(8, 5, 10, 0.1) 100%)",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: themeColor,
                letterSpacing: "3px",
                marginBottom: "4px",
                textShadow: `0 0 8px ${themeColor}`,
              }}
            >
              FORUM
            </div>

            <h2
              style={{
                fontSize: "32px",
                margin: "0 0 6px 0",
                color: "#ffffff",
                fontWeight: "700",
                textShadow: `0 2px 10px rgba(0,0,0,0.8), 0 0 20px ${themeColor}66`,
              }}
            >
              {forum.name}
            </h2>

            {forum.description && (
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.85)",
                  lineHeight: "1.6",
                  maxWidth: "680px",
                }}
              >
                {forum.description}
              </p>
            )}
          </div>
        </div>

        {/* SVG Cut-Corner Box */}
        <div
          style={{
            position: "relative",
            marginTop: "8px",
            width: "100%",
            height: "42px",
            filter: `drop-shadow(0 0 6px ${themeColor}44)`,
          }}
        >
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            <path
              d="M 0,0 L 100%,0 L 100%,28 L calc(100% - 14px),42 L 0,42 Z"
              fill="rgba(12, 6, 16, 0.9)"
            />
            <path
              d="M 0,0 L 100%,0 L 100%,28 L calc(100% - 14px),42 L 0,42 Z"
              fill="none"
              stroke={themeColor}
              strokeWidth="1.5"
              strokeOpacity="0.75"
            />
          </svg>

          <div
            style={{
              position: "relative",
              zIndex: 2,
              height: "100%",
              padding: "0 20px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              fontSize: "13px",
              color: "rgba(255, 255, 255, 0.85)",
            }}
          >
            <span>
              ความเสี่ยง{" "}
              <b style={{ color: forum.danger > 50 ? "#ff5f5f" : themeColor }}>
                {forum.danger}%
              </b>
            </span>
            <span style={{ color: `${themeColor}88` }}>•</span>
            <span>
              <b style={{ color: "#fff" }}>{threadList.length}</b> กระทู้
            </span>
          </div>
        </div>
      </div>

      {/* Private Zones */}
      {!forum.parentId && (
        <div style={{ marginBottom: "40px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div
              className="tag"
              style={{
                color: themeColor,
                borderLeftColor: themeColor,
                textShadow: `0 0 6px ${themeColor}66`,
              }}
            >
              // SUB FORUMS
            </div>

            <Link href={`/create-sub?parent=${slug}`} style={{ textDecoration: "none" }}>
              <button
                style={{
                  padding: "6px 14px",
                  fontSize: "12px",
                  background: `${themeColor}18`,
                  border: `1px solid ${themeColor}`,
                  color: themeColor,
                  cursor: "pointer",
                  fontWeight: "bold",
                  boxShadow: `0 0 10px ${themeColor}33`,
                }}
              >
                + สร้างเขตส่วนตัว
              </button>
            </Link>
          </div>

          {subForumsList.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {subForumsList.map((sub) => {
                const subThemeColor = sub.themeColor || themeColor;
                const bgImage =
                  sub.bannerUrl ||
                  generateLocationSvg(sub.slug, subThemeColor, "mixed");

                // 🟢 แก้ไขการรองรับ residentChars ให้ใช้งานร่วมกับ jsonb (Array of ID) ได้อย่างปลอดภัย
                let residentIds: number[] = [];
                if (Array.isArray(sub.residentChars)) {
                  residentIds = sub.residentChars;
                } else if (typeof sub.residentChars === "string") {
                  const names = (sub.residentChars as string).split(/[, &\n\t]+/).map(s => s.trim()).filter(Boolean);
                  residentIds = allCharacters
                    .filter(c => names.includes(c.firstName) || (c.nameJp && names.includes(c.nameJp)))
                    .map(c => c.id);
                }

                const matchedChars = allCharacters.filter((c) => residentIds.includes(c.id));

                return (
                  <Link
                    key={sub.id}
                    href={`/forums/${sub.slug}`}
                    style={{
                      display: "block",
                      textDecoration: "none",
                      width: "100%",
                      minHeight: "110px",
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: "0px",
                      border: `1px solid ${subThemeColor}`,
                      background: `url("${bgImage}") center/cover no-repeat`,
                      boxShadow: `0 0 15px ${subThemeColor}33`,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(90deg, rgba(10,6,12,0.98) 0%, rgba(10,6,12,0.85) 45%, rgba(10,6,12,0.3) 100%)",
                        zIndex: 1,
                      }}
                    />

                    <div
                      style={{
                        position: "relative",
                        zIndex: 2,
                        height: "100%",
                        padding: "20px 24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                        }}
                      >
                        {sub.nameEn && (
                          <div
                            style={{
                              fontSize: "20px",
                              fontWeight: "700",
                              color: "#ffffff",
                              letterSpacing: "1px",
                              marginBottom: "4px",
                              textShadow: `0 0 10px ${subThemeColor}`,
                            }}
                          >
                            {sub.nameEn.toUpperCase()}
                          </div>
                        )}
                        <div
                          style={{
                            fontSize: "13px",
                            color: "rgba(255, 255, 255, 0.7)",
                            fontWeight: "400",
                          }}
                        >
                          {sub.name}
                        </div>
                      </div>

                      {/* 🟢 แสดงผลตัวละครหลายตัว เรียงชิดขวา และจำกัดพื้นที่ไม่เกินกึ่งกลางกล่อง */}
                      {matchedChars.length > 0 && (
                        <div
                          style={{
                            position: "relative",
                            display: "flex",
                            flexDirection: "row-reverse",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "6px",
                            maxWidth: "50%",
                            overflow: "hidden",
                            marginLeft: "16px",
                            zIndex: 2,
                          }}
                        >
                          {matchedChars.map((char) => (
                            <div
                              key={char.id}
                              style={{
                                position: "relative",
                                display: "inline-block",
                                cursor: "pointer",
                              }}
                              className="char-icon-container"
                            >
                              <img
                                src={
                                  char.faceUrl ||
                                  "https://via.placeholder.com/60"
                                }
                                alt={char.firstName}
                                style={{
                                  width: "42px",
                                  height: "42px",
                                  aspectRatio: "1/1",
                                  objectFit: "cover",
                                  borderRadius: "0px",
                                  border: `1px solid ${subThemeColor}`,
                                  display: "block",
                                  boxShadow: "0 0 8px rgba(0,0,0,0.5)",
                                }}
                              />
                              <span
                                className="char-tooltip"
                                style={{
                                  position: "absolute",
                                  bottom: "100%",
                                  right: "0",
                                  marginBottom: "6px",
                                  background: "rgba(10, 6, 12, 0.95)",
                                  color: "#fff",
                                  border: `1px solid ${subThemeColor}`,
                                  padding: "3px 8px",
                                  fontSize: "11px",
                                  whiteSpace: "nowrap",
                                  borderRadius: "0px",
                                  pointerEvents: "none",
                                  opacity: 0,
                                  transition: "opacity 0.2s ease",
                                  boxShadow: `0 0 8px ${subThemeColor}aa`,
                                  zIndex: 10,
                                }}
                              >
                                {char.firstName}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ส่วนรายการกระทู้ */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          width: "100%",
        }}
      >
        <div
          className="tag"
          style={{
            color: themeColor,
            borderLeftColor: themeColor,
            textShadow: `0 0 6px ${themeColor}66`,
          }}
        >
          // THREAD LIST ({threadList.length} กระทู้)
        </div>

        <Link href={`/forums/${slug}/new`} style={{ textDecoration: "none" }}>
          <button
            style={{
              padding: "8px 18px",
              cursor: "pointer",
              background: `${themeColor}22`,
              border: `1px solid ${themeColor}`,
              color: "#ffffff",
              fontWeight: "bold",
              boxShadow: `0 0 12px ${themeColor}44`,
            }}
          >
            + ตั้งกระทู้ใหม่
          </button>
        </Link>
      </div>

      {threadList.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 20px",
            borderRadius: "0px",
            border: `1px solid ${themeColor}44`,
            // 🔴 เปลี่ยนจาก rgba เป็น Hex ทึบ
            background: "#120a16", 
            color: "#a1a1aa",
            fontSize: "14px",
            letterSpacing: "0.5px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
          }}
        >
          — ยังไม่มีกระทู้ในย่านนี้ เริ่มต้นเปิดบทสนทนาแรกกันเลย —
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {threadList.map((t) => (
            <Link
              key={t.id}
              href={`/forums/${slug}/${t.id}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textDecoration: "none",
                padding: "14px 20px",
                borderRadius: 0,
                border: `1px solid ${t.pinned ? themeColor : `${themeColor}44`}`,
                // 🔴 เปลี่ยนจาก rgba(10, 10, 12, 0.85) และ ${themeColor}12 ให้เป็นสีทึบทั้งหมด
                // ตัวอย่าง: กระทู้ปักหมุดสีเข้มขึ้นนิดนึง, กระทู้ปกติสีดำอมม่วง
                background: t.pinned ? "#1a0b22" : "#120a16",
                boxShadow: t.pinned ? `0 0 12px ${themeColor}33` : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                {t.pinned && <span title="ปักหมุด" style={{ fontSize: "14px" }}>📌</span>}
                {(t.locked || t.password) && <span title="ล็อกรหัสผ่าน" style={{ fontSize: "14px" }}>🔑</span>}
                {t.closed && <span title="ปิดรับการตอบกลับ" style={{ fontSize: "14px" }}>⛔</span>}

                <span style={{ fontWeight: 600, fontSize: "15px", color: "#ffffff" }}>{t.title}</span>
              </div>

              <div style={{ textAlign: "right", fontSize: "12px", color: "#a1a1aa" }}>
                <div>โดย {t.authorName || "นิรนาม"}</div>
                <div>{new Date(t.createdAt).toLocaleDateString("th-TH")}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Tooltip CSS */}
      <style>{`
        .char-icon-container:hover .char-tooltip {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}

export default async function ForumDetailPage({ params }: PageProps) {
  return (
    <main>
      <Suspense fallback={<div className="mut">กำลังโหลดข้อมูลเขต...</div>}>
        <ForumContent params={params} />
      </Suspense>
    </main>
  );
}