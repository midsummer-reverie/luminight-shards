// components/layout/NavLinks.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./navItems";

export default function NavLinks() {
  const path = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* ปุ่มแฮมเบอร์เกอร์ (แสดงเฉพาะจอมือถือ) */}
      <button 
        className="hamburger-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* เมนูนำทาง (จอมือถือจะถูกซ่อน และเลื่อนกางลงมาด้านล่างเมื่อกดเปิด) */}
      <nav className={isOpen ? "open" : ""}>
        {NAV_ITEMS.map(([href, label]) => (
          <Link 
            key={href} 
            href={href} 
            onClick={() => setIsOpen(false)} // กดเลือกเมนูแล้วให้ปิดอัตโนมัติ
            className={(href === "/" ? path === "/" : path.startsWith(href)) ? "on" : ""}
          >
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}