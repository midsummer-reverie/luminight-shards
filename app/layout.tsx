// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import CanvasFX from "@/components/CanvasFX";
import GlobalFX from "@/components/GlobalFX";

export const metadata: Metadata = {
  title: "Luminight Shards",
  description: "Guideverse RP",
  icons: {
    icon: "/LMNLOGO.png",
    shortcut: "/icon.png",
    apple: "/LMNLOGO.png",
  },
};

const GOOGLE_SANS = "https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght,GRAD@0,17..18,400..700,-50..200;1,17..18,400..700,-50..200&display=swap";
const EXTRA = "https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=Noto+Sans+JP:wght@700&family=Noto+Sans+Thai:wght@400;600&display=swap";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={GOOGLE_SANS} />
        <link rel="stylesheet" href={EXTRA} />
      </head>
      <body>
        {/* เอฟเฟกต์แคนวาสและ Glow พื้นหลัง */}
        <CanvasFX />
        <GlobalFX />
        
        {/* เนื้อหาหน้าเว็บหลักทั้งหมดจะถูกเรนเดอร์ผ่านตรงนี้โดยไม่มี main ซ้อนทับกัน */}
        {children}

        {/* แถบตัวหนังสือวิ่งด้านล่างสุด (Ticker Bar) */}
        <div id="tk">
          <div>
            ⚠ WARNING // 光夜の欠片 DETECTED &nbsp;·&nbsp; ESPER SYNC 78% &nbsp;·&nbsp; 新星市 SECTOR 7 BLACKOUT &nbsp;·&nbsp; GUIDE ONLINE &nbsp;·&nbsp; ERROR 404: SUNLIGHT NOT FOUND &nbsp;·&nbsp; I WILL CONTINUE &nbsp;·&nbsp; 
            ⚠ WARNING // 光夜の欠片 DETECTED &nbsp;·&nbsp; ESPER SYNC 78% &nbsp;·&nbsp; 新星市 SECTOR 7 BLACKOUT &nbsp;·&nbsp; GUIDE ONLINE &nbsp;·&nbsp; ERROR 404: SUNLIGHT NOT FOUND &nbsp;·&nbsp; I WILL CONTINUE &nbsp;·&nbsp;
          </div>
        </div>
      </body>
    </html>
  );
}