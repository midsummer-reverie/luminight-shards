// app/(game)/guilds/new/GuildForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { saveGuildAction, updateGuildMemberAction } from "@/actions/guilds";
import { useRouter } from "next/navigation";

const ICONS: Record<string, string> = {
  eye: "M4 24C12 10 36 10 44 24 36 38 12 38 4 24Z M24 24m-7 0a7 7 0 1 0 14 0 7 7 0 1 0-14 0 M24 24m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0 M24 3V8M24 40V45",
  link: "M17 24m-11 0a11 11 0 1 0 22 0 11 11 0 1 0-22 0 M31 24m-11 0a11 11 0 1 0 22 0 11 11 0 1 0-22 0 M24 15V33",
  shield: "M24 4L42 10V24C42 34 34 41 24 45 14 41 6 34 6 24V10Z M24 12V38M14 21H34",
  hex: "M24 4L42 14V34L24 44 6 34V14Z M14 20L24 30 34 20M14 28L24 38 34 28",
  torii: "M4 10Q24 4 44 10M8 18H40M14 10V42M34 10V42 M20 26H28V34H20Z",
  star: "M24 4L29 18H44L32 27 36 42 24 33 12 42 16 27 4 18H19Z",
  flame: "M24 44C12 44 8 34 14 24C16 30 20 30 20 26C20 16 26 10 28 4C36 14 42 24 40 32C39 39 33 44 24 44Z",
  moon: "M32 6A19 19 0 1 0 42 32 15 15 0 0 1 32 6Z",
  crown: "M6 34L10 14 18 24 24 10 30 24 38 14 42 34Z M8 40H40",
  key: "M16 24m-9 0a9 9 0 1 0 18 0 9 9 0 1 0-18 0 M25 24H44M38 24V32M32 24V30"
};

