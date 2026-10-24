// components/RpCodeBuilder.tsx
"use client";

import { useState } from "react";

interface RpCodeBuilderProps {
  onApplyCode: (generatedHtml: string) => void;
}

export default function RpCodeBuilder({ onApplyCode }: RpCodeBuilderProps) {
  // 🟢 รวมตัวแปรทั้งหมดตามโครงสร้าง CSS/HTML
  const [classType, setClassType] = useState("esper");
  const [rank, setRank] = useState("s");
  const [jpnName, setJpnName] = useState("柄本梢恵");
  const [spark, setSpark] = useState("78");
  const [sn, setSn] = useState("enomoto");
  const [fn, setFn] = useState("kozue");
  const [acc1, setAcc1] = useState("#C3B1C4");
  const [acc2, setAcc2] = useState("#A3A5C2");
  const [pic1, setPic1] = useState("https://iili.io/Fr3mKZv.jpg");
  const [pic2, setPic2] = useState("https://iili.io/FrFQtF1.png");
  const [loc, setLoc] = useState("เมือง");
  const [rpContent, setRpContent] = useState("พิมพ์เนื้อหาบทสนทนา / โรลเพลย์ที่นี่...");
  const [note, setNote] = useState("-");

  // 🟢 ประกอบตัวแปรเป็น HTML Code อัตโนมัติ
  const generatedHtml = `<link href="https://midsummer-reverie.github.io/rpth-code/lrv-luminight-rp.css" rel="stylesheet">
<div class="lmnsrp-box" style="--lmnsrp-bg: #131313; --lmnsrp-acc1: ${acc1}; --lmnsrp-acc2: ${acc2}; --lmnsrp-txt: #fff; --lmnsrp-pic1: url(${pic1}) 50% 4%/cover; --lmnsrp-pic2: url(${pic2}) center/cover;">
  <div class="lmnsrp-headgrid">
    <div class="lmnsrp-class">${classType}</div>
    <div class="lmnsrp-rank">${rank}</div>
    <div class="lmnsrp-namegrid">
      <div class="lmnsrp-jpn">${jpnName}</div>
      <div class="lmnsrp-spark" style="width: ${spark}%;"></div>
      <div class="lmnsrp-sn">${sn}</div>
    </div>
    <div class="lmnsrp-fn">${fn}</div>
    <div class="lmnsrp-deco1"></div>
  </div>
  <div class="lmnsrp-picflex">
    <div class="lmnsrp-pic1"></div>
    <div class="lmnsrp-pic2"></div>
    <div class="lmnsrp-deco2"></div>
  </div>
  <div class="lmnsrp-deco3"></div>
  <div class="lmnsrp-loc">${loc}</div>
  <div class="lmnsrp-content">
${rpContent}
  </div>
  <div class="lmnsrp-note">${note}</div>
  <div class="lmnsrp-deco4"></div>
</div>`;

  return (
    <div
      style={{
        background: "rgba(12, 10, 16, 0.95)",
        border: "1px solid #38c8ff66",
        padding: "20px",
        marginBottom: "20px",
        borderRadius: "0px",
      }}
    >
      <div style={{ color: "#38c8ff", fontWeight: "bold", fontSize: "15px", marginBottom: "14px" }}>
        🛠️ เครื่องมือสร้างและแทนค่าตัวแปรการ์ดโรลเพลย์ (RP Code Variable Builder)
      </div>

      {/* Grid สำหรับแทนค่าตัวแปรต่าง ๆ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "14px" }}>
        <div>
          <label style={{ fontSize: "11px", color: "#aaa", display: "block" }}>ประเภท (Class)</label>
          <select value={classType} onChange={(e) => setClassType(e.target.value)} style={{ width: "100%", padding: "8px", background: "#000", border: "1px solid #444", color: "#fff" }}>
            <option value="esper">esper</option>
            <option value="guide">guide</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: "11px", color: "#aaa", display: "block" }}>Rank</label>
          <select value={rank} onChange={(e) => setRank(e.target.value)} style={{ width: "100%", padding: "8px", background: "#000", border: "1px solid #444", color: "#fff" }}>
            {["s", "a", "b", "c", "d", "e", "f"].map((r) => (
              <option key={r} value={r}>{r.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: "11px", color: "#aaa", display: "block" }}>ชื่อคันจิ / ภาษาญี่ปุ่น (JPN)</label>
          <input type="text" value={jpnName} onChange={(e) => setJpnName(e.target.value)} style={{ width: "100%", padding: "8px", background: "#000", border: "1px solid #444", color: "#fff" }} />
        </div>

        <div>
          <label style={{ fontSize: "11px", color: "#aaa", display: "block" }}>นามสกุล (SN)</label>
          <input type="text" value={sn} onChange={(e) => setSn(e.target.value)} style={{ width: "100%", padding: "8px", background: "#000", border: "1px solid #444", color: "#fff" }} />
        </div>

        <div>
          <label style={{ fontSize: "11px", color: "#aaa", display: "block" }}>ชื่อต้น (FN)</label>
          <input type="text" value={fn} onChange={(e) => setFn(e.target.value)} style={{ width: "100%", padding: "8px", background: "#000", border: "1px solid #444", color: "#fff" }} />
        </div>

        <div>
          <label style={{ fontSize: "11px", color: "#aaa", display: "block" }}>Spark % (0 - 100)</label>
          <input type="number" min="0" max="100" value={spark} onChange={(e) => setSpark(e.target.value)} style={{ width: "100%", padding: "8px", background: "#000", border: "1px solid #444", color: "#fff" }} />
        </div>

        <div>
          <label style={{ fontSize: "11px", color: "#aaa", display: "block" }}>โค้ดสี 1 (acc1)</label>
          <div style={{ display: "flex", gap: "6px" }}>
            <input type="color" value={acc1} onChange={(e) => setAcc1(e.target.value)} style={{ width: "32px", height: "32px", background: "none", border: "none", cursor: "pointer" }} />
            <input type="text" value={acc1} onChange={(e) => setAcc1(e.target.value)} style={{ flex: 1, padding: "6px", background: "#000", border: "1px solid #444", color: "#fff" }} />
          </div>
        </div>

        <div>
          <label style={{ fontSize: "11px", color: "#aaa", display: "block" }}>โค้ดสี 2 (acc2)</label>
          <div style={{ display: "flex", gap: "6px" }}>
            <input type="color" value={acc2} onChange={(e) => setAcc2(e.target.value)} style={{ width: "32px", height: "32px", background: "none", border: "none", cursor: "pointer" }} />
            <input type="text" value={acc2} onChange={(e) => setAcc2(e.target.value)} style={{ flex: 1, padding: "6px", background: "#000", border: "1px solid #444", color: "#fff" }} />
          </div>
        </div>

        <div>
          <label style={{ fontSize: "11px", color: "#aaa", display: "block" }}>ลิงก์รูปภาพใหญ่ (pic1)</label>
          <input type="text" value={pic1} onChange={(e) => setPic1(e.target.value)} style={{ width: "100%", padding: "8px", background: "#000", border: "1px solid #444", color: "#fff" }} />
        </div>

        <div>
          <label style={{ fontSize: "11px", color: "#aaa", display: "block" }}>ลิงก์รูปภาพเล็ก (pic2)</label>
          <input type="text" value={pic2} onChange={(e) => setPic2(e.target.value)} style={{ width: "100%", padding: "8px", background: "#000", border: "1px solid #444", color: "#fff" }} />
        </div>

        <div>
          <label style={{ fontSize: "11px", color: "#aaa", display: "block" }}>สถานที่ (loc)</label>
          <input type="text" value={loc} onChange={(e) => setLoc(e.target.value)} style={{ width: "100%", padding: "8px", background: "#000", border: "1px solid #444", color: "#fff" }} />
        </div>

        <div>
          <label style={{ fontSize: "11px", color: "#aaa", display: "block" }}>หมายเหตุ (note)</label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} style={{ width: "100%", padding: "8px", background: "#000", border: "1px solid #444", color: "#fff" }} />
        </div>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <label style={{ fontSize: "11px", color: "#aaa", display: "block", marginBottom: "4px" }}>เนื้อหาบทสนทนา / โรลเพลย์ (content)</label>
        <textarea rows={5} value={rpContent} onChange={(e) => setRpContent(e.target.value)} style={{ width: "100%", padding: "8px", background: "#000", border: "1px solid #444", color: "#fff", fontSize: "13px" }} />
      </div>

      {/* 🟢 Live Preview หน้าการ์ดขณะแทนค่า */}
      <div style={{ border: "1px dashed #38c8ffaa", padding: "12px", background: "#050307", marginBottom: "16px", overflowX: "auto" }}>
        <div style={{ fontSize: "11px", color: "#38c8ff", marginBottom: "8px", fontWeight: "bold" }}>👁️ ตัวอย่างการแสดงผลจริง (Live Preview):</div>
        <div dangerouslySetInnerHTML={{ __html: generatedHtml }} />
      </div>

      <button
        type="button"
        onClick={() => onApplyCode(generatedHtml)}
        style={{
          width: "100%",
          padding: "12px",
          background: "#38c8ff",
          color: "#000",
          fontWeight: "bold",
          border: "none",
          cursor: "pointer",
          fontSize: "14px",
          boxShadow: "0 0 12px rgba(56, 200, 255, 0.4)",
        }}
      >
        ✨ นำโค้ดที่ประกอบตัวแปรแล้ว ใส่ในช่องเนื้อหากระทู้
      </button>
    </div>
  );
}