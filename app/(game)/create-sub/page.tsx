import { Suspense } from "react";
import { connection } from "next/server";
import { eq, or, asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import CreateSubForm from "./CreateSubForm";

interface PageProps {
  searchParams: Promise<{ parent?: string }>;
}

async function CreateSubContent({ searchParams }: { searchParams: Promise<{ parent?: string }> }) {
  await connection();

  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const parentQuery = resolvedSearchParams?.parent ?? "";

  let parentLocation = null;

  if (parentQuery) {
    try {
      const parentNum = Number(parentQuery);
      const isNum = !isNaN(parentNum);

      const [loc] = await db
        .select({
          id: schema.locations.id,
          name: schema.locations.name,
          nameEn: schema.locations.nameEn,
        })
        .from(schema.locations)
        .where(
          isNum
            ? eq(schema.locations.id, parentNum)
            : or(
                eq(schema.locations.slug, parentQuery),
                eq(schema.locations.id, Number(parentQuery.replace(/\D/g, "")) || 0)
              )
        )
        .limit(1);

      parentLocation = loc ?? null;
    } catch (e) {
      console.error("Failed to fetch parent location:", e);
    }
  }

  // 🟢 ดึงตัวละครทั้งหมด เรียงจาก A-Z ตาม firstName ภาษาอังกฤษ
  const allCharacters = await db
    .select({
      id: schema.characters.id,
      firstName: schema.characters.firstName,
      nameJp: schema.characters.nameJp,
      faceUrl: schema.characters.faceUrl,
    })
    .from(schema.characters)
    .orderBy(asc(schema.characters.firstName));

  return (
    <CreateSubForm
      parentLocation={parentLocation}
      parentQuery={parentQuery}
      allCharacters={allCharacters}
    />
  );
}

export default function NewSubForumPage({ searchParams }: PageProps) {
  return (
    <main style={{ paddingBottom: "80px", minHeight: "calc(100vh - 120px)" }}>
      <Suspense fallback={<div className="mut" style={{ padding: "40px", textAlign: "center" }}>กำลังโหลดฟอร์มสร้างเขตส่วนตัว...</div>}>
        <CreateSubContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}