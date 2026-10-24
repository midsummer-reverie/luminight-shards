import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/session";
import EditSubForumForm from "./EditSubForumForm";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function EditFormContainer({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;

  // 1. ตรวจสอบ Session
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // 2. ดึงข้อมูลฟอรั่มที่จะแก้ไข
  const [forum] = await db
    .select()
    .from(schema.locations)
    .where(eq(schema.locations.slug, slug))
    .limit(1);

  if (!forum) notFound();

  // 3. ตรวจสอบสิทธิ์ (ต้องเป็น Creator หรือ Admin)
  const isAdmin = session.role === "admin";
  const isCreator = forum.createdByUserId === Number(session.userId);
  if (!isAdmin && !isCreator) {
    redirect(`/forums/${slug}`);
  }

  // 4. ดึงข้อมูล parent location (ถ้ามี)
  let parentLocation = null;
  if (forum.parentId) {
    const [parent] = await db
      .select({
        id: schema.locations.id,
        name: schema.locations.name,
        nameEn: schema.locations.nameEn,
      })
      .from(schema.locations)
      .where(eq(schema.locations.id, forum.parentId))
      .limit(1);
    parentLocation = parent ?? null;
  }

  // 5. ดึงรายชื่อตัวละครทั้งหมดเรียง A-Z
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
    <EditSubForumForm
      forum={forum}
      parentLocation={parentLocation}
      allCharacters={allCharacters}
    />
  );
}

export default function EditSubForumPage({ params }: PageProps) {
  return (
    <main style={{ paddingBottom: "100px" }}>
      <Suspense fallback={<div className="mut" style={{ padding: "40px", textAlign: "center" }}>กำลังโหลดข้อมูลฟอรั่ม...</div>}>
        <EditFormContainer params={params} />
      </Suspense>
    </main>
  );
}