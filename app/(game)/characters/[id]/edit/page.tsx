import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/session";
import { updateCharacter } from "@/actions/characters";
import { RANKS } from "@/lib/constants";
import StatsEditor from "@/components/character/StatsEditor";
import BBEditor from "@/components/bbcode/BBEditor";
import RelationshipEditor from "@/components/character/RelationshipEditor";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

const F = ({ label, name, def, type = "text", max }: { label: string; name: string; def?: string | number | null; type?: string; max?: number }) => (
  <label className="fl">{label}<input name={name} type={type} defaultValue={def ?? ""} maxLength={max} /></label>
);
const T = ({ label, name, def, rows = 3 }: { label: string; name: string; def?: string | null; rows?: number }) => (
  <label className="fl">{label}<textarea name={name} rows={rows} defaultValue={def ?? ""} /></label>
);
const FULL = { gridColumn: "1 / -1" } as const;

async function EditForm({ params }: { params: Promise<{ id: string }> }) {
  const cid = Number((await params).id);
  if (!Number.isInteger(cid)) notFound();

  // 1. ตรวจสอบ Session
  const session = await getSession();
  if (!session) redirect("/login");

  // 2. ดึงข้อมูลตัวละคร
  const [c] = await db.select().from(schema.characters).where(eq(schema.characters.id, cid)).limit(1);
  if (!c) notFound();

  // 3. ตรวจสอบสิทธิ์ความเป็นเจ้าของ หรือ Admin
  const isOwner = c.userId === session.userId;
  const isAdmin = session.role === "admin";
  
  if (!isOwner && !isAdmin) {
    redirect(`/characters/${cid}`);
  }

  // 4. ดึงข้อมูลอ้างอิงสำหรับ Dropdown ต่างๆ
  const guilds = await db.select().from(schema.guilds).orderBy(asc(schema.guilds.id));
  const locations = await db.select().from(schema.locations).orderBy(asc(schema.locations.id));
  const allCharacters = await db
    .select({ 
      id: schema.characters.id, 
      nameJp: schema.characters.nameJp, 
      firstName: schema.characters.firstName, 
      lastName: schema.characters.lastName 
    })
    .from(schema.characters)
    .orderBy(asc(schema.characters.id));

  return (
    <form action={updateCharacter.bind(null, cid)}>
      <div className="box">
        <div className="tag">// EDIT CHARACTER</div>
        <h2>{c.nameJp} <span className="mut">{c.firstName}</span></h2>
      </div>

      <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 450px), 1fr))" }}>
        <div className="box">
          <div className="tag">BASIC</div>
          <F label="ชื่อญี่ปุ่น" name="nameJp" def={c.nameJp} max={60} />
          <F label="ชื่อ" name="firstName" def={c.firstName} max={60} />
          <F label="นามสกุล" name="lastName" def={c.lastName} max={60} />
          <label className="fl">ประเภท
            <select name="type" defaultValue={c.type}>
              <option value="esper">เอสเปอร์</option>
              <option value="guide">ไกด์</option>
            </select>
          </label>
          <F label="คลาส/อาชีพ" name="className" def={c.className} />
          <label className="fl">แรงก์
            <select name="rank" defaultValue={c.rank}>
              {RANKS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>
          <label className="fl">กิลด์/ฝ่าย
            <select name="guildId" defaultValue={c.guildId ?? ""}>
              <option value="">— ไม่มี —</option>
              {guilds.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </label>
          <label className="fl">สถานที่ / ที่พำนักปัจจุบัน
            <select name="statusLocationId" defaultValue={c.statusLocationId ?? ""}>
              <option value="">— ไม่ระบุ —</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.jp} {l.name}</option>)}
            </select>
          </label>
          <F label="โน้ตสั้น" name="note" def={c.note} />
        </div>

        <div className="box">
          <div className="tag">PROFILE</div>
          <F label="อายุ (20 ขึ้นไป)" name="age" type="number" def={c.age} />
          <F label="วันเกิด" name="birthday" def={c.birthday} />
          <F label="สูง / หนัก" name="heightWeight" def={c.heightWeight} />
          <F label="กรุ๊ปเลือด" name="bloodType" def={c.bloodType} />
          <F label="MBTI" name="mbti" def={c.mbti} max={4} />
          <F label="คำพูดประจำตัว" name="quote" def={c.quote} />
          <F label="นิสัย (คั่นด้วย ,)" name="traits" def={c.traits?.join(", ")} />
        </div>

        <div className="box" style={FULL}>
          <div className="tag">STATS</div>
          <StatsEditor initial={c.stats} color={c.colorPrimary} />
        </div>

        <div className="box">
          <div className="tag">ABILITY</div>
          <F label="ชื่อทาเล้นท์ / โซลลิงก์" name="abilityName" def={c.abilityName} />
          <T label="รายละเอียด" name="abilityDesc" def={c.abilityDesc} rows={5} />
          <F label="Doom / Sync load %" name="doomLevel" type="number" def={c.doomLevel} />
        </div>

        <div className="box">
          <div className="tag">LOOK · ภาพใช้ลิงก์ภายนอกเท่านั้น</div>
          <F label="สีหลัก" name="colorPrimary" type="color" def={c.colorPrimary} />
          <F label="URL รูปหลัก" name="imageMainUrl" def={c.imageMainUrl} />
          <F label="URL รูป 2:5" name="vertical_banner_url" def={c.verticalBannerUrl} />
          <F label="URL รูปหน้าตรง" name="faceUrl" def={c.faceUrl} />
        </div>

        <div className="box" style={FULL}>
          <div className="tag">STORY</div>
          <BBEditor name="story" label="ประวัติ / ความเป็นมา (ตกแต่งตัวอักษรด้วย BBCode ได้)" defaultValue={c.story ?? ""} minHeight={380} />
          
          <div className="tag" style={{ marginTop: "24px", marginBottom: "12px" }}>RELATIONSHIPS (ความสัมพันธ์กับตัวละครอื่น)</div>
          <RelationshipEditor initialTies={c.ties} characters={allCharacters} />
        </div>
      </div>

      <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <Link
          href={`/characters/${cid}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            background: "transparent",
            color: "var(--mut, #a68c9c)",
            border: "1px solid var(--line, #8a3a68)",
            fontSize: "15px",
            padding: "12px 24px",
            textDecoration: "none",
            borderRadius: "4px",
            fontWeight: 600,
          }}
        >
          ยกเลิก
        </Link>
        <button
          type="submit"
          style={{
            color: "#08050a",
            background: "var(--cy, #ff5fa8)",
            boxShadow: `0 0 16px ${c.colorPrimary}80`,
            fontSize: "16px",
            padding: "12px 32px",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          บันทึกการเปลี่ยนแปลง
        </button>
      </div>
    </form>
  );
}

export default async function EditCharacterPage({ params }: PageProps) {
  return (
    <main style={{ paddingBottom: "100px" }}>
      <Suspense fallback={<div className="mut">กำลังโหลดข้อมูล...</div>}>
        <EditForm params={params} />
      </Suspense>
    </main>
  );
}