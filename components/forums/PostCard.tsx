import Link from "next/link";
import { renderBB } from "@/lib/bbcode";

interface PostCardProps {
  post: {
    id: number;
    content: string; // เนื้อหาที่ถูกสวมโค้ดสตูดิโอมาแล้ว
    createdAt: Date;
  };
  author: {
    username: string;
    avatarUrl?: string;
  };
  character?: {
    name: string;
    slug: string;
    verticalBannerUrl?: string; // 🖼️ แบนเนอร์แนวตั้ง
    themeColor?: string;
  };
}

export default function PostCard({ post, author, character }: PostCardProps) {
  const theme = character?.themeColor || "#38c8ff";

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px", background: "#0a0a0e", border: `1px solid ${theme}44`, marginBottom: "20px" }}>
      
      {/* 🟢 คอลัมน์ซ้าย: ข้อมูลผู้โพสต์และตัวละคร */}
      <div style={{ width: "200px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
        
        {/* รูปแบนเนอร์แนวตั้ง */}
        <div style={{ width: "200px", height: "500px", background: "#000", border: `1px solid ${theme}`, borderRadius: "4px", overflow: "hidden" }}>
          {character?.verticalBannerUrl ? (
            <img 
              src={character.verticalBannerUrl} 
              alt={character.name} 
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#444" }}>
              NO BANNER
            </div>
          )}
        </div>

        {/* ลิงก์โปรไฟล์ตัวละคร */}
        {character && (
          <Link href={`/characters/${character.slug}`} style={{ fontSize: "16px", fontWeight: "bold", color: theme, textDecoration: "none", textAlign: "center", textShadow: `0 0 8px ${theme}88` }}>
            {character.name}
          </Link>
        )}

        {/* ลิงก์โปรไฟล์ผู้เล่น (User) */}
        <Link href={`/users/${author.username}`} style={{ fontSize: "12px", color: "#888", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
          👤 @{author.username}
        </Link>
      </div>

      {/* 🟢 คอลัมน์ขวา: เนื้อหาโพสต์ (ที่สวมเทมเพลตมาแล้ว) */}
      <div style={{ flex: 1, minWidth: 0, color: "#d4d4d8", fontSize: "14px", lineHeight: "1.8" }}>
        {/* ใช้ dangerouslySetInnerHTML เพราะเนื้อหาถูกแปลงเป็น HTML ตั้งแต่ตอนกด Reply แล้ว */}
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>

    </div>
  );
}