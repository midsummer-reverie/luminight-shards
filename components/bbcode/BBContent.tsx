// components/BBContent.tsx
import { renderBB } from "@/lib/bbcode";

interface BBContentProps {
  content: string;
  className?: string;
}

// ฟังก์ชันถอดรหัส HTML Entity กลับมาให้สมบูรณ์
function fullUnescape(str: string): string {
  if (!str) return "";
  let prev = "";
  let curr = str;
  while (prev !== curr) {
    prev = curr;
    curr = curr
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&amp;/g, "&");
  }
  return curr;
}

export default function BBContent({ content, className = "" }: BBContentProps) {
  if (!content) return null;

  // 1. ถอดรหัสและตัดช่องว่างหัวท้ายออก
  const decoded = fullUnescape(content.trim());

  // 2. 🟢 เช็คแบบยืดหยุ่นและครอบคลุมทุกกรณีของแท็ก HTML หรือการ์ดเกม
  const trimmedLower = decoded.toLowerCase();
  const isHtml = 
    trimmedLower.startsWith("<") || 
    trimmedLower.includes("<div") ||
    trimmedLower.includes("<span") ||
    trimmedLower.includes("lmnloc-card") || 
    trimmedLower.includes("lmnsrp-box") || 
    trimmedLower.includes("class=\"lmn") ||
    trimmedLower.includes("class='lmn") ||
    trimmedLower.includes("style=");

  // 3. ถ้าเป็น HTML ให้เรนเดอร์ผ่าน dangerouslySetInnerHTML ทันที
  const htmlToRender = isHtml ? decoded : renderBB(content);

  return (
    <div
      className={`bb-reader-area ${className}`}
      style={{ wordBreak: "break-word", lineHeight: "1.7" }}
      dangerouslySetInnerHTML={{ __html: htmlToRender }}
    />
  );
}