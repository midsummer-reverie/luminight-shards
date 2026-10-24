// app/(game)/guilds/new/page.tsx
import GuildForm from "./GuildForm";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { db, schema } from "@/db";
import { isNull } from "drizzle-orm";

async function NewGuildContent() {
  const session = await getSession();
  if (!session) redirect("/guilds");

  // 🟢 ดึงตัวละครที่ยังไม่มีกิลด์ มาให้เลือกติ๊กตั้งแต่ตอนสร้าง
  const availableChars = await db
    .select({
      id: schema.characters.id,
      firstName: schema.characters.firstName,
      lastName: schema.characters.lastName,
      rank: schema.characters.rank,
    })
    .from(schema.characters)
    .where(isNull(schema.characters.guildId));

  return <GuildForm availableChars={availableChars} />;
}

export default function NewGuildPage() {
  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "30px 20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link href="/guilds" style={{ fontSize: "12px", color: "var(--cy)", textDecoration: "none" }}>
          ← กลับสู่หน้ารวมกิลด์
        </Link>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <div className="tag">// REGISTRATION</div>
        <h2 style={{ fontSize: "28px", margin: 0 }}>ลงทะเบียนกิลด์ใหม่</h2>
      </div>

      <Suspense fallback={<div className="mut">กำลังโหลดฟอร์ม...</div>}>
        <NewGuildContent />
      </Suspense>
    </main>
  );
}