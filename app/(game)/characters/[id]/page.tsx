import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/session";
import { STATUS, CHAR_TYPES } from "@/lib/constants";
import Radar from "@/components/character/Radar";
import FaceScan from "@/components/character/FaceScan";
import BBContent from "@/components/bbcode/BBContent";

async function Sheet({ params }: { params: Promise<{ id: string }> }) {
  const cid = Number((await params).id);
  if (!Number.isInteger(cid)) notFound();
  const [row] = await db
    .select({ c: schema.characters, g: schema.guilds, owner: schema.users.username })
    .from(schema.characters)
    .innerJoin(schema.users, eq(schema.users.id, schema.characters.userId))
    .leftJoin(schema.guilds, eq(schema.guilds.id, schema.characters.guildId))
    .where(eq(schema.characters.id, cid))
    .limit(1);
  if (!row) notFound();

  const { c, g, owner } = row;
  const own = (await getSession())?.uid === c.userId;
  const st = STATUS[c.status];
  const kv: [string, string | number | null][] = [
    ["BIRTH", c.birthday], ["AGE", c.age], ["HEIGHT/WEIGHT", c.heightWeight], ["BLOOD", c.bloodType],
    ["MBTI", c.mbti], ["LOCATION", c.homeText], ["PLAYER", owner],
  ];
  const portrait = c.imageMainUrl
    ? `url("${c.imageMainUrl}") 50% 4%/cover`
    : `linear-gradient(135deg, ${c.colorPrimary}88, ${c.colorBg})`;

  return (
    <>
      <div className="box" style={{ borderColor: c.colorPrimary }}>
        {own && <Link href={`/characters/${c.id}/edit`} className="mini" style={{ float: "right", padding: "3px 10px", border: "1px solid var(--cy)" }}>✎ แก้ไขตัวละคร</Link>}
        <div className="tag" style={{ color: c.colorPrimary }}>// CHARACTER FILE · ID {String(c.id).padStart(3, "0")}166</div>
        <div className="head">
          <h1 style={{ font: "700 38px var(--font-jp)", color: "#fff", textShadow: `0 0 14px ${c.colorPrimary}` }}>{c.nameJp}</h1>
          <b style={{ fontSize: 22, color: c.colorPrimary }}>RANK {c.rank}</b>
          <span className="sb" style={{ ["--sc" as string]: st.color }}>{st.label}</span>
          {g && <span className="tag" style={{ color: g.color }}>{g.name}</span>}
        </div>
        <div className="mut">{c.firstName} {c.lastName} · {CHAR_TYPES[c.type]} · {c.className ?? "-"}</div>
      </div>

      <div className="cg">
        {/* คอลัมน์ซ้าย: ภาพตัวละคร + กล่อง BIOMETRIC (สแกนหน้า) */}
        <div>
          <div className="box" style={{ padding: 8 }}>
            <div className="av" style={{ width: "100%", height: 240, margin: 0, position: "relative", background: portrait }}>
              <span style={{ position: "absolute", right: 8, bottom: 2, font: "700 60px var(--font-jp)", color: c.colorPrimary, opacity: 0.5 }}>
                {Array.from(c.nameJp)[0]}
              </span>
            </div>
          </div>
          <div className="box">
            <div className="tag">BIOMETRIC</div>
            <FaceScan url={c.faceUrl} color={c.colorPrimary} id={c.id} />
          </div>
        </div>

        <div>
          <div className="box">
            <div className="tag">STATUS</div>
            <div className="two">
              <Radar stats={c.stats} color={c.colorPrimary} />
              <div>{kv.map(([k, v]) => <div key={k} className="kv"><b>{k}</b><span>{v ?? "—"}</span></div>)}</div>
            </div>
          </div>
          <div className="box">
            <div className="tag">{c.type === "esper" ? "TALENT · ทาเล้นท์" : "ABILITY · โซลลิงก์"}</div>
            <h3>{c.abilityName ?? "—"}</h3>
            <p>{c.abilityDesc}</p>
            <div className="tag">{c.type === "esper" ? "DOOM LEVEL" : "SYNC LOAD"} {c.doomLevel}%</div>
            <div className="gg"><i style={{ width: `${c.doomLevel}%` }} /></div>
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="box"><div className="tag">QUOTE</div><p>{c.quote ?? "—"}</p>
          <div className="tag">PERSONALITY</div>{c.traits.length ? c.traits.map((t) => <span key={t} className="chip">{t}</span>) : "—"}</div>
        <div className="box"><div className="tag">BACKGROUND</div>{c.story ? <BBContent text={c.story} /> : <p>—</p>}</div>
        <div className="box"><div className="tag">RELATIONSHIPS</div>{c.ties.length ? c.ties.map((t, i) => <p key={i}>{t}</p>) : <p>—</p>}</div>
      </div>
    </>
  );
}

export default function CharacterPage(props: PageProps<"/characters/[id]">) {
  return (
    <main>
      <Suspense fallback={<div className="mut">กำลังโหลด...</div>}>
        <Sheet params={props.params} />
      </Suspense>
    </main>
  );
}