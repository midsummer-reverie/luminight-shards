// app/(game)/guilds/[id]/edit/page.tsx
import { db, schema } from "@/db";
import { eq, isNull, or } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";
import GuildForm from "../../new/GuildForm";
import Link from "next/link";
import GuildMemberRoleEditor from "../GuildMemberRoleEditor";
import GuildRolesOrderManager from "./GuildRolesOrderManager";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function EditGuildContent({ params }: PageProps) {
  const { id } = await params;
  const guildId = Number(id);
  if (isNaN(guildId)) return notFound();

  const session = await getSession();
  if (!session) redirect("/guilds");

  const [guild] = await db.select().from(schema.guilds).where(eq(schema.guilds.id, guildId));
  if (!guild) return notFound();

  const themeColor = guild.color || "#ff5fa8";
  const rolesOrder = (guild.guildRolesOrder as string[]) || [];
  const isAdmin = session.role === "admin";
  const isOwner = guild.createdByUserId === Number(session.userId);

  if (!isAdmin && !isOwner) {
    redirect("/guilds");
  }

  const members = await db
    .select({
      id: schema.characters.id,
      firstName: schema.characters.firstName,
      lastName: schema.characters.lastName,
      rank: schema.characters.rank,
      guildTitle: schema.characters.guildTitle,
      imageMainUrl: schema.characters.imageMainUrl,
    })
    .from(schema.characters)
    .where(eq(schema.characters.guildId, guildId));

  const availableChars = await db
    .select({
      id: schema.characters.id,
      firstName: schema.characters.firstName,
      lastName: schema.characters.lastName,
      rank: schema.characters.rank,
    })
    .from(schema.characters)
    .where(or(isNull(schema.characters.guildId), eq(schema.characters.guildId, guildId)));

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "30px 20px 96px", ["--cy" as string]: themeColor }}>
      <div style={{ marginBottom: "20px" }}>
        <Link href={`/guilds/${guild.id}`} style={{ fontSize: "12px", color: "var(--cy)", textDecoration: "none" }}>
          ← กลับไปหน้าข้อมูลกิลด์
        </Link>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <div className="tag" style={{ color: themeColor }}>// MANAGEMENT PANEL</div>
        <h2 style={{ fontSize: "28px", margin: 0, color: "#fff" }}>ตั้งค่าและจัดการกิลด์: {guild.name}</h2>
      </div>

      <GuildForm initialData={guild} members={members} availableChars={availableChars} />
      
      <GuildRolesOrderManager guildId={guildId} initialRoles={rolesOrder} themeColor={themeColor} />

      <div className="box" style={{ marginTop: "24px", borderColor: `${themeColor}66`, background: "#0c0710" }}>
        <div className="tag" style={{ color: themeColor }}>// MEMBER ROLES & TITLES</div>
        <h3 style={{ margin: "4px 0 16px" }}>กำหนดตำแหน่งสมาชิกในกิลด์</h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {members.map(m => (
            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(0,0,0,0.4)", border: `1px solid ${themeColor}33`, flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", overflow: "hidden", border: `1px solid ${themeColor}`, background: "#000", flexShrink: 0 }}>
                  <img src={m.imageMainUrl || "https://placehold.co/100x100?text=No+Image"} alt={m.firstName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div>
                  <b style={{ color: "#fff" }}>{m.lastName || ""} {m.firstName || ""}</b>
                  <span className="mut" style={{ marginLeft: "8px", fontSize: "12px" }}>Rank {m.rank}</span>
                </div>
              </div>

              <div style={{ width: "240px", maxWidth: "100%" }}>
                <GuildMemberRoleEditor 
                  characterId={m.id} 
                  currentTitle={m.guildTitle || "สมาชิก"} 
                  themeColor={themeColor} 
                  rolesOrder={rolesOrder} 
                />
              </div>
            </div>
          ))}

          {members.length === 0 && (
            <div className="mut" style={{ textAlign: "center", padding: "20px" }}>— ยังไม่มีสมาชิกในกิลด์ —</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EditGuildPage({ params }: PageProps) {
  return (
    <main>
      <Suspense fallback={<div className="mut" style={{ textAlign: "center", padding: "40px" }}>กำลังโหลดข้อมูลการตั้งค่า...</div>}>
        <EditGuildContent params={params} />
      </Suspense>
    </main>
  );
}