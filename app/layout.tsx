import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "LUMINIGHT SHARDS", description: "Guide Verse community roleplay" };

const GOOGLE_SANS =
  "https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght,GRAD@0,17..18,400..700,-50..200;1,17..18,400..700,-50..200&display=swap";
// Chakra Petch = หัวข้อ HUD, Noto Sans JP = คันจิ, Noto Sans Thai = fallback ถ้า Google Sans ไม่มีตัวอักษรไทย
const EXTRA =
  "https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=Noto+Sans+JP:wght@700&family=Noto+Sans+Thai:wght@400;600&display=swap";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={GOOGLE_SANS} />
        <link rel="stylesheet" href={EXTRA} />
      </head>
      <body>{children}</body>
    </html>
  );
}