// app/(game)/profile/page.tsx
import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

async function RedirectContent() {
  const s = await getSession();
  if (!s || !s.userId) redirect("/login");

  redirect(`/profile/${s.userId}`);
}

export default function ProfileRedirect() {
  return (
    <Suspense fallback={<div className="mut">กำลังโหลดโปรไฟล์...</div>}>
      <RedirectContent />
    </Suspense>
  );
}