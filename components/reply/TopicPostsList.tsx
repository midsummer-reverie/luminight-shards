"use client";

import Link from "next/link";
import PostRender from "./PostRender";

interface PostItem {
  id: number;
  renderedHtml: string;
  createdAt: string | Date;
  user: { id: number; username: string; avatarUrl?: string };
  character: {
    id: number;
    firstName: string;
    lastName?: string;
    verticalBannerUrl?: string;
    imageMainUrl?: string;
    colorPrimary?: string;
    rank?: string;
    guildId?: string;
    species?: string;
  };
  cssLink?: string;
}

interface TopicPostsListProps {
  posts: PostItem[];
  forumThemeColor?: string;
}

const DATE = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });
const hex = (v?: string) => (v && /^#[0-9a-f]{6}$/i.test(v) ? v : "#ff5fa8");

// --tc = สีธีมกระทู้/ฟอรั่ม (กรอบนอก เส้นแบ่งในกรอบ มุมพับ แถบหัว เลขโพสต์)
// --cc = สีธีมตัวละคร (รูป ชื่อ รายละเอียดตัวละคร)
const CSS = `
.tp-list{display:flex;flex-direction:column;gap:32px;margin-top:24px}
.tp-card{
  position:relative;display:flex;background:#0e0910;
  border:1px solid color-mix(in srgb,var(--tc) 35%,#1a0f1c);box-shadow:0 8px 30px #000a;
  clip-path:polygon(0 0,calc(100% - 18px) 0,100% 18px,100% 100%,0 100%)
}
.tp-card::after{content:"";position:absolute;top:0;right:0;width:18px;height:18px;pointer-events:none;opacity:.85;
  background:linear-gradient(to bottom left,transparent calc(50% - .5px),var(--tc) calc(50% - .5px),var(--tc) calc(50% + 1.5px),transparent calc(50% + 1.5px))}

/* แถบซ้าย: เส้นแบ่งในกรอบใช้สีฟอรั่ม ส่วนพื้นหลังไล่สีใช้สีตัวละคร */
.tp-side{width:240px;flex:none;padding:20px 16px;display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center;
  border-right:1px solid color-mix(in srgb,var(--tc) 35%,#1a0f1c);
  background:linear-gradient(180deg,color-mix(in srgb,var(--cc) 10%,#0a0510),#0a0510)}
.tp-bannerlink{display:block;width:100%}
.tp-banner{display:block;width:100%;aspect-ratio:2/5;object-fit:cover;border:1px solid var(--cc);
  box-shadow:0 0 16px color-mix(in srgb,var(--cc) 25%,transparent);transition:.3s}
.tp-banner:hover{box-shadow:0 0 24px color-mix(in srgb,var(--cc) 60%,transparent);transform:translateY(-2px)}

.tp-info{display:flex;flex-direction:column;align-items:center;gap:10px;width:100%}
.tp-name-wrapper{display:flex;flex-direction:column;align-items:center;text-decoration:none;gap:2px;max-width:100%}
.tp-name-last{font:600 .8rem/1.3 var(--font-body,sans-serif);letter-spacing:.2em;color:color-mix(in srgb,var(--cc) 80%,#fff);text-transform:uppercase;overflow-wrap:anywhere}
.tp-name-first{font:800 1.4rem/1.25 var(--font-body,sans-serif);color:#fff;text-transform:uppercase;letter-spacing:.05em;overflow-wrap:anywhere;
  text-shadow:0 0 12px color-mix(in srgb,var(--cc) 60%,transparent);transition:.2s}
.tp-name-wrapper:hover .tp-name-first{color:var(--cc)}

.tp-user{display:inline-flex;align-items:center;gap:6px;font:600 11px var(--font-hud,sans-serif);letter-spacing:.08em;
  color:var(--mut,#a68c9c);background:#ffffff0d;padding:4px 12px;line-height:1.7;border-radius:2px;max-width:100%;overflow-wrap:anywhere}
.tp-user:hover{color:var(--cc);background:color-mix(in srgb,var(--cc) 15%,transparent)}

/* รายละเอียดตัวละคร: แถวสเปกแบบมีเส้นสีด้านข้าง ไม่ใช้กรอบ (ข้อความยาวขึ้นบรรทัดใหม่ได้) */
.tp-hud{display:flex;flex-direction:column;gap:14px;width:100%;text-align:left}
.tp-spec{min-width:0;padding:3px 0 3px 12px;border-left:2px solid color-mix(in srgb,var(--cc) 70%,transparent);
  background:linear-gradient(90deg,color-mix(in srgb,var(--cc) 12%,transparent),transparent 85%)}
.tp-k{font:600 9px/1.4 var(--font-hud,sans-serif);letter-spacing:.22em;color:var(--mut,#a68c9c)}
.tp-v{margin-top:2px;font:700 13px/1.5 var(--font-body,sans-serif);color:#fff;overflow-wrap:anywhere;word-break:break-word}
.tp-v i{color:var(--cc);font-style:normal;margin-right:6px;text-shadow:0 0 8px var(--cc)}
.tp-row{display:flex;align-items:center;gap:14px}
.tp-row .tp-spec{flex:1}
.tp-rankwrap{flex:none;display:flex;flex-direction:column;align-items:center;gap:4px}
.tp-rank{width:44px;height:44px;display:grid;place-items:center;border-radius:50%;border:1px solid var(--cc);
  font:800 19px/1 var(--font-hud,sans-serif);color:var(--cc);text-shadow:0 0 10px color-mix(in srgb,var(--cc) 70%,transparent);
  box-shadow:0 0 14px color-mix(in srgb,var(--cc) 30%,transparent),inset 0 0 10px color-mix(in srgb,var(--cc) 15%,transparent)}

.tp-main{flex:1;min-width:0;display:flex;flex-direction:column;background:#131313}
.tp-head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 24px;
  border-bottom:1px solid color-mix(in srgb,var(--tc) 30%,#1a0f1c);background:color-mix(in srgb,var(--tc) 6%,#131313);
  font:600 11px var(--font-hud,sans-serif);letter-spacing:.15em;color:var(--mut,#a68c9c)}
.tp-head b{color:var(--tc);font-size:13px}
.tp-body{flex:1;background:#131313;padding:0;overflow:hidden}
.tp-body::-webkit-scrollbar{display:none!important}
.tp-body{-ms-overflow-style:none;scrollbar-width:none}

.tp-render{width:100%;height:100%}
.tp-nopost{padding:32px;text-align:center;color:var(--mut,#a68c9c);font-size:13px}
.tp-empty{text-align:center;padding:40px;color:var(--mut,#a68c9c);border:1px dashed var(--line,#8a3a68);background:#0e0910}

@media (max-width:768px){
  .tp-card{flex-direction:column}
  .tp-side{width:100%;flex-direction:row;align-items:flex-start;text-align:left;padding:16px;border-right:0;
    border-bottom:1px solid color-mix(in srgb,var(--tc) 35%,#1a0f1c)}
  .tp-bannerlink{width:90px;flex:none}
  .tp-banner{width:100%;aspect-ratio:2/5;border-radius:2px}
  .tp-info{align-items:flex-start;gap:8px;padding-left:16px;width:calc(100% - 90px)}
  .tp-name-wrapper{align-items:flex-start}
}
`;

export default function TopicPostsList({ posts, forumThemeColor }: TopicPostsListProps) {
  if (!posts || posts.length === 0) {
    return <div className="tp-empty"><style dangerouslySetInnerHTML={{ __html: CSS }} />ยังไม่มีการตอบกลับในกระทู้นี้</div>;
  }

  const mainThemeColor = hex(forumThemeColor || "#ff5fa8");

  return (
    <div className="tp-list">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {posts.map((post, index) => {
        const c = post.character;
        const banner = c.verticalBannerUrl || c.imageMainUrl || "https://placehold.co/400x1000?text=No+Banner";

        return (
          <div
            key={post.id}
            className="tp-card"
            style={{ ["--tc" as string]: mainThemeColor, ["--cc" as string]: hex(c.colorPrimary) }}
          >
            <div className="tp-side">
              <Link href={`/characters/${c.id}`} className="tp-bannerlink">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={banner} alt={`${c.firstName} Banner`} className="tp-banner" loading="lazy" referrerPolicy="no-referrer" />
              </Link>

              <div className="tp-info">
                <Link href={`/characters/${c.id}`} className="tp-name-wrapper">
                  {c.lastName && <span className="tp-name-last">{c.lastName}</span>}
                  <span className="tp-name-first">{c.firstName}</span>
                </Link>

                <Link href={`/profile/${post.user.id}`} className="tp-user">👤 @{post.user.username}</Link>

                <div className="tp-hud">
                  <div className="tp-spec">
                    <div className="tp-k">FACTION</div>
                    <div className="tp-v"><i>●</i>{c.guildId || "UNKNOWN"}</div>
                  </div>
                  <div className="tp-row">
                    <div className="tp-spec">
                      <div className="tp-k">CLASS</div>
                      <div className="tp-v">{c.species || "ESPER"}</div>
                    </div>
                    <div className="tp-rankwrap">
                      <div className="tp-k">RANK</div>
                      <div className="tp-rank">{c.rank || "-"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="tp-main">
              <div className="tp-head">
                <span>// REPLY · {DATE.format(new Date(post.createdAt))}</span>
                <b>#{String(index + 1).padStart(2, "0")}</b>
              </div>
              <div className="tp-body">
                {post.renderedHtml?.trim()
                  ? <PostRender html={post.renderedHtml} cssLink={post.cssLink} />
                  : <div className="tp-nopost">— โพสต์นี้ไม่มีเนื้อหา —</div>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}