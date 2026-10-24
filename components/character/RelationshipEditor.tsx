// components/character/RelationshipEditor.tsx
"use client";
import { useState } from "react";

interface Relation {
  targetId: number | string;
  relation: string;
  note: string;
}

interface CharacterOption {
  id: number;
  nameJp: string;
  firstName: string;
  lastName: string | null;
}

export default function RelationshipEditor({ 
  initialTies, 
  characters 
}: { 
  initialTies: any[]; 
  characters: CharacterOption[]; 
}) {
  // แปลงข้อมูลเก่าให้รองรับทั้งแบบ String เดิมหรือ Object ใหม่
  const parsed = (initialTies || []).map((t: any) => {
    if (typeof t === 'string') {
      try { return JSON.parse(t); } catch { return { targetId: '', relation: '', note: t }; }
    }
    return t;
  });

  const [items, setItems] = useState<Relation[]>(parsed.length ? parsed : [{ targetId: '', relation: '', note: '' }]);

  const addRow = () => setItems([...items, { targetId: '', relation: '', note: '' }]);
  const removeRow = (index: number) => setItems(items.filter((_, i) => i !== index));
  const updateRow = (index: number, field: keyof Relation, val: any) => {
    const newItems = [...items];
    newItems[index][field] = val;
    setItems(newItems);
  };

  return (
    <div>
      {/* ส่งข้อมูลทั้งหมดในรูปแบบ JSON ไปยัง Server Action ผ่าน Input Hidden */}
      <input type="hidden" name="tiesJson" value={JSON.stringify(items)} />
      
      {items.map((item, idx) => (
        <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 2fr auto", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
          <select 
            value={item.targetId} 
            onChange={(e) => updateRow(idx, 'targetId', e.target.value)}
            style={{ background: "#0b060d", color: "var(--tx)", border: "1px solid var(--line)", padding: "8px", fontSize: "13px" }}
          >
            <option value="">— เลือกตัวละคร —</option>
            {characters.map(ch => (
              <option key={ch.id} value={ch.id}>
                {ch.firstName} {ch.lastName ? `(${ch.lastName})` : ""} · {ch.nameJp}
              </option>
            ))}
          </select>

          <input 
            type="text" 
            placeholder="รูปแบบความสัมพันธ์ (เช่น เพื่อนสนิท)" 
            value={item.relation} 
            onChange={(e) => updateRow(idx, 'relation', e.target.value)}
            style={{ background: "#0b060d", color: "var(--tx)", border: "1px solid var(--line)", padding: "8px", fontSize: "13px" }}
          />

          <input 
            type="text" 
            placeholder="ข้อความสั้น ๆ อธิบายเพิ่มเติม" 
            value={item.note} 
            onChange={(e) => updateRow(idx, 'note', e.target.value)}
            style={{ background: "#0b060d", color: "var(--tx)", border: "1px solid var(--line)", padding: "8px", fontSize: "13px" }}
          />

          <button 
            type="button" 
            onClick={() => removeRow(idx)} 
            className="mini" 
            style={{ background: "rgba(255,95,111,0.2)", color: "#ff5f6f", border: "1px solid #ff5f6f", padding: "8px 12px", cursor: "pointer" }}
          >
            ลบ
          </button>
        </div>
      ))}
      
      <button 
        type="button" 
        onClick={addRow} 
        className="mini" 
        style={{ marginTop: "8px", padding: "6px 14px" }}
      >
        + เพิ่มความสัมพันธ์
      </button>
    </div>
  );
}