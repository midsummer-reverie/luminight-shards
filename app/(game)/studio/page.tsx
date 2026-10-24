import { Suspense } from "react";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import StudioClient from "./StudioClient";

async function StudioLoader() {
  const session = await getSession();
  const currentUserId = session?.userId ? Number(session.userId) : 1;

  let templates: any[] = [];
  let characters: any[] = [];
  let savedCodes: any[] = [];
  let isAdmin = false;

  try {
    if (currentUserId) {
      const [currentUser] = await db
        .select({ role: schema.users.role })
        .from(schema.users)
        .where(eq(schema.users.id, currentUserId))
        .limit(1);

      isAdmin = currentUser?.role === "admin";
    }

    templates = await db.select().from(schema.templates).orderBy(schema.templates.id);
    
    characters = await db
      .select()
      .from(schema.characters)
      .where(eq(schema.characters.userId, currentUserId));

    if (schema.userCodes) {
      savedCodes = await db
        .select()
        .from(schema.userCodes)
        .where(eq(schema.userCodes.userId, currentUserId));
    }
  } catch (error) {
    console.error("🚨 [Studio DB Error]:", error);
  }

  return (
    <StudioClient 
      initialTemplates={templates} 
      initialCharacters={characters} 
      initialSavedCodes={savedCodes}
      isAdmin={isAdmin} 
    />
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center", color: "#a78bfa" }}>กำลังโหลดระบบสตูดิโอ...</div>}>
      <StudioLoader />
    </Suspense>
  );
}