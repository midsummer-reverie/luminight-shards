// app/(game)/forums/[slug]/new/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/session";
import NewThreadClientForm from "./NewThreadClientForm";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function NewThreadPageContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const session = await getSession();
  if (!session?.userId) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#ff5f6f" }}>
        กรุณาเข้าสู่ระบบก่อนสร้างกระทู้ใหม่
      </div>
    );
  }

  // ดึงข้อมูลย่านสถานที่
  const [location] = await db
    .select()
    .from(schema.locations)
    .where(eq(schema.locations.slug, slug));

  if (!location) return notFound();

  return <NewThreadClientForm location={location} />;
}

export default function NewThreadPage({ params }: PageProps) {
  return (
    <main style={{ padding: "20px 0" }}>
      <Suspense fallback={<div className="mut">กำลังโหลดฟอร์มสร้างกระทู้...</div>}>
        <NewThreadPageContent params={params} />
      </Suspense>
    </main>
  );
}