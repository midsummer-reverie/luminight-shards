// app/(game)/forums/[slug]/[id]/edit/page.tsx
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/session";
import EditThreadClientForm from "./EditThreadClientForm";

interface PageProps {
  params: Promise<{ slug: string; id: string }>;
}

async function EditThreadLoader({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const threadId = Number(id);
  const session = await getSession();

  if (isNaN(threadId)) return notFound();

  if (!session?.userId) {
    redirect(`/forums/${slug}/${id}`);
  }

  // 1. ดึงข้อมูลกระทู้ พร้อม JOIN กับ locations 
  const result = await db
    .select({
      id: schema.threads.id,
      title: schema.threads.title,
      content: schema.threads.content,          // 🟢 สำคัญมาก: เก็บ HTML ที่ฝัง Metadata เอาไว้
      templateStyle: schema.threads.templateStyle,
      bannerUrl: schema.threads.bannerUrl,
      pinned: schema.threads.pinned,
      locked: schema.threads.locked,
      closed: schema.threads.closed,
      password: schema.threads.password,
      authorUserId: schema.threads.authorUserId,
      locationId: schema.threads.locationId,
      locationSlug: schema.locations.slug,
      locationName: schema.locations.name,
      locationThemeColor: schema.locations.themeColor,
    })
    .from(schema.threads)
    .innerJoin(schema.locations, eq(schema.threads.locationId, schema.locations.id))
    .where(eq(schema.threads.id, threadId));

  const thread = result[0];

  // เช็คให้แน่ใจว่าเจอข้อมูลกระทู้
  if (!thread || thread.locationSlug !== slug) {
    return notFound();
  }

  // 2. เช็คสิทธิ์การแก้ไข (เจ้าของโพสต์ หรือ Admin)
  const currentUserId = Number(session.userId);
  const isAuthor = currentUserId === thread.authorUserId;
  const isAdmin = session.role === "admin";

  if (!isAuthor && !isAdmin) {
    redirect(`/forums/${slug}/${id}`);
  }

  const locationData = {
    id: thread.locationId,
    name: thread.locationName,
    slug: thread.locationSlug,
    themeColor: thread.locationThemeColor,
  };

  return (
    <EditThreadClientForm 
      thread={thread} 
      location={locationData} 
      canPin={isAdmin} 
    />
  );
}

export default function EditThreadPage({ params }: PageProps) {
  return (
    <main style={{ padding: "20px 0" }}>
      <Suspense fallback={<div className="mut" style={{ textAlign: "center", padding: "40px" }}>กำลังโหลดข้อมูลสำหรับแก้ไข...</div>}>
        <EditThreadLoader params={params} />
      </Suspense>
    </main>
  );
}