// app/(game)/forums/[slug]/new/NewThreadClientForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { createThreadAction } from "@/actions/threads";
import BBEditor from "@/components/bbcode/BBEditor";
import { renderBB } from "@/lib/bbcode";

interface NewThreadClientFormProps {
  location: {
    id: number;
    name: string;
    slug: string;
    themeColor: string | null;
  };
}

export default function NewThreadClientForm({ location }: NewThreadClientFormProps) {
  const forumTheme = location.themeColor || "#38c8ff";

  const [title, setTitle] = useState("");

  const [cardThemeColor, setCardThemeColor] = useState(forumTheme);
  const [picBorderColor, setPicBorderColor] = useState("rgba(255,255,255,0.15)");
  const [warnColor, setWarnColor] = useState("#f43f5e");
  
  const [zoneName, setZoneName] = useState("");
  const [riskLevel, setRiskLevel] = useState("SAFE");
  const [locationNameEng, setLocationNameEng] = useState("");
  const [locationNameTh, setLocationNameTh] = useState("");
  const [coordinator, setCoordinator] = useState("");
  const [desc, setDesc] = useState("");
  const [warning, setWarning] = useState("");
  
  const [bannerUrl, setBannerUrl] = useState("");
  const [bgSize, setBgSize] = useState("cover");
  const [bgPosition, setBgPosition] = useState("center center");
  
  // Slider สำหรับ Custom
  const [bgZoom, setBgZoom] = useState(100);
  const [bgPosX, setBgPosX] = useState(50);
  const [bgPosY, setBgPosY] = useState(50);

  const [pinned, setPinned] = useState(false);
  const [locked, setLocked] = useState(false);
  const [closed, setClosed] = useState(false);
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buildLocationHtml = () => {
    let riskBg = `${cardThemeColor}22`;
    let riskBorder = cardThemeColor;
    if (riskLevel === "SAFE") { riskBg = "#6fe3a022"; riskBorder = "#6fe3a0"; }
    else if (riskLevel === "CAUTION") { riskBg = "#ffd35f22"; riskBorder = "#ffd35f"; }
    else if (riskLevel === "DANGER") { riskBg = "#ff2a6d22"; riskBorder = "#ff2a6d"; }
    else if (riskLevel === "RESTRICTED") { riskBg = "#a78bfa22"; riskBorder = "#a78bfa"; }

    const parsedDesc = renderBB(desc).replace(/\n/g, "<br/>");
    const parsedWarning = renderBB(warning).replace(/\n/g, "<br/>");

    const finalBgPos = bgPosition === "custom" ? `${bgPosX}% ${bgPosY}%` : bgPosition;
    const finalBgSize = bgPosition === "custom" ? `${bgZoom}%` : bgSize;

    return `<div class="lmnloc-card" 
      data-zone="${encodeURIComponent(zoneName)}"
      data-risk="${riskLevel}"
      data-nameeng="${encodeURIComponent(locationNameEng)}"
      data-nameth="${encodeURIComponent(locationNameTh)}"
      data-coord="${encodeURIComponent(coordinator)}"
      data-banner="${encodeURIComponent(bannerUrl)}"
      data-desc="${encodeURIComponent(desc)}"
      data-warn="${encodeURIComponent(warning)}"
      data-color1="${cardThemeColor}"
      data-color2="${picBorderColor}"
      data-colorwarn="${warnColor}"
      data-bgsize="${bgSize}"
      data-bgpos="${bgPosition}"
      data-bgzoom="${bgZoom}"
      data-bgposx="${bgPosX}"
      data-bgposy="${bgPosY}"
      style="color: #e4e4e7; font-family: 'Google Sans', sans-serif; width: 100%; position: relative;">
  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 16px;">
    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: ${cardThemeColor}; font-weight: 700;">
      📍 ${renderBB(zoneName) || "ZONE NAME"}
    </div>
    <div style="font-size: 11px; padding: 4px 12px; background: ${riskBg}; border: 1px solid ${riskBorder}; color: ${riskBorder}; font-weight: bold; letter-spacing: 1px;">
      RISK: ${riskLevel}
    </div>
  </div>

  <div style="margin-bottom: 16px;">
    <div style="font-size: 12px; color: rgba(255,255,255,0.5); letter-spacing: 1px; text-transform: uppercase;">${renderBB(locationNameEng) || "LOCATION NAME"}</div>
    <h2 style="margin: 2px 0 0 0; font-size: 28px; font-weight: 700; color: #fff; text-shadow: 0 0 12px ${cardThemeColor};">
      ${renderBB(locationNameTh) || title || "ชื่อสถานที่"}
    </h2>
  </div>

  ${bannerUrl.trim() ? `<div style="width: 100%; height: 380px; border: 1px solid ${picBorderColor}; margin-bottom: 18px; position: relative; overflow: hidden; background: #000;">
    <div style="width: 100%; height: 100%; background-image: url('${bannerUrl.trim()}'); background-position: ${finalBgPos}; background-size:${finalBgSize}; background-repeat: no-repeat;"></div>
  </div>` : ""}

  <div style="background: rgba(0,0,0,0.4); border-left: 3px solid ${cardThemeColor}; padding: 10px 14px; margin-bottom: 18px; font-size: 13px; color: #a1a1aa;">
    🌐 พิกัด: <b style="color: #fff;">${renderBB(coordinator) || "-"}</b>
  </div>

  <div style="font-size: 14px; line-height: 1.8; color: #d4d4d8; margin-bottom: 16px;">
    ${parsedDesc || "..."}
  </div>

  ${warning.trim() ? `<div style="background: ${warnColor}15; border: 1px dashed ${warnColor}; padding: 10px 14px; font-size: 12px; color:${warnColor}; margin-top: 10px; border-radius: 2px;">
    ${parsedWarning}
  </div>` : ""}
</div>`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const finalContent = buildLocationHtml();

    if (!title.trim() || !finalContent.trim()) {
      setError("กรุณากรอกหัวข้อกระทู้และเนื้อหาให้ครบถ้วน");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("locationId", location.id.toString());
    formData.append("title", title);
    formData.append("content", finalContent);
    formData.append("templateStyle", "location"); // บังคับเป็น location
    formData.append("bannerUrl", bannerUrl);
    formData.append("pinned", pinned ? "true" : "false");
    formData.append("locked", locked ? "true" : "false");
    formData.append("closed", closed ? "true" : "false");
    formData.append("password", password);

    try {
      const res = await createThreadAction(formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1020px", margin: "0 auto", fontFamily: "'Google Sans', sans-serif" }}>
      <div style={{ marginBottom: "16px" }}>
        <Link href={`/forums/${location.slug}`} style={{ fontSize: "12px", textDecoration: "none", color: forumTheme }}>
          ← กลับสู่ย่าน {location.name}
        </Link>
      </div>

      <div style={{ padding: "28px", background: "rgba(10, 10, 14, 0.9)", border: `1px solid ${forumTheme}` }}>
        <h2 style={{ fontSize: "22px", margin: "0 0 20px 0", color: "#fff" }}>
          📝 สร้างกระทู้สถานที่ใหม่: {location.name}
        </h2>

        {error && (
          <div style={{ padding: "10px 14px", background: "rgba(255, 95, 111, 0.15)", border: "1px solid #ff5f6f", color: "#ff5f6f", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "#aaa", display: "block", marginBottom: "6px" }}>หัวข้อกระทู้ (Thread Title)</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: "100%", padding: "10px 12px", background: "#000", border: "1px solid #444", color: "#fff", fontSize: "14px" }} />
          </div>

          <div style={{ border: `1px solid ${cardThemeColor}44`, padding: "16px", background: "rgba(0,0,0,0.3)" }}>
            <label style={{ fontSize: "14px", color: cardThemeColor, display: "block", marginBottom: "16px", fontWeight: "bold" }}>
              ⚙️ ปรับแต่งข้อมูลการ์ดสถานที่
            </label>

            {/* 👁️ PREVIEW สด */}
            <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px dashed #444" }}>
              <div style={{ fontSize: "11px", color: "#888", marginBottom: "12px" }}>👁️ ตัวอย่างการแสดงผลจริง (LIVE PREVIEW):</div>
              <div dangerouslySetInnerHTML={{ __html: buildLocationHtml() }} style={{ background: "#050505", padding: "16px", border: "1px solid #222" }} />
            </div>

            {/* 🎨 สีและสไตล์ */}
            <div style={{ padding: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid #333", marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: cardThemeColor, fontWeight: "bold", marginBottom: "12px" }}>🎨 ตั้งค่าโทนสี & กรอบภาพ</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#aaa" }}>สีธีมการ์ด</span>
                  <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                    <input type="color" value={cardThemeColor.length === 7 ? cardThemeColor : "#38c8ff"} onChange={e => setCardThemeColor(e.target.value)} style={{ width: "36px", height: "36px", padding: "0", cursor: "pointer", background: "#000", border: "1px solid #444", borderRadius: "4px" }} />
                    <input type="text" value={cardThemeColor} onChange={e => setCardThemeColor(e.target.value)} style={{ flex: 1, padding: "8px", background: "#000", border: "1px solid #444", color: "#fff", fontSize: "12px" }} />
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#aaa" }}>สีขอบรูปภาพ</span>
                  <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                    <input type="color" value={picBorderColor.length === 7 ? picBorderColor : "#ffffff"} onChange={e => setPicBorderColor(e.target.value)} style={{ width: "36px", height: "36px", padding: "0", cursor: "pointer", background: "#000", border: "1px solid #444", borderRadius: "4px" }} />
                    <input type="text" value={picBorderColor} onChange={e => setPicBorderColor(e.target.value)} style={{ flex: 1, padding: "8px", background: "#000", border: "1px solid #444", color: "#fff", fontSize: "12px" }} />
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#aaa" }}>สีกล่องคำเตือน</span>
                  <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                    <input type="color" value={warnColor.length === 7 ? warnColor : "#f43f5e"} onChange={e => setWarnColor(e.target.value)} style={{ width: "36px", height: "36px", padding: "0", cursor: "pointer", background: "#000", border: "1px solid #444", borderRadius: "4px" }} />
                    <input type="text" value={warnColor} onChange={e => setWarnColor(e.target.value)} style={{ flex: 1, padding: "8px", background: "#000", border: "1px solid #444", color: "#fff", fontSize: "12px" }} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
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
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#aaa" }}>Location Name (ENG)</span>
                <input type="text" value={locationNameEng} onChange={e => setLocationNameEng(e.target.value)} placeholder="เช่น Central Station" style={{ width: "100%", padding: "8px 10px", background: "#000", border: "1px solid #444", color: "#fff", fontSize: "12px", marginTop: "4px" }} />
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#aaa" }}>ชื่อสถานที่ (THAI)</span>
                <input type="text" value={locationNameTh} onChange={e => setLocationNameTh(e.target.value)} placeholder="เช่น สถานีรถไฟกลาง" style={{ width: "100%", padding: "8px 10px", background: "#000", border: "1px solid #444", color: "#fff", fontSize: "12px", marginTop: "4px" }} />
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <span style={{ fontSize: "11px", color: "#aaa" }}>พิกัด / เขตความดูแล (Coordinator)</span>
              <input type="text" value={coordinator} onChange={e => setCoordinator(e.target.value)} style={{ width: "100%", padding: "8px 10px", background: "#000", border: "1px solid #444", color: "#fff", fontSize: "12px", marginTop: "4px" }} />
            </div>

            {/* 🖼️ ภาพแบนเนอร์ */}
            <div style={{ padding: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid #333", marginBottom: "12px" }}>
              <div style={{ fontSize: "12px", color: cardThemeColor, fontWeight: "bold", marginBottom: "12px" }}>🖼️ ภาพหน้าปก (Banner Options)</div>
              
              <div style={{ marginBottom: "16px" }}>
                <span style={{ fontSize: "11px", color: "#aaa", display: "block", marginBottom: "4px" }}>ลิงก์รูปภาพ (URL)</span>
                <input type="url" value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} placeholder="https://..." style={{ width: "100%", padding: "8px 10px", background: "#000", border: "1px solid #444", color: "#fff", fontSize: "12px" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#aaa" }}>ตำแหน่งภาพ (Background Position)</span>
                  <select value={bgPosition} onChange={e => setBgPosition(e.target.value)} style={{ width: "100%", padding: "8px 10px", background: "#000", border: "1px solid #444", color: "#fff", fontSize: "12px", marginTop: "4px" }}>
                    <option value="center center">Center (กึ่งกลาง)</option>
                    <option value="top center">Top (ชิดบน)</option>
                    <option value="bottom center">Bottom (ชิดล่าง)</option>
                    <option value="left center">Left (ชิดซ้าย)</option>
                    <option value="right center">Right (ชิดขวา)</option>
                    <option value="custom">⚙️ กำหนดตำแหน่งและซูมเอง (Slider)</option>
                  </select>
                </div>
                
                {bgPosition !== "custom" && (
                  <div>
                    <span style={{ fontSize: "11px", color: "#aaa" }}>สัดส่วนภาพ (Background Size)</span>
                    <select value={bgSize} onChange={e => setBgSize(e.target.value)} style={{ width: "100%", padding: "8px 10px", background: "#000", border: "1px solid #444", color: "#fff", fontSize: "12px", marginTop: "4px" }}>
                      <option value="cover">cover (เต็มกรอบ)</option>
                      <option value="contain">contain (แสดงภาพเต็ม)</option>
                      <option value="100% 100%">100% 100% (ยืดเต็ม)</option>
                      <option value="auto">auto (ขนาดดั้งเดิม)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* 🟢 แสดง Slider เฉพาะตอนเลือก "กำหนดเอง" */}
              {bgPosition === "custom" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "12px", background: "rgba(0,0,0,0.5)", border: "1px solid #222", borderRadius: "4px", marginTop: "12px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#aaa", marginBottom: "6px" }}>
                      <span>🔍 ขนาด / ซูม (Zoom)</span>
                      <span style={{ color: cardThemeColor, fontWeight: "bold" }}>{bgZoom}%</span>
                    </div>
                    <input type="range" min="10" max="500" value={bgZoom} onChange={e => setBgZoom(Number(e.target.value))} style={{ width: "100%", cursor: "pointer", accentColor: cardThemeColor }} />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#aaa", marginBottom: "6px" }}>
                      <span>↔️ เลื่อนแนวนอน (แกน X)</span>
                      <span style={{ color: cardThemeColor, fontWeight: "bold" }}>{bgPosX}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={bgPosX} onChange={e => setBgPosX(Number(e.target.value))} style={{ width: "100%", cursor: "pointer", accentColor: cardThemeColor }} />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#aaa", marginBottom: "6px" }}>
                      <span>↕️ เลื่อนแนวตั้ง (แกน Y)</span>
                      <span style={{ color: cardThemeColor, fontWeight: "bold" }}>{bgPosY}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={bgPosY} onChange={e => setBgPosY(Number(e.target.value))} style={{ width: "100%", cursor: "pointer", accentColor: cardThemeColor }} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <BBEditor label="รายละเอียดสถานที่ (Description)" value={desc} onChange={setDesc} minHeight={200} hidePreview={true} />
            </div>

            <div style={{ marginTop: "12px" }}>
              <BBEditor label="กล่องคำเตือน / ข้อมูลพิเศษ (Warning - Optional)" value={warning} onChange={setWarning} minHeight={120} hidePreview={true} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "20px", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "12px 16px", border: "1px solid #333", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#ddd", cursor: "pointer" }}>
              <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
              📌 ปักหมุดกระทู้
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#ddd", cursor: "pointer" }}>
              <input type="checkbox" checked={locked} onChange={(e) => setLocked(e.target.checked)} />
              🔑 ล็อกด้วยรหัสผ่าน
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#ddd", cursor: "pointer" }}>
              <input type="checkbox" checked={closed} onChange={(e) => setClosed(e.target.checked)} />
              ⛔ ปิดการตอบกลับ
            </label>
          </div>

          {locked && (
            <div>
              <label style={{ fontSize: "12px", color: "#a78bfa", display: "block", marginBottom: "6px" }}>รหัสผ่านสำหรับเข้าชมกระทู้</label>
              <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "8px 12px", background: "#000", border: "1px solid #a78bfa", color: "#fff", fontSize: "14px" }} />
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
            <button type="submit" disabled={loading} style={{ padding: "10px 24px", background: forumTheme, border: "none", color: "#000", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", fontSize: "14px" }}>
              {loading ? "กำลังสร้างกระทู้..." : "🚀 ยืนยันการสร้างกระทู้"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}