export const GuildIconSvg = ({ iconKey, color }: { iconKey: string, color?: string }) => (
  <svg viewBox="0 0 48 48" width="1.1em" height="1.1em" fill="none" stroke={color || "currentColor"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-0.2em", filter: `drop-shadow(0 0 4px ${color || "currentColor"})` }}>
    <path d={ICONS[iconKey] || ICONS.star} />
  </svg>
);

export default function GuildForm({ initialData, members = [], availableChars = [] }: { initialData?: any, members?: any[], availableChars?: any[] }) {
  const [color, setColor] = useState(initialData?.color || "#ff5fa8");
  const [icon, setIcon] = useState(initialData?.icon || "star");
  const [selectedCharId, setSelectedCharId] = useState("");
  const router = useRouter();

  const handleAddMember = async (guildId: number) => {
    if (!selectedCharId) return;
    await updateGuildMemberAction(Number(selectedCharId), guildId);
    setSelectedCharId("");
    router.refresh();
  };

  const handleRemoveMember = async (charId: number) => {
    await updateGuildMemberAction(charId, null);
    router.refresh();
  };

  const unassigned = availableChars.filter(c => !members.some(m => m.id === c.id));

  return (
    <form action={async (formData) => {
      await saveGuildAction(formData);
    }} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {initialData && <input type="hidden" name="id" value={initialData.id} />}
      <input type="hidden" name="icon" value={icon} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px", alignItems: "start" }}>
        
        <div className="box" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", height: "100%" }}>
          <div className="tag">// GUILD INFO</div>
          <h3 style={{ margin: 0 }}>ข้อมูลพื้นฐานกิลด์</h3>

          <label className="fl">ชื่อกิลด์<input name="name" defaultValue={initialData?.name} required placeholder="เช่น สภาเอสเปอร์" /></label>
          <label className="fl">ชื่อภาษาอังกฤษ<input name="nameEn" defaultValue={initialData?.nameEn} placeholder="เช่น Esper Assembly" /></label>
          <label className="fl">คำขวัญ<input name="motto" defaultValue={initialData?.motto} placeholder="เช่น พลังต้องมีผู้ควบคุม" /></label>
          <label className="fl">รายละเอียด<textarea name="description" rows={5} defaultValue={initialData?.description} style={{ resize: "vertical" }}></textarea></label>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div className="box" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="tag">// STYLING & LOGO</div>
            <h3 style={{ margin: 0 }}>สีและสัญลักษณ์</h3>

            <label className="fl">สีประจำกิลด์
              <input type="color" name="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: "100%", height: "40px", padding: 0, cursor: "pointer" }} />
            </label>

            <label className="fl">URL โลโก้ (ลิงก์ภาพ)
              <input name="logoUrl" defaultValue={initialData?.logoUrl} placeholder="https://..." />
            </label>

            <div>
              <div className="mut" style={{ marginBottom: "8px" }}>ไอคอนสำรอง (ใช้เมื่อไม่มีลิงก์รูปภาพ)</div>
              <div className="icg" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", color }}>
                {Object.keys(ICONS).map(k => (
                  <button 
                    type="button" 
                    key={k} 
                    onClick={() => setIcon(k)} 
                    className={`icb ${k === icon ? "on" : ""}`}
                    style={k === icon ? { borderColor: color, color: color, boxShadow: `0 0 10px ${color}55` } : {}}
                  >
                    <GuildIconSvg iconKey={k} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="box" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="tag">// MEMBERS ({initialData ? members.length : 0})</div>
            <h3 style={{ margin: 0 }}>สมาชิกในสังกัด</h3>

            {initialData ? (
              <>
                <div style={{ display: "flex", gap: "8px" }}>
                  <select 
                    value={selectedCharId} 
                    onChange={e => setSelectedCharId(e.target.value)}
                    style={{ flex: 1, padding: "8px", background: "#0b060d", color: "#fff", border: "1px solid var(--line)" }}
                  >
                    <option value="">-- เลือกตัวละครเพื่อดึงเข้ากิลด์ --</option>
                    {unassigned.map(c => (
                      <option key={c.id} value={c.id}>{c.firstName} {c.lastName || ""} (Rank {c.rank})</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => handleAddMember(initialData.id)}>เพิ่ม</button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "200px", overflowY: "auto" }}>
                  {members.map(m => (
                    <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#0006", border: "1px solid var(--line)" }}>
                      <span style={{ fontSize: "13px" }}><b>{m.firstName} {m.lastName || ""}</b> (Rank {m.rank})</span>
                      <button type="button" onClick={() => handleRemoveMember(m.id)} style={{ background: "#ff5f6f", color: "#fff", padding: "2px 8px", fontSize: "11px" }}>เตะออก</button>
                    </div>
                  ))}
                  {members.length === 0 && <div className="mut" style={{ fontSize: "13px" }}>— ยังไม่มีสมาชิก —</div>}
                </div>
              </>
            ) : (
              <>
                <div className="mut" style={{ fontSize: "12px" }}>เลือกตัวละครที่ต้องการให้สังกัดกิลด์นี้ตั้งแต่เริ่มต้น:</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "220px", overflowY: "auto", border: "1px solid var(--line)", padding: "10px", background: "#0004" }}>
                  {availableChars.map(c => (
                    <label key={c.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                      <input type="checkbox" name="memberIds" value={c.id} style={{ accentColor: color }} />
                      <span><b>{c.firstName} {c.lastName || ""}</b> <span className="mut">(Rank {c.rank})</span></span>
                    </label>
                  ))}
                  {availableChars.length === 0 && <div className="mut" style={{ fontSize: "13px", textAlign: "center", padding: "10px" }}>— ไม่มีตัวละครที่ยังไร้สังกัด —</div>}
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        <Link href="/guilds">
          <button type="button" style={{ background: "transparent", border: "1px solid var(--line)", color: "var(--mut)" }}>ยกเลิก</button>
        </Link>
        <button type="submit" style={{ background: color, padding: "10px 28px" }}>
          {initialData ? "บันทึกการเปลี่ยนแปลง" : "สร้างกิลด์ใหม่"}
        </button>
      </div>

    </form>
  );
}