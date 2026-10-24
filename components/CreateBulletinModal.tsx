"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // 🟢 Import createPortal เพิ่มเติม
import { createBulletin } from "@/actions/bulletins"; // หรือตาม Path ที่คุณใช้อยู่

const PRESET_TAGS = [
  { tag: "ประกาศ", color: "#ff5f6f" },
  { tag: "ข่าวลือ", color: "#ffd35f" },
  { tag: "คำเตือน", color: "#ff9f5f" },
  { tag: "ข่าวสาร", color: "#38c8ff" },
];

export default function CreateBulletinModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [tag, setTag] = useState("ประกาศ");
  const [color, setColor] = useState("#ff5f6f");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  // ป้องกันการยิง Portal ในฝั่ง Server-side Rendering (SSR)
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectPreset = (pTag: string, pColor: string) => {
    setTag(pTag);
    setColor(pColor);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      const res = await createBulletin(formData);
      
      if (res?.success) {
        setIsOpen(false);
      } else {
        setError(res?.error || "เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
    }
  };

  // โครงสร้างหน้าตา Modal
  const modalContent = isOpen ? (
    <div 
      className="md" 
      style={{ 
        position: "fixed", 
        inset: 0, 
        zIndex: 99999, // 🟢 ดัน z-index สูงสุดเพื่อทับทุก Element บนหน้าจอ
        background: "rgba(8, 5, 10, 0.85)", 
        backdropFilter: "blur(6px)", 
        display: "grid", 
        placeItems: "center" 
      }}
    >
      <div className="gb box" style={{ width: "min(460px, 92vw)", padding: "24px", position: "relative", border: "1px solid var(--cy)", boxShadow: "0 0 35px rgba(255, 95, 168, 0.3)", background: "#130c15" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div className="tag" style={{ margin: 0 }}>// CREATE CITY BULLETIN</div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            style={{ background: "none", border: "none", color: "#888", fontSize: "16px", cursor: "pointer", padding: "0 4px" }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {error && <div className="err" style={{ color: "#ff5f6f", fontSize: "12px" }}>{error}</div>}

          <div className="fl" style={{ margin: 0 }}>
            <label style={{ fontSize: "11px", color: "var(--mut)" }}>ประเภทข่าวสาร / แท็ก</label>
            <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
              {PRESET_TAGS.map((p) => (
                <button
                  key={p.tag}
                  type="button"
                  onClick={() => handleSelectPreset(p.tag, p.color)}
                  style={{
                    padding: "3px 8px",
                    fontSize: "11px",
                    background: tag === p.tag ? p.color : "transparent",
                    color: tag === p.tag ? "#000" : p.color,
                    border: `1px solid ${p.color}`,
                    borderRadius: "3px",
                  }}
                >
                  {p.tag}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px", alignItems: "flex-end" }}>
            <div className="fl" style={{ margin: 0 }}>
              <label style={{ fontSize: "11px", color: "var(--mut)" }}>ชื่อแท็กแบบ Custom</label>
              <input
                name="tag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                required
                style={{ width: "100%", marginTop: "4px" }}
              />
            </div>
            <div className="fl" style={{ margin: 0 }}>
              <label style={{ fontSize: "11px", color: "var(--mut)" }}>สีประจำแท็ก</label>
              <input
                type="color"
                name="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: "44px", height: "36px", padding: "2px", cursor: "pointer", marginTop: "4px" }}
              />
            </div>
          </div>

          <div className="fl" style={{ margin: 0 }}>
            <label style={{ fontSize: "11px", color: "var(--mut)" }}>ข้อความประกาศหลัก</label>
            <textarea
              name="title"
              required
              placeholder="เช่น ศูนย์บัญชาการประกาศเคอร์ฟิว 22:00..."
              rows={3}
              style={{ width: "100%", marginTop: "4px" }}
            />
          </div>

          <div className="fl" style={{ margin: 0 }}>
            <label style={{ fontSize: "11px", color: "var(--mut)" }}>ข้อความฮุคกระตุ้นโรลเพลย์ (Hook)</label>
            <input
              name="hook"
              placeholder="เช่น ฮุค: ใครฝ่าเคอร์ฟิวแล้วไปเห็นสิ่งที่ไม่ควรเห็น?"
              style={{ width: "100%", marginTop: "4px" }}
            />
          </div>

          <div className="fl" style={{ margin: 0 }}>
            <label style={{ fontSize: "11px", color: "var(--mut)" }}>ลิงก์ปลายทาง (ถ้ามี)</label>
            <input
              name="linkUrl"
              placeholder="เช่น /forums/l1/10 หรือ https://..."
              style={{ width: "100%", marginTop: "4px" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ background: "transparent", color: "var(--mut)", border: "1px solid var(--line)", padding: "6px 14px" }}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ background: "var(--cy)", color: "#1c0613", padding: "6px 16px" }}
            >
              {loading ? "กำลังบันทึก..." : "โพสต์ประกาศ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mini"
        style={{
          fontSize: "11px",
          color: "var(--cy)",
          border: "1px solid var(--cy)",
          background: "rgba(255, 95, 168, 0.1)",
          cursor: "pointer",
          padding: "2px 8px",
          borderRadius: "3px",
        }}
      >
        + เพิ่มประกาศ
      </button>

      {/* 🟢 ใช้ createPortal ยิงตัว Modal ไปติดที่ document.body โดยตรงเพื่อหลุดจากกล่องแม่ */}
      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}