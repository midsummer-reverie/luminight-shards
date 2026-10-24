// app/(game)/profile/page.tsx
import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

async function RedirectContent() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  } else {
    redirect(`/profile/${session.userId}`);
  }
  return null; // 🟢 ใส่บรรทัดนี้เพิ่มครับ
}

export default function ProfileRedirect() {
  return (
    <Suspense fallback={<div className="mut">กำลังโหลดโปรไฟล์...</div>}>
      <RedirectContent />
    </Suspense>
  );
}