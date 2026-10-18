import { Suspense } from "react";
import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";
import { db, schema } from "@/db";

// cacheComponents: ห้ามใช้ route segment config (revalidate / dynamic / fetchCache)
// ส่วนที่ดึง DB ต้องอยู่ใน <Suspense> (หรือครอบด้วย "use cache")

async function ForumList() {
  const { locations, threads } = schema;
  const rows = await db
    .select({
      id: locations.id,
      slug: locations.slug,
      name: locations.name,
      nameJp: locations.nameJp,
      description: locations.description,
      danger: locations.danger,
      threads: count(threads.id),
    })
    .from(locations)
    .leftJoin(threads, eq(threads.locationId, locations.id))
    .groupBy(locations.id)
    .orderBy(asc(locations.sortOrder));

  return (
    <div className="fgrid">
      {rows.map((l) => (
        <Link key={l.id} href={`/forums/${l.slug}`} className="fcard">
          <div className="fjp">{l.nameJp}</div>
          <h3>{l.name}</h3>
          <div>{l.description}</div>
          <div className="tag">
            {l.threads} กระทู้ · เสี่ยง {l.danger}%
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function ForumsPage() {
  return (
    <main>
      <div className="tag">// FORUM INDEX</div>
      <h2>หน้ารวมฟอรั่ม</h2>
      <Suspense fallback={<div className="mut">กำลังโหลดฟอรั่ม...</div>}>
        <ForumList />
      </Suspense>
    </main>
  );
}