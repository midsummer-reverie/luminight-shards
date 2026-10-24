import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, asc, inArray } from "drizzle-orm"; // 🟢 เพิ่ม inArray
import { db, schema } from "@/db";
import { getSession } from "@/lib/session";
import ThreadPasswordGuard from "@/components/ThreadPasswordGuard";
import ForumThemeStyle from "@/components/ForumThemeStyle";
import BBContent from "@/components/bbcode/BBContent";
import TopicPostsList from "@/components/reply/TopicPostsList";
import TopicReplyClient from "@/components/reply/TopicReplyClient";

interface PageProps {
  params: Promise<{ slug: string; id: string }>;
}

async function ThreadDetailContent({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const threadId = Number(id);

  if (isNaN(threadId)) return notFound();

  const session = await getSession();
  const currentUserId = session?.userId ? Number(session.userId) : null;
  const isAdmin = session?.role === "admin";

  // 1. ดึงข้อมูลกระทู้ + ย่าน
  const [thread] = await db
    .select({
      id: schema.threads.id,
      title: schema.threads.title,
      content: schema.threads.content,
      templateStyle: schema.threads.templateStyle,
      bannerUrl: schema.threads.bannerUrl,
      customCss: schema.threads.customCss,
      pinned: schema.threads.pinned,
      locked: schema.threads.locked,
      closed: schema.threads.closed,
      createdAt: schema.threads.createdAt,
      locationName: schema.locations.name,
      locationSlug: schema.locations.slug,
      locationThemeColor: schema.locations.themeColor, 
      authorUserId: schema.threads.authorUserId,
      authorName: schema.users.username,
    })
    .from(schema.threads)
    .innerJoin(schema.locations, eq(schema.threads.locationId, schema.locations.id))
    .leftJoin(schema.users, eq(schema.threads.authorUserId, schema.users.id))
    .where(eq(schema.threads.id, threadId));

  if (!thread || thread.locationSlug !== slug) return notFound();

  // 2. กำหนดสีธีมประจำย่าน
  const themeColor = thread.locationThemeColor || "#38c8ff";
  const canEdit = (currentUserId !== null && currentUserId === thread.authorUserId) || isAdmin;

  // 3. ดึงรายการโพสต์ตอบกลับทั้งหมด (JOIN Users, Characters, UserCodes, Templates)
  // 3. ดึงรายการโพสต์ตอบกลับทั้งหมด พร้อมดึงข้อมูลสีและสเปกตัวละครให้ครบถ้วน
  // 3. ดึงรายการโพสต์ตอบกลับทั้งหมด พร้อม JOIN ตาราง guilds เพื่อเอาชื่อกิลด์
  const rawPostsData = await db
    .select({
      id: schema.posts.id,
      renderedHtml: schema.posts.renderedHtml,
      body: schema.posts.body,
      createdAt: schema.posts.createdAt,
      postVariablesJson: schema.posts.postVariablesJson,
      user: {
        id: schema.users.id,
        username: schema.users.username,
      },
      character: {
        id: schema.characters.id,
        firstName: schema.characters.firstName,
        lastName: schema.characters.lastName,
        verticalBannerUrl: schema.characters.verticalBannerUrl,
        imageMainUrl: schema.characters.imageMainUrl,
        colorPrimary: schema.characters.colorPrimary,
        rank: schema.characters.rank,           // ดึง Rank (S, A, B, C...)
        type: schema.characters.type,           // ดึง Type (esper / guide)
        className: schema.characters.className, // ดึง Class Name
      },
      guildNameEn: schema.guilds.nameEn,
      guildNameTh: schema.guilds.name, 
      cssLink: schema.templates.cssLink,
    })
    .from(schema.posts)
    .leftJoin(schema.users, eq(schema.posts.userId, schema.users.id))
    .leftJoin(schema.characters, eq(schema.posts.characterId, schema.characters.id))
    .leftJoin(schema.guilds, eq(schema.characters.guildId, schema.guilds.id)) // 🟢 JOIN ตาราง guilds
    .leftJoin(schema.userCodes, eq(schema.posts.userCodeId, schema.userCodes.id))
    .leftJoin(schema.templates, eq(schema.userCodes.templateId, schema.templates.id))
    .where(eq(schema.posts.threadId, threadId))
    .orderBy(asc(schema.posts.createdAt));

  // แปลงรูปแบบข้อมูลให้ตรงกับที่ TopicPostsList ใช้งาน
  const postsList = (rawPostsData || []).map((post) => {
    const parsedValues = post?.postVariablesJson
      ? typeof post.postVariablesJson === "string"
        ? JSON.parse(post.postVariablesJson) || {}
        : post.postVariablesJson
      : { variables: {}, blocksData: {} };

    return {
      id: post.id,
      renderedHtml: post.renderedHtml || (post.body ? `<div class="bb-fallback">${post.body}</div>` : ""),
      createdAt: post.createdAt,
      postVariablesJson: parsedValues,
      variables: parsedValues?.variables || {},
      blocksData: parsedValues?.blocksData || {},
      user: {
        id: post.user?.id || 0,
        username: post.user?.username || "นิรนาม",
      },
      character: post.character?.id
        ? {
            id: post.character.id,
            firstName: post.character.firstName,
            lastName: post.character.lastName || undefined,
            verticalBannerUrl: post.character.verticalBannerUrl || undefined,
            imageMainUrl: post.character.imageMainUrl || undefined,
            colorPrimary: post.character.colorPrimary || undefined,
            rank: post.character.rank || "C",                                    // ตรงตาม schema charRank
            guildId: post.guildNameEn || post.guildNameTh || "UNKNOWN",                               // 🟢 ใช้ชื่อกิลด์ หรือ UNKNOWN
            species: post.character.className || post.character.type?.toUpperCase() || "ESPER", // 🟢 ใช้ className หรือ type
          }
        : {
            id: 0,
            firstName: post.user?.username || "นิรนาม",
          },
      cssLink: post.cssLink || undefined,
    };
  });

  // 4. ดึงข้อมูลตัวละครและโค้ดของผู้ใช้ที่ล็อกอินอยู่ เพื่อเตรียมส่งให้ฟอร์มตอบกลับ
  let userCharacters: any[] = [];
  let userCodesWithChars: any[] = [];
  let availableTemplates: any[] = [];

  if (currentUserId) {
    userCharacters = await db
      .select()
      .from(schema.characters)
      .where(eq(schema.characters.userId, currentUserId));

    const userCodesData = await db
      .select()
      .from(schema.userCodes)
      .where(eq(schema.userCodes.userId, currentUserId));

    // 🟢 แก้ปัญหา N+1 Query ด้วย inArray (ดึงข้อมูลรวดเดียว)
    const userCodeIds = userCodesData.map((c) => c.id);
    let allCharLinks: { userCodeId: number; characterId: number }[] = [];

    if (userCodeIds.length > 0) {
      allCharLinks = await db
        .select({
          userCodeId: schema.userCodeCharacters.userCodeId,
          characterId: schema.userCodeCharacters.characterId,
        })
        .from(schema.userCodeCharacters)
        .where(inArray(schema.userCodeCharacters.userCodeId, userCodeIds));
    }

    userCodesWithChars = userCodesData.map((code) => {
      const matchedLinks = allCharLinks.filter((l) => l.userCodeId === code.id);
      return {
        ...code,
        characterIds: matchedLinks.map((l) => l.characterId),
      };
    });

    availableTemplates = await db
      .select()
      .from(schema.templates)
      .where(eq(schema.templates.isActive, true));
  }

  const ThreadBody = (
    <div style={{ maxWidth: "1020px", margin: "0 auto", fontFamily: "'Google Sans', sans-serif" }}>
      {/* ประกาศชุดสีธีมหลัก */}
      <ForumThemeStyle themeColor={themeColor} />

      {thread.customCss && <style>{thread.customCss}</style>}

      <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href={`/forums/${thread.locationSlug}`} style={{ fontSize: "12px", color: themeColor, textDecoration: "none" }}>
          ← กลับสู่ย่าน {thread.locationName}
        </Link>
      </div>

      {thread.bannerUrl && (
        <div style={{ width: "100%", height: "200px", overflow: "hidden", marginBottom: "16px", border: `1px solid ${themeColor}`, boxShadow: `0 0 12px ${themeColor}33` }}>
          <img src={thread.bannerUrl} alt="Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}

      {/* หัวข้อกระทู้หลัก */}
      <div
        style={{
          padding: "24px 28px",
          background: "rgba(10, 10, 14, 0.9)",
          border: `1px solid ${themeColor}`,
          borderLeft: `5px solid ${themeColor}`,
          boxShadow: `0 0 20px ${themeColor}15`,
          marginBottom: "24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "14px", flexWrap: "wrap" }}>
          {thread.pinned && (
            <span style={{ fontSize: "11px", padding: "2px 8px", background: `${themeColor}22`, border: `1px solid ${themeColor}`, color: themeColor, fontWeight: "bold" }}>
              📌 ปักหมุด
            </span>
          )}
          {thread.locked && (
            <span style={{ fontSize: "11px", padding: "2px 8px", background: "#a78bfa22", border: "1px solid #a78bfa", color: "#a78bfa", fontWeight: "bold" }}>
              🔑 ล็อกด้วยรหัสผ่าน
            </span>
          )}
          {thread.closed && (
            <span style={{ fontSize: "11px", padding: "2px 8px", background: "#ff5f6f22", border: "1px solid #ff5f6f", color: "#ff5f6f", fontWeight: "bold" }}>
              ⛔ ปิดการตอบกลับ
            </span>
          )}

          <span style={{ fontSize: "12px", color: "#888", marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
            <span>
              โดย:{" "}
              {thread.authorUserId ? (
                <Link href={`/profile/${thread.authorUserId}`} style={{ color: themeColor, textDecoration: "none", fontWeight: "bold" }}>
                  {thread.authorName || "นิรนาม"}
                </Link>
              ) : (
                <b style={{ color: themeColor }}>{thread.authorName || "นิรนาม"}</b>
              )}
            </span>

            {canEdit && (
              <Link href={`/forums/${slug}/${id}/edit`}>
                <button
                  type="button"
                  style={{
                    padding: "4px 12px",
                    fontSize: "11px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid #555",
                    color: "#ddd",
                    cursor: "pointer",
                    borderRadius: "2px",
                  }}
                >
                  ⚙️ แก้ไข
                </button>
              </Link>
            )}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <span style={{ color: themeColor, fontSize: "20px" }}>✦</span>
          <h1 style={{ fontSize: "26px", color: "#fff", margin: 0, fontWeight: "700", letterSpacing: "0.5px", textShadow: `0 0 10px ${themeColor}44` }}>
            {thread.title}
          </h1>
        </div>

        <div style={{ borderTop: `1px dashed ${themeColor}44`, paddingTop: "20px" }}>
          <BBContent content={thread.content || ""} />
        </div>
      </div>

      {/* 🟢 ส่วนแสดงผลรายการโพสต์ตอบกลับ */}
      <div style={{ marginBottom: "32px" }}>
        {/* 🟢 ส่ง themeColor ไปให้ TopicPostsList ด้วย */}
        <TopicPostsList posts={postsList} forumThemeColor={themeColor} />
      </div>

      {/* 🟢 ส่วนฟอร์มตอบกลับกระทู้ */}
      {thread.closed ? (
        <div style={{ padding: "18px", textAlign: "center", background: "rgba(255, 95, 111, 0.1)", border: "1px solid #ff5f6f", color: "#ff5f6f", fontSize: "14px", fontWeight: "bold" }}>
          ⛔ [CLOSED] กระทู้นี้ถูกปิดการตอบกลับแล้ว
        </div>
      ) : currentUserId ? (
        <div style={{ padding: "20px", background: "rgba(10, 10, 14, 0.85)", border: `1px solid ${themeColor}66`, borderRadius: "12px" }}>
          <TopicReplyClient
            slug={slug}
            topicId={threadId}
            characters={userCharacters}
            userCodes={userCodesWithChars}
            templates={availableTemplates}
          />
        </div>
      ) : (
        <div style={{ padding: "20px", textAlign: "center", background: "rgba(10, 10, 14, 0.85)", border: `1px solid ${themeColor}66`, borderRadius: "12px", color: "#888", fontSize: "14px" }}>
          🔒 กรุณาล็อกอินเพื่อตอบกลับกระทู้นี้
        </div>
      )}
    </div>
  );

  if (thread.locked) {
    return (
      <ThreadPasswordGuard threadId={thread.id} themeColor={themeColor}>
        {ThreadBody}
      </ThreadPasswordGuard>
    );
  }

  return ThreadBody;
}

export default async function ThreadDetailPage({ params }: PageProps) {
  return (
    <main style={{ padding: "20px 0" }}>
      <Suspense fallback={<div className="mut">กำลังโหลดกระทู้...</div>}>
        <ThreadDetailContent params={params} />
      </Suspense>
    </main>
  );
}