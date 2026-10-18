import { Suspense } from "react";
import Link from "next/link";
import NavLinks from "@/components/layout/NavLinks";
import UserBar from "@/components/layout/UserBar";
import { NAV_ITEMS } from "@/components/layout/navItems";
// import "../characters.css"; // ถ้าใช้ไฟล์ CSS แยก ให้เปิดบรรทัดนี้ (ถ้าวาง CSS ใน globals.css แล้ว ไม่ต้อง)

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header>
        <div className="logo">LUMINIGHT <i>//</i> SHARDS</div>
        {/* usePathname() เป็นข้อมูลตอน request → ต้องอยู่ใน Suspense; fallback = เมนูเดียวกันแต่ยังไม่ไฮไลต์หน้าปัจจุบัน */}
        <Suspense
          fallback={
            <nav>
              {NAV_ITEMS.map(([href, label]) => (
                <Link key={href} href={href}>{label}</Link>
              ))}
            </nav>
          }
        >
          <NavLinks />
        </Suspense>
        <Suspense fallback={null}>
          <UserBar />
        </Suspense>
      </header>
      {children}
    </>
  );
}