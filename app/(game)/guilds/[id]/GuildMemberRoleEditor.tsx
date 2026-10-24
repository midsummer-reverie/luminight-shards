// app/(game)/guilds/[id]/GuildMemberRoleEditor.tsx
"use client";

import { useState } from "react";
import { updateCharacterGuildTitleAction } from "@/actions/guilds";
import { useRouter } from "next/navigation";

export default function GuildMemberRoleEditor({ 
  characterId, 
  currentTitle, 
  themeColor, 
  rolesOrder = [] 
}: { 
  characterId: number, 
  currentTitle: string, 
  themeColor: string, 
  rolesOrder?: string[] 
}) {
  const [title, setTitle] = useState(currentTitle);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async (newTitle: string) => {
    setTitle(newTitle);
    setLoading(true);
    await updateCharacterGuildTitleAction(characterId, newTitle);
    setLoading(false);
    router.refresh();
  };

  // รวมตำแหน่งปัจจุบันเข้าไประหว่างตัวเลือกด้วย เผื่อกรณีตำแหน่งเก่าไม่อยู่ในลิสต์แล้ว
  const options = Array.from(new Set([...rolesOrder, title, "สมาชิก"]));

  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
      <span style={{ fontSize: "11px", color: "var(--mut)" }}>ตำแหน่ง:</span>
      <select 
        value={title} 
        onChange={e => handleSave(e.target.value)}
        style={{ 
          flex: 1, 
          padding: "6px 8px", 
          fontSize: "12px", 
          background: "#000", 
          border: `1px solid ${themeColor}66`, 
          color: "#fff",
          borderRadius: "2px",
          cursor: "pointer"
        }}
      >
        {options.map(role => (
          <option key={role} value={role}>{role}</option>
        ))}
      </select>
      {loading && <span style={{ fontSize: "10px", color: themeColor }}>บันทึก...</span>}
    </div>
  );
}