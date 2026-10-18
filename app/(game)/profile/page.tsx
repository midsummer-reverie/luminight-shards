import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/session";
import { createCharacter } from "@/actions/characters";
import { CHAR_TYPES, STATUS } from "@/lib/constants";
import Avatar from "@/components/character/Avatar";

async function MyCharacters() {
  const s = await getSession();
  if (!s) redirect("/login");
  const rows = await db
    .select({ c: schema.characters, guild: schema.guilds.name })
    .from(schema.characters)
    .leftJoin(schema.guilds, eq(schema.guilds.id, schema.characters.guildId))
    .where(eq(schema.characters.userId, s.uid))
    .orderBy(asc(schema.characters.id));

  return (
    <>
      {(["esper", "guide"] as const).map((type) => {
        const list = rows.filter((r) => r.c.type === type);
        return (
          <section key={type}>
            <div className="tag" style={{ marginTop: 14 }}>
              // {CHAR_TYPES[type]} · {type.toUpperCase()} ({list.length})
              <form action={createCharacter.bind(null, type)} style={{ display: "inline" }}>
                <button className="mini" style={{ marginLeft: 12 }}>+ สร้างใหม่</button>
              </form>
            </div>
            <div className="grid" style={{ marginTop: 8 }}>
              {list.map(({ c, guild }) => (
                <Link key={c.id} href={`/characters/${c.id}`} className="card" style={{ borderColor: `${c.colorPrimary}99` }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Avatar url={c.faceUrl ?? c.imageMainUrl} color={c.colorPrimary} />
                    <div>
                      <b style={{ font: "700 18px var(--font-jp)" }}>{c.nameJp}</b>{" "}
                      <span style={{ color: c.colorPrimary }}>{c.rank}</span>
                      <div className="mut">{c.firstName} · {c.className ?? "-"}</div>
                      <div className="mut">{guild ?? "ไม่มีกิลด์"}</div>
                      <span className="sb" style={{ ["--sc" as string]: STATUS[c.status].color }}>{STATUS[c.status].label}</span>
                    </div>
                  </div>
                </Link>
              ))}
              {list.length === 0 && <div className="mut">— ยังไม่มี —</div>}
            </div>
          </section>
        );
      })}
    </>
  );
}

export default function ProfilePage() {
  return (
    <main>
      <div className="tag">// MY PROFILE</div>
      <h2>ตัวละครของฉัน</h2>
      <Suspense fallback={<div className="mut">กำลังโหลด...</div>}>
        <MyCharacters />
      </Suspense>
    </main>
  );
}