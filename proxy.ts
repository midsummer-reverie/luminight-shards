import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/token";

// Next.js 16: proxy.ts (เดิมคือ middleware.ts) — ไม่ล็อกอิน = ไม่เห็นเว็บ
export function proxy(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const ok = !!token && !!verifyToken(token);
  const { pathname } = req.nextUrl;

  if (!ok && pathname !== "/login") return NextResponse.redirect(new URL("/login", req.url));
  if (ok && pathname === "/login") return NextResponse.redirect(new URL("/", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"] };