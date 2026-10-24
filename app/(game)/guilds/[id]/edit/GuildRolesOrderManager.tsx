// app/(game)/guilds/[id]/edit/GuildRolesOrderManager.tsx
"use client";

import { useState } from "react";
import { updateGuildRolesOrderAction } from "@/actions/guilds";
import { useRouter } from "next/navigation";

export default function GuildRolesOrderManager({ guildId, initialRoles, themeColor }: { guildId: number, initialRoles: string[], themeColor: string }) {
  const [roles, setRoles] = useState<string[]>(initialRoles.length ? initialRoles : ["หัวหน้ากิลด์", "รองหัวหน้า", "สมาชิก"]);
  const [newRole, setNewRole] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= roles.length) return;

    const updated = [...roles];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    setRoles(updated);
    await saveOrder(updated);
  };

  const handleAdd = async () => {
    if (!newRole.trim() || roles.includes(newRole.trim())) return;
    const updated = [...roles, newRole.trim()];
    setRoles(updated);
    setNewRole("");
    await saveOrder(updated);
  };

  const handleRemove = async (roleToRemove: string) => {
    const updated = roles.filter(r => r !== roleToRemove);
    setRoles(updated);
    await saveOrder(updated);
  };

  const saveOrder = async (currentRoles: string[]) => {
    setLoading(true);
    await updateGuildRolesOrderAction(guildId, currentRoles);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="box" style={{ borderColor: `${themeColor}66`, background: "#0c0710", marginTop: "24px" }}>
      <div className="tag" style={{ color: themeColor }}>// GUILD ROLES HIERARCHY</div>
      <h3 style={{ margin: "4px 0 12px" }}>จัดการลำดับความสำคัญของตำแหน่ง</h3>
      <div className="mut" style={{ fontSize: "12px", marginBottom: "16px" }}>
        ตำแหน่งที่อยู่ด้านบนสุดจะถูกแสดงผลและจัดเรียงขึ้นก่อนในหน้ากิลด์ (ตำแหน่งที่ไม่ได้อยู่ในรายการนี้จะถูกจัดไว้ท้ายสุดอัตโนมัติ)
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <input 
          type="text" 
          value={newRole} 
          onChange={e => setNewRole(e.target.value)} 
          placeholder="เพิ่มตำแหน่งใหม่ เช่น หัวหน้าหน่วยรบ" 
          style={{ flex: 1, padding: "8px", background: "#000", border: `1px solid ${themeColor}66`, color: "#fff", fontSize: "13px" }}
        />
        <button type="button" onClick={handleAdd} style={{ background: themeColor, color: "#000", fontWeight: "bold", padding: "8px 16px" }}>เพิ่มตำแหน่ง</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {roles.map((role, idx) => (
          <div key={role} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(0,0,0,0.5)", border: `1px solid ${themeColor}33` }}>
            <span style={{ fontSize: "14px", fontWeight: "bold", color: "#fff" }}>{idx + 1}. {role}</span>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <button type="button" onClick={() => handleMove(idx, "up")} disabled={idx === 0} style={{ padding: "2px 8px", fontSize: "11px", background: "#222", color: "#fff", border: "1px solid #44ual" }}>▲</button>
              <button type="button" onClick={() => handleMove(idx, "down")} disabled={idx === roles.length - 1} style={{ padding: "2px 8px", fontSize: "11px", background: "#222", color: "#fff", border: "1px solid #44" }}>▼</button>
              <button type="button" onClick={() => handleRemove(role)} style={{ padding: "2px 8px", fontSize: "11px", background: "#ff5f6f", color: "#fff", border: "none" }}>ลบ</button>
            </div>
          </div>
        ))}
      </div>
      {loading && <div className="mut" style={{ fontSize: "11px", marginTop: "8px", color: themeColor }}>กำลังบันทึกลำดับ...</div>}
    </div>
  );
}