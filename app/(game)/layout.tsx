import { Suspense } from "react";
import Link from "next/link";
import NavLinks from "@/components/layout/NavLinks";
import UserBar from "@/components/layout/UserBar";
import { NAV_ITEMS } from "@/components/layout/navItems";
import GlobalFX from "@/components/GlobalFX";
import "@/app/globals.css";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header>
        <div className="logo">LUMINIGHT <i>//</i> SHARDS</div>
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

      {/* ใช้คลาส pg ตามเดิมโดยไม่ต้องพึ่ง use client ป้องกัน Error จาก session.ts */}
      <main className="pg" style={{ maxWidth: "1020px", margin: "0 auto", width: "100%", padding: "0 16px" }}>
        {children}
      </main>
    </>
  );
}