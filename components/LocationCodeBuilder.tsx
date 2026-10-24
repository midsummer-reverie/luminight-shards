// components/LocationCodeBuilder.tsx
"use client";

import { useState, useEffect } from "react";
import { renderBB } from "@/lib/bbcode";
import BBEditor from "@/components/bbcode/BBEditor";

interface LocationCodeBuilderProps {
  onCodeChange?: (html: string) => void;
}

// 🟢 ตัวช่วยแปลงค่าสีให้กล่อง <input type="color"> อ่านออก ป้องกันเว็บพังเวลาใช้ rgba()
const getValidHex = (color: string, fallback: string) => {
  return /^#[0-9A-F]{6}$/i.test(color) ? color : fallback;
};

export default function LocationCodeBuilder({ onCodeChange }: LocationCodeBuilderProps) {
  // 1. การตั้งค่าสีและสไตล์
  const [themeColor, setThemeColor] = useState("#38c8ff");
  const [picBorderColor, setPicBorderColor] = useState("rgba(255,255,255,0.15)");

  // 2. การตั้งค่ารูปภาพ และ Slider
  const [bannerUrl, setBannerUrl] = useState("");
  
  const [bgSizeMode, setBgSizeMode] = useState("cover");
  const [bgSizeCustom, setBgSizeCustom] = useState(100);

  const [bgPosMode, setBgPosMode] = useState("50% 50%");
  const [bgPosX, setBgPosX] = useState(50);
  const [bgPosY, setBgPosY] = useState(50);

  // 3. ข้อมูลข้อความ
  const [zoneName, setZoneName] = useState("");
  const [riskLevel, setRiskLevel] = useState("SAFE");
  const [locationNameEng, setLocationNameEng] = useState("");
  const [locationNameTh, setLocationNameTh] = useState("");
  const [coordinator, setCoordinator] = useState("");
  const [desc, setDesc] = useState("");
  const [warning, setWarning] = useState("");

  const buildLocationHtml = () => {
    const parsedDesc = renderBB(desc).replace(/\n/g, "<br/>");
    const parsedWarning = renderBB(warning).replace(/\n/g, "<br/>");

    let riskBg = `${themeColor}22`;
    let riskBorder = themeColor;
    if (riskLevel === "SAFE") { riskBg = "#6fe3a022"; riskBorder = "#6fe3a0"; }
    else if (riskLevel === "CAUTION") { riskBg = "#ffd35f22"; riskBorder = "#ffd35f"; }
    else if (riskLevel === "DANGER") { riskBg = "#ff2a6d22"; riskBorder = "#ff2a6d"; }
    else if (riskLevel === "RESTRICTED") { riskBg = "#a78bfa22"; riskBorder = "#a78bfa"; }

    // ประมวลผลขนาดและตำแหน่งภาพ
    const finalBgSize = bgSizeMode === "custom" ? `${bgSizeCustom}%` : bgSizeMode;
    const finalBgPos = bgPosMode === "custom" ? `${bgPosX}% ${bgPosY}%` : bgPosMode;

    return `<div class="lmnloc-card" style="color: #e4e4e7; font-family: 'Google Sans', sans-serif; width: 100%; position: relative;">
  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 16px;">
    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: ${themeColor}; font-weight: 700;">
      📍 ${renderBB(zoneName) || "ZONE NAME"}
    </div>
    <div style="font-size: 11px; padding: 4px 12px; background: ${riskBg}; border: 1px solid ${riskBorder}; color: ${riskBorder}; font-weight: bold; letter-spacing: 1px;">
      RISK: ${renderBB(riskLevel)}
    </div>
  </div>

  <div style="margin-bottom: 16px;">
    <div style="font-size: 12px; color: rgba(255,255,255,0.5); letter-spacing: 1px; text-transform: uppercase;">${renderBB(locationNameEng) || "LOCATION NAME"}</div>
    <h2 style="margin: 2px 0 0 0; font-size: 28px; font-weight: 700; color: #fff; text-shadow: 0 0 12px ${themeColor};">
      ${renderBB(locationNameTh) || "ชื่อสถานที่"}
    </h2>
  </div>

  ${bannerUrl.trim() ? `<div style="width: 100%; height: 380px; border: 1px solid ${picBorderColor}; margin-bottom: 18px; position: relative; overflow: hidden; background: #000;">
    <div style="width: 100%; height: 100%; background-image: url('${bannerUrl.trim()}'); background-position: ${finalBgPos}; background-size:${finalBgSize}; background-repeat: no-repeat;"></div>
  </div>` : ""}

  <div style="background: rgba(0,0,0,0.4); border-left: 3px solid ${themeColor}; padding: 10px 14px; margin-bottom: 18px; font-size: 13px; color: #a1a1aa;">
    🌐 พิกัด/เขต: <b style="color: #fff;">${renderBB(coordinator) || "-"}</b>
  </div>

  <div style="font-size: 14px; line-height: 1.8; color: #d4d4d8; margin-bottom: 16px;">
    ${parsedDesc || "..."}
  </div>

  ${warning.trim() ? `<div style="background: #f43f5e15; border: 1px dashed #f43f5e; padding: 10px 14px; font-size: 12px; color: #f43f5e; margin-top: 10px; border-radius: 2px;">
    ⚠️ <b>หมายเหตุ / คำเตือน:</b> ${parsedWarning}
  </div>` : ""}
</div>`;
  };

  useEffect(() => {
    if (onCodeChange) {
      onCodeChange(buildLocationHtml());
    }
  }, [themeColor, picBorderColor, bannerUrl, bgSizeMode, bgSizeCustom, bgPosMode, bgPosX, bgPosY, zoneName, riskLevel, locationNameEng, locationNameTh, coordinator, desc, warning, onCodeChange]);

  return (
    <div style={{ background: "rgba(10, 8, 16, 0.95)", border: `1px solid ${themeColor}`, padding: "20px", marginBottom: "20px", fontFamily: "'Google Sans', sans-serif" }}>

      {/* 👁️ PREVIEW สดด้านบน */}
      <div style={{ marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px dashed #444" }}>
        <div style={{ fontSize: "11px", color: "#888", marginBottom: "12px" }}>👁️ ตัวอย่างการแสดงผลจริง (LIVE PREVIEW):</div>
        <div dangerouslySetInnerHTML={{ __html: buildLocationHtml() }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* 🎨 สีและสไตล์ */}
        <div style={{ padding: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid #333" }}>
          <div style={{ fontSize: "12px", color: themeColor, fontWeight: "bold", marginBottom: "12px" }}>🎨 ตั้งค่าโทนสี & กรอบภาพ</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            
            {/* 🟢 กล่องเลือกสีรูปแบบใหม่ (สีเต็มกล่อง กดง่าย 100%) */}
            <div>
              <span style={{ fontSize: "11px", color: "#aaa" }}>สีธีมหลัก (Theme Color)</span>
              <div style={{ display: "flex", gap: "10px", marginTop: "4px", alignItems: "center" }}>
                <div style={{ position: "relative", width: "32px", height: "32px", borderRadius: "4px", border: "1px solid #444", backgroundColor: themeColor, overflow: "hidden", flexShrink: 0 }}>
                  <input type="color" value={getValidHex(themeColor, "#38c8ff")} onChange={e => setThemeColor(e.target.value)} style={{ position: "absolute", top: "-10px", left: "-10px", width: "50px", height: "50px", opacity: 0, cursor: "pointer", border: "none", padding: 0 }} />
                </div>
                <input type="text" value={themeColor} onChange={e => setThemeColor(e.target.value)} style={{ flex: 1, padding: "8px", background: "#000", border: "1px solid #444", color: "#fff", fontSize: "12px" }} />
              </div>
            </div>

            <div>
              <span style={{ fontSize: "11px", color: "#aaa" }}>สีขอบรูปภาพ (Image Border Color)</span>
              <div style={{ display: "flex", gap: "10px", marginTop: "4px", alignItems: "center" }}>
                <div style={{ position: "relative", width: "32px", height: "32px", borderRadius: "4px", border: "1px solid #444", backgroundColor: picBorderColor, overflow: "hidden", flexShrink: 0 }}>
                  <input type="color" value={getValidHex(picBorderColor, "#ffffff")} onChange={e => setPicBorderColor(e.target.value)} style={{ position: "absolute", top: "-10px", left: "-10px", width: "50px", height: "50px", opacity: 0, cursor: "pointer", border: "none", padding: 0 }} />
                </div>
                <input type="text" value={picBorderColor} onChange={e => setPicBorderColor(e.target.value)} style={{ flex: 1, padding: "8px", background: "#000", border: "1px solid #444", color: "#fff", fontSize: "12px" }} />
              </div>
            </div>
            
          </div>
        </div>

        {/* 🖼️ ภาพแบนเนอร์และการแสดงผล */}
        <div style={{ padding: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid #333" }}>
          <div style={{ fontSize: "12px", color: themeColor, fontWeight: "bold", marginBottom: "12px" }}>🖼️ ภาพหน้าปก (Banner Options)</div>
          
          <div style={{ marginBottom: "16px" }}>
            <span style={{ fontSize: "11px", color: "#aaa" }}>ลิงก์รูปภาพ (URL)</span>
            <input type="url" value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} placeholder="https://..." style={{ width: "100%", padding: "8px 10px", background: "#000", border: "1px solid #444", color: "#fff", fontSize: "12px", marginTop: "4px" }} />
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* 🟢 สัดส่วนภาพ (มี Slider โผล่เมื่อเลือก Custom) */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "11px", color: "#aaa" }}>สัดส่วนภาพ (Size)</span>
                {bgSizeMode === "custom" && <span style={{ fontSize: "11px", color: themeColor, fontWeight: "bold" }}>{bgSizeCustom}%</span>}
              </div>
              
              <select value={bgSizeMode} onChange={e => setBgSizeMode(e.target.value)} style={{ width: "100%", padding: "6px 10px", background: "#000", border: "1px solid #444", color: "#fff", fontSize: "12px", marginBottom: "8px" }}>
                <option value="cover">พอดีกรอบ (cover)</option>
                <option value="contain">แสดงเต็มภาพ (contain)</option>
                <option value="auto">ขนาดดั้งเดิม (auto)</option>
                <option value="custom">⚙️ กำหนดขนาดเองด้วยตัวเลข</option>
              </select>

              {bgSizeMode === "custom" && (
                <div style={{ background: "#000", padding: "10px", border: "1px solid #444" }}>
                  <input type="range" min="10" max="300" value={bgSizeCustom} onChange={e => setBgSizeCustom(Number(e.target.value))} style={{ width: "100%", cursor: "pointer", accentColor: themeColor }} />
                </div>
              )}
            </div>

            {/* 🟢 ตำแหน่งภาพ (มี Slider โผล่เมื่อเลือก Custom) */}
            <div>
              <span style={{ fontSize: "11px", color: "#aaa", display: "block", marginBottom: "4px" }}>ตำแหน่งภาพ (Position)</span>
              
              <select value={bgPosMode} onChange={e => setBgPosMode(e.target.value)} style={{ width: "100%", padding: "6px 10px", background: "#000", border: "1px solid #444", color: "#fff", fontSize: "12px", marginBottom: "8px" }}>
                <option value="50% 50%">กึ่งกลาง (Center)</option>
                <option value="top">ชิดบน (Top)</option>
                <option value="bottom">ชิดล่าง (Bottom)</option>
                <option value="left">ชิดซ้าย (Left)</option>
                <option value="right">ชิดขวา (Right)</option>
                <option value="custom">⚙️ กำหนดตำแหน่งเอง (แกน X, Y)</option>
              </select>

              {bgPosMode === "custom" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "#000", padding: "10px", border: "1px solid #444" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "10px", color: "#888", width: "24px" }}>X</span>
                    <input type="range" min="0" max="100" value={bgPosX} onChange={e => setBgPosX(Number(e.target.value))} style={{ flex: 1, cursor: "pointer", accentColor: themeColor }} />
                    <span style={{ fontSize: "10px", color: themeColor, width: "30px", textAlign: "right" }}>{bgPosX}%</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "10px", color: "#888", width: "24px" }}>Y</span>
                    <input type="range" min="0" max="100" value={bgPosY} onChange={e => setBgPosY(Number(e.target.value))} style={{ flex: 1, cursor: "pointer", accentColor: themeColor }} />
                    <span style={{ fontSize: "10px", color: themeColor, width: "30px", textAlign: "right" }}>{bgPosY}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 📝 ข้อมูลสถานที่ */}
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <div>
              <span style={{ fontSize: "11px", color: "#aaa" }}>โซน (Zone Name)</span>
              <input type="text" value={zoneName} onChange={e => setZoneName(e.target.value)} placeholder="เช่น ZONE // PUBLIC AREA" style={{ width: "100%", padding: "8px 10px", background: "#000", border: "1px solid #444", color: "#fff", fontSize: "12px", marginTop: "4px" }} />
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#aaa" }}>ระดับความเสี่ยง (Risk Level)</span>
              <select value={riskLevel} onChange={e => setRiskLevel(e.target.value)} style={{ width: "100%", padding: "8px 10px", background: "#000", border: "1px solid #444", color: "#fff", fontSize: "12px", marginTop: "4px" }}>
                <option value="SAFE">SAFE (ปลอดภัย)</option>
                <option value="CAUTION">CAUTION (เฝ้าระวัง)</option>
                <option value="DANGER">DANGER (อันตราย)</option>
                <option value="RESTRICTED">RESTRICTED (หวงห้าม)</option>
                <option value="UNKNOWN">UNKNOWN (ไม่ทราบสถานะ)</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <div>
              <span style={{ fontSize: "11px", color: "#aaa" }}>Location Name (ENG)</span>
              <input type="text" value={locationNameEng} onChange={e => setLocationNameEng(e.target.value)} style={{ width: "100%", padding: "8px 10px", background: "#000", border: "1px solid #444", color: "#fff", fontSize: "12px", marginTop: "4px" }} />
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#aaa" }}>ชื่อสถานที่ (THAI)</span>
              <input type="text" value={locationNameTh} onChange={e => setLocationNameTh(e.target.value)} style={{ width: "100%", padding: "8px 10px", background: "#000", border: "1px solid #444", color: "#fff", fontSize: "12px", marginTop: "4px" }} />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <span style={{ fontSize: "11px", color: "#aaa" }}>พิกัด / เขตความดูแล (Coordinator)</span>
            <input type="text" value={coordinator} onChange={e => setCoordinator(e.target.value)} style={{ width: "100%", padding: "8px 10px", background: "#000", border: "1px solid #444", color: "#fff", fontSize: "12px", marginTop: "4px" }} />
          </div>

          <div>
            <BBEditor label="รายละเอียดสถานที่ (Description)" value={desc} onChange={setDesc} minHeight={150} hidePreview={true} />
          </div>

          <div style={{ marginTop: "16px" }}>
            <BBEditor label="หมายเหตุ / คำเตือน (Warning)" value={warning} onChange={setWarning} minHeight={100} hidePreview={true} />
          </div>
        </div>
      </div>
    </div>
  );
}