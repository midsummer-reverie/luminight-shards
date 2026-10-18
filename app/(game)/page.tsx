import Link from "next/link";

// TODO: แผนที่ SVG ย่านต่าง ๆ จะย้ายมาที่นี่
export default function HomePage() {
  return (
    <main>
      <div className="box">
        <div className="tag">// 新星市 · TACTICAL MAP</div>
        <h2>แผนที่เมือง</h2>
        <p className="mut">กำลังย้ายแผนที่จากต้นแบบมาที่นี่</p>
        <Link href="/forums">ไปที่หน้ารวมฟอรั่ม →</Link>
      </div>
    </main>
  );
}