// components/map/TacticalMapClient.tsx
"use client";

import { useState } from "react";
import TacticalMap from "@/components/map/TacticalMap";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ready: { label: "พร้อม", color: "#6fe3a0" },
  doom: { label: "ดูม", color: "#ff5f6f" },
  hurt: { label: "บาดเจ็บ", color: "#ff9f5f" },
  mission: { label: "ปฏิบัติการ", color: "#7be0ff" },
  rest: { label: "พักผ่อน", color: "#a78bfa" },
  root: { label: "ติดรูท", color: "#ffd35f" },
};

interface TacticalMapClientProps {
  locDataMap: Record<string, any>;
  defaultInfo: any;
}

export default function TacticalMapClient({ locDataMap, defaultInfo }: TacticalMapClientProps) {
  const [hoveredLoc, setHoveredLoc] = useState<string | null>(null);

  const currentInfo = hoveredLoc ? locDataMap[hoveredLoc] : null;
  const displayInfo = currentInfo || defaultInfo;
  const tColor = displayInfo.themeColor || "var(--cy)";

  return (
    <div className="box" style={{ padding: "8px", margin: 0 }}>
      {/* ส่งข้อมูลตัวละครไปยัง TacticalMap เพื่อเรนเดอร์พินบนแผนที่ */}
      <TacticalMap onHover={setHoveredLoc} locDataMap={locDataMap} />

      <div className="lg">
        {Object.entries(STATUS_MAP).map(([key, val]) => (
          <span key={key} className="sb" style={{ "--sc": val.color } as React.CSSProperties}>
            {val.label}
          </span>
        ))}
      </div>

      <div id="mi" className="mut" style={{ padding: "10px 14px", lineHeight: "1.6" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <b>
            {displayInfo.name} 
            {displayInfo.nameJp && (
              <>
                <span style={{ margin: "0 6px", opacity: 0.5 }}>·</span>
                <span style={{ opacity: 0.8 }}>{displayInfo.nameJp}</span>
              </>
            )}
            {displayInfo.nameEn && (
              <>
                <span style={{ margin: "0 6px", opacity: 0.5 }}>·</span>
                <span style={{ fontSize: "12px", color: tColor, letterSpacing: "1px" }}>{displayInfo.nameEn}</span>
              </>
            )}
          </b>
          <span style={{ fontSize: "12px" }}>
            เสี่ยง <b style={{ color: tColor }}>{displayInfo.danger ?? 0}%</b>
          </span>
        </div>

        {/* 🟢 แสดงรายชื่อ รูปภาพ และสถานะของตัวละครในย่านนี้ */}
        <div className="lg" style={{ padding: "8px 0 0", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {displayInfo.residents && displayInfo.residents.length > 0 ? (
            displayInfo.residents.map((char: any, idx: number) => {
              const stInfo = STATUS_MAP[char.status || "ready"] || STATUS_MAP.ready;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(255,255,255,0.04)",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    border: `1px solid ${stInfo.color}44`,
                  }}
                >
                  {char.faceUrl && (
                    <img
                      src={char.faceUrl}
                      alt={char.firstName}
                      style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }}
                    />
                  )}
                  <span style={{ fontSize: "11px", color: "#fff" }}>{char.firstName || char.nameJp}</span>
                  <span 
                    className="sb" 
                    style={{ "--sc": stInfo.color, fontSize: "9px", padding: "1px 5px", marginLeft: "2px" } as React.CSSProperties}
                  >
                    {stInfo.label}
                  </span>
                </div>
              );
            })
          ) : (
            <span className="mut" style={{ fontSize: "11px" }}>— ไม่มีตัวละครในพื้นที่ —</span>
          )}
        </div>
      </div>
    </div>
  );
}