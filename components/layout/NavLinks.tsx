"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./navItems";

export default function NavLinks() {
  const path = usePathname();
  return (
    <nav>
      {NAV_ITEMS.map(([href, label]) => (
        <Link key={href} href={href} className={(href === "/" ? path === "/" : path.startsWith(href)) ? "on" : ""}>
          {label}
        </Link>
      ))}
    </nav>
  );
}