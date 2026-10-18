import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/session";
import { updateCharacter } from "@/actions/characters";
import { RANKS } from "@/lib/constants";
import StatsEditor from "@/components/character/StatsEditor";
import BBEditor from "@/components/bbcode/BBEditor";

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
  const session = await getSession();
  if (!session) redirect("/login");
  const [c] = await db.select().from(schema.characters).where(eq(schema.characters.id, cid)).limit(1);
  if (!c) notFound();
  if (c.userId !== session.uid) redirect(`/characters/${cid}`);
  const guilds = await db.select().from(schema.guilds).orderBy(asc(schema.guilds.id));

  return (
    <form action={updateCharacter.bind(null, cid)}>
      <div className="box"><div className="tag">// EDIT CHARACTER</div><h2>{c.nameJp} <span className="mut">{c.firstName}</span></h2></div>
      <div className="cg2">
        <div className="box"><div className="tag">BASIC</div>
          <F label="ชื่อญี่ปุ่น" name="nameJp" def={c.nameJp} max={60} />
          <F label="ชื่อ" name="firstName" def={c.firstName} max={60} />
          <F label="นามสกุล" name="lastName" def={c.lastName} max={60} />
          <label className="fl">ประเภท<select name="type" defaultValue={c.type}><option value="esper">เอสเปอร์</option><option value="guide">ไกด์</option></select></label>
          <F label="คลาส/อาชีพ" name="className" def={c.className} />
          <label className="fl">แรงก์<select name="rank" defaultValue={c.rank}>{RANKS.map((r) => <option key={r}>{r}</option>)}</select></label>
          <label className="fl">กิลด์/ฝ่าย<select name="guildId" defaultValue={c.guildId ?? ""}><option value="">— ไม่มี —</option>{guilds.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
          <F label="ที่พำนัก" name="homeText" def={c.homeText} />
          <F label="โน้ตสั้น" name="note" def={c.note} />
        </div>
        <div className="box"><div className="tag">PROFILE</div>
          <F label="อายุ (20 ขึ้นไป)" name="age" type="number" def={c.age} />
          <F label="วันเกิด" name="birthday" def={c.birthday} />
          <F label="สูง / หนัก" name="heightWeight" def={c.heightWeight} />
          <F label="กรุ๊ปเลือด" name="bloodType" def={c.bloodType} />
          <F label="MBTI" name="mbti" def={c.mbti} max={4} />
          <F label="คำพูดประจำตัว" name="quote" def={c.quote} />
          <F label="นิสัย (คั่นด้วย ,)" name="traits" def={c.traits.join(", ")} />
        </div>

        <div className="box" style={FULL}><div className="tag">STATS</div>
          <StatsEditor initial={c.stats} color={c.colorPrimary} />
        </div>

        <div className="box"><div className="tag">ABILITY</div>
          <F label="ชื่อทาเล้นท์ / โซลลิงก์" name="abilityName" def={c.abilityName} />
          <T label="รายละเอียด" name="abilityDesc" def={c.abilityDesc} rows={5} />
          <F label="Doom / Sync load %" name="doomLevel" type="number" def={c.doomLevel} />
        </div>
        <div className="box"><div className="tag">LOOK · ภาพใช้ลิงก์ภายนอกเท่านั้น</div>
          <F label="สีหลัก" name="colorPrimary" type="color" def={c.colorPrimary} />
          <F label="สีรอง" name="colorSecondary" type="color" def={c.colorSecondary} />
          <F label="พื้นหลัง" name="colorBg" type="color" def={c.colorBg} />
          <F label="ความยาวเส้นประกายใต้ชื่อ (ตกแต่งในเทมเพลต) %" name="sparkPercent" type="number" def={c.sparkPercent} />
          <F label="URL รูปหลัก" name="imageMainUrl" def={c.imageMainUrl} />
          <F label="URL รูปรอง" name="imageSubUrl" def={c.imageSubUrl} />
          <F label="URL รูปหน้าตรง (Biometric)" name="faceUrl" def={c.faceUrl} />
        </div>

        <div className="box" style={FULL}><div className="tag">STORY</div>
          <BBEditor name="story" label="ประวัติ / ความเป็นมา (ตกแต่งตัวอักษรด้วย BBCode ได้)" defaultValue={c.story ?? ""} minHeight={380} />
          <T label="ความสัมพันธ์ (บรรทัดละข้อ)" name="ties" def={c.ties.join("\n")} rows={6} />
        </div>
      </div>
      <p><button>บันทึก</button></p>
    </form>
  );
}

export default function EditCharacterPage(props: PageProps<"/characters/[id]/edit">) {
  return (
    <main>
      <Suspense fallback={<div className="mut">กำลังโหลด...</div>}>
        <EditForm params={props.params} />
      </Suspense>
    </main>
  );
}