// app/(game)/forums/new/page.tsx
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import Link from "next/link";
import { Suspense } from "react";

// 🟢 Server Action ดึงออกมาไว้นอก Component
async function createForum(formData: FormData) {
  "use server";
  const session = await getSession();
  if (session?.role !== "admin") return;

  const slug = formData.get("slug") as string;
  const name = formData.get("name") as string;
  const nameEn = formData.get("nameEn") as string;
  const nameJp = formData.get("nameJp") as string;
  const themeColor = formData.get("themeColor") as string;
  const description = formData.get("description") as string;

  await db.insert(schema.locations).values({
    slug,
    name,
    nameEn,
    nameJp,
    themeColor,
    description,
    danger: 0,
    isMainMapZone: true,
    sortOrder: 0,
    createdByUserId: Number(session.userId),
    residentChars: [],
  });

  redirect(`/forums/${slug}`);
}

// 🟢 แยกส่วนที่ต้องเช็คสิทธิ์ Admin ออกมาเป็นอีก Component
async function AdminGuardAndForm() {
  const session = await getSession();
  
  if (session?.role !== "admin") {
    redirect("/forums");
  }

  return (
    <form 
      action={createForum} 
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: "16px", 
        background: "#0e0910", 
        padding: "24px", 
        border: "1px solid #ff5fa844",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
      }}
    >
      <div>
        <label style={{ display: "block", fontSize: "12px", color: "#ff5fa8", marginBottom: "6px" }}>
          🔗 Slug (URL) *พิมพ์เล็ก ห้ามเว้นวรรค
        </label>
        <input type="text" name="slug" required placeholder="เช่น sector-8" style={{ width: "100%", padding: "10px", background: "#000", border: "1px solid #333", color: "#fff" }} />
      </div>

      <div>
        <label style={{ display: "block", fontSize: "12px", color: "#aaa", marginBottom: "6px" }}>
          🇹🇭 ชื่อเขตภาษาไทย
        </label>
        <input type="text" name="name" required style={{ width: "100%", padding: "10px", background: "#000", border: "1px solid #333", color: "#fff" }} />
      </div>

      <div>
        <label style={{ display: "block", fontSize: "12px", color: "#aaa", marginBottom: "6px" }}>
          🌐 ชื่อเขตภาษาอังกฤษ (Name EN)
        </label>
        <input type="text" name="nameEn" required style={{ width: "100%", padding: "10px", background: "#000", border: "1px solid #333", color: "#fff" }} />
      </div>

      <div>
        <label style={{ display: "block", fontSize: "12px", color: "#aaa", marginBottom: "6px" }}>
          🇯🇵 ชื่อเขตภาษาญี่ปุ่น (Name JP) - ถ้ามี
        </label>
        <input type="text" name="nameJp" style={{ width: "100%", padding: "10px", background: "#000", border: "1px solid #333", color: "#fff" }} />
      </div>

      <div>
        <label style={{ display: "block", fontSize: "12px", color: "#aaa", marginBottom: "6px" }}>
          🎨 สีธีม (Theme Color)
        </label>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input type="color" name="themeColor" defaultValue="#38c8ff" style={{ width: "50px", height: "34px", background: "#000", border: "1px solid #333", cursor: "pointer" }} />
          <span style={{ fontSize: "12px", color: "#666" }}>เลือกสีประจำเขต</span>
        </div>
      </div>

      <div>
        <label style={{ display: "block", fontSize: "12px", color: "#aaa", marginBottom: "6px" }}>
          📝 คำอธิบาย (Description)
        </label>
        <textarea name="description" rows={3} style={{ width: "100%", padding: "10px", background: "#000", border: "1px solid #333", color: "#fff", resize: "vertical" }}></textarea>
      </div>

      <button 
        type="submit" 
        style={{ 
          padding: "12px", 
          background: "#ff5fa8", 
          color: "#000", 
          fontWeight: "bold", 
          border: "none", 
          cursor: "pointer", 
          marginTop: "10px",
          fontSize: "14px"
        }}
      >
        บันทึกเขตหลักใหม่
      </button>
    </form>
  );
}

// 🟢 หน้าเพจหลักเป็นโครงสร้างเปล่าๆ และครอบฟอร์มด้วย Suspense
export default function CreateMainForumPage() {
  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px", fontFamily: "'Google Sans', sans-serif" }}>
      <Link href="/forums" style={{ color: "#aaa", textDecoration: "none", fontSize: "12px", marginBottom: "20px", display: "inline-block" }}>
        ← กลับหน้ารวมแผนที่เมือง
      </Link>
      
      <h2 style={{ color: "#fff", marginBottom: "20px" }}>
        <span style={{ color: "#ff5fa8" }}>+</span> สร้างเขตหลัก (Main District)
      </h2>

      <Suspense fallback={<div style={{ color: "#aaa", padding: "20px" }}>กำลังตรวจสอบสิทธิ์...</div>}>
        <AdminGuardAndForm />
      </Suspense>
    </div>
  );
}