// components/CharacterStatusWidget.tsx
"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { updateCharacterStatus } from "@/actions/characters";

// 🟢 เพิ่มตัวเลือก id: "0" สำหรับการ "ไม่ระบุ" หรือซ่อนจากแผนที่
const LOCATIONS = [
  { id: "0", slug: "hidden", name: "ไม่ระบุ (ซ่อนจากแผนที่)" },
  { id: "11", slug: "l1", name: "ย่านบัญชาการ" },
  { id: "6", slug: "l2", name: "ย่านกิลด์" },
  { id: "10", slug: "l3", name: "ย่านที่พักอาศัย" },
  { id: "12", slug: "l4", name: "ย่านการค้า" },
  { id: "13", slug: "l5", name: "เขตการศึกษา" },
  { id: "14", slug: "l6", name: "ย่านนอกกฎหมาย" },
  { id: "15", slug: "l7", name: "แอเรีย" },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ready: { label: "พร้อม", color: "#6fe3a0" },
  doom: { label: "ดูม", color: "#ff5f6f" },
  hurt: { label: "บาดเจ็บ", color: "#ff9f5f" },
  mission: { label: "ปฏิบัติการ", color: "#7be0ff" },
  rest: { label: "พักผ่อน", color: "#a78bfa" },
  root: { label: "ติดรูท", color: "#ffd35f" },
};

export default function CharacterStatusWidget({ initialCharacters = [] }: { initialCharacters?: any[] }) {
  const charsList = Array.isArray(initialCharacters) ? initialCharacters : [];
  
  const [selectedId, setSelectedId] = useState<string>(charsList[0]?.id ? String(charsList[0].id) : "");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeChar = charsList.find((c) => String(c.id) === String(selectedId)) || charsList[0];

  const [locationIdVal, setLocationIdVal] = useState<string>("0");
  const [statusVal, setStatusVal] = useState<string>("ready");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeChar) {
      const matchedLoc = LOCATIONS.find(
        l => l.id === String(activeChar.statusLocationId) || 
             l.name === activeChar.homeText || 
             l.slug === activeChar.homeText
      );
      // 🟢 ถ้าหาไม่เจอ หรือเป็น null ให้ใช้ "0" (ไม่ระบุ)
      setLocationIdVal(matchedLoc ? matchedLoc.id : "0");
      setStatusVal(activeChar.status || "ready");
    }
  }, [activeChar]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeChar) return;

    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await updateCharacterStatus(formData);
        showToast("SAVED ✦ อัปเดตสถานะตัวละครเรียบร้อยแล้ว");
      } catch (err) {
        console.error(err);
        showToast("ERROR ⚠️ ไม่สามารถอัปเดตสถานะได้");
      }
    });
  };

  if (charsList.length === 0 || !activeChar) {
    return (
      <div className="box" id="stbox" style={{ margin: 0 }}>
        <div className="tag">// CHARACTER STATUS</div>
        <div className="mut" style={{ padding: "12px 0" }}>— ยังไม่มีตัวละครในระบบ —</div>
      </div>
    );
  }

  const currentStatusInfo = STATUS_MAP[statusVal] || STATUS_MAP.ready;
  const currentLocationObj = LOCATIONS.find(l => l.id === locationIdVal) || LOCATIONS[0];

  return (
    <>
      {toastMessage && <div className="toast">{toastMessage}</div>}

      <div className="box" id="stbox" style={{ margin: 0 }}>
        <div className="tag">// CHARACTER STATUS · {charsList.length}</div>

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="characterId" value={activeChar.id} />

          {/* Custom Dropdown สำหรับเลือกตัวละคร */}
          <div style={{ position: "relative", marginBottom: "10px" }} ref={dropdownRef}>
            <div
              onClick={() => setIsOpen(!isOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 95, 168, 0.3)",
                padding: "8px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                color: "#fff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {activeChar.faceUrl && (
                  <img
                    src={activeChar.faceUrl}
                    alt={activeChar.firstName}
                    style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }}
                  />
                )}
                <span style={{ fontSize: "13px" }}>
                  {activeChar.firstName} {activeChar.nameJp ? `(${activeChar.nameJp})` : ""}
                </span>
              </div>
              <span style={{ fontSize: "11px", opacity: 0.7 }}>▼</span>
            </div>

            {isOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  marginTop: "4px",
                  background: "#120a16",
                  border: "1px solid rgba(255, 95, 168, 0.4)",
                  borderRadius: "4px",
                  zIndex: 50,
                  maxHeight: "200px",
                  overflowY: "auto",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                }}
              >
                {charsList.map((m) => {
                  const stInfo = STATUS_MAP[m.status || "ready"] || STATUS_MAP.ready;
                  const isSelected = String(m.id) === String(activeChar.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedId(String(m.id));
                        setIsOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        cursor: "pointer",
                        background: isSelected ? "rgba(255, 95, 168, 0.15)" : "transparent",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {m.faceUrl ? (
                          <img
                            src={m.faceUrl}
                            alt={m.firstName}
                            style={{ width: "22px", height: "22px", borderRadius: "50%", objectFit: "cover" }}
                          />
                        ) : (
                          <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#333" }} />
                        )}
                        <span style={{ fontSize: "12px", color: "#fff" }}>
                          {m.firstName} {m.nameJp ? `(${m.nameJp})` : ""}
                        </span>
                      </div>
                      <span className="sb" style={{ "--sc": stInfo.color, fontSize: "10px", padding: "1px 6px" } as React.CSSProperties}>
                        {stInfo.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* แสดงสถานะปัจจุบัน */}
          <div className="stc" style={{ "--sc": currentStatusInfo.color } as React.CSSProperties}>
            <span 
                className="sb" 
                style={{ "--sc": currentStatusInfo.color } as React.CSSProperties}
            >
                {currentStatusInfo.label}
            </span>
            <div className="mut" style={{ fontSize: "12px", marginTop: "4px" }}>
              📍 {currentLocationObj.name} · RANK {activeChar.rank || "C"}
            </div>
          </div>

          <div className="sr" style={{ marginTop: "10px" }}>
            <select 
              name="locationId" 
              value={locationIdVal} 
              onChange={(e) => setLocationIdVal(e.target.value)}
            >
              {LOCATIONS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>

            <select 
              name="status" 
              value={statusVal} 
              onChange={(e) => setStatusVal(e.target.value)}
            >
              {Object.entries(STATUS_MAP).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            style={{ marginTop: "10px", width: "100%", opacity: isPending ? 0.6 : 1 }}
          >
            {isPending ? "กำลังบันทึก..." : "ยืนยัน"}
          </button>
        </form>
      </div>
    </>
  );
}