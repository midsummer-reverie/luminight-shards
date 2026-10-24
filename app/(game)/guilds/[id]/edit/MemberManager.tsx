// app/(game)/guilds/[id]/edit/MemberManager.tsx
"use client";

import { useState } from "react";
import { updateGuildMemberAction } from "@/actions/guilds";
import { useRouter } from "next/navigation";

export default function MemberManager({ guildId, members, availableChars }: { guildId: number, members: any[], availableChars: any[] }) {
  const [selectedCharId, setSelectedCharId] = useState("");
  const router = useRouter();

  const handleAddMember = async () => {
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
    <div className="box" style={{ padding: "24px" }}>
      <div className="tag">// GUILD MEMBERS</div>
      <h3 style={{ marginBottom: "16px" }}>จัดการสมาชิกในกิลด์</h3>

      {/* ฟอร์มเพิ่มสมาชิก */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <select 
          value={selectedCharId} 
          onChange={e => setSelectedCharId(e.target.value)}
          style={{ flex: 1, padding: "8px", background: "#0b060d", color: "#fff", border: "1px solid var(--line)" }}
        >
          <option value="">-- เลือกตัวละครเพื่อดึงเข้ากิลด์ --</option>
          {unassigned.map(c => (
            <option key={c.id} value={c.id}>
              {c.firstName} {c.lastName || ""} (Rank {c.rank})
            </option>
          ))}
        </select>
        <button type="button" onClick={handleAddMember}>เพิ่มเข้ากิลด์</button>
      </div>

      {/* รายชื่อสมาชิกปัจจุบัน */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {members.map(m => (
          <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "#0006", border: "1px solid var(--line)" }}>
            <div>
              <b>{m.firstName} {m.lastName || ""}</b> 
              <span className="mut" style={{ marginLeft: "8px" }}>Rank {m.rank} · {m.className || "Esp/Gui"}</span>
            </div>
            <button 
              type="button" 
              onClick={() => handleRemoveMember(m.id)} 
              style={{ background: "#ff5f6f", color: "#fff", padding: "4px 10px", fontSize: "11px" }}
            >
              เตะออกจากกิลด์
            </button>
          </div>
        ))}
        {members.length === 0 && (
          <div className="mut">— ยังไม่มีสมาชิกในกิลด์นี้ —</div>
        )}
      </div>
    </div>
  );
}