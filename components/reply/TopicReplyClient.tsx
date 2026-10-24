"use client";

import React, { useState, useEffect, useMemo, useLayoutEffect, useRef } from "react";
import { renderTemplate } from "@/utils/templateEngine";
import { useRouter } from "next/navigation";
import BBEditor from "@/components/bbcode/BBEditor";
import { renderBB } from "@/lib/bbcode";

// ============================================================
// 🖥️ ScaledPreview (Fix 1280px & Mobile Friendly)
// ============================================================
const REF_WIDTH = 1280; // 🟢 ล็อคขนาดจอที่ 1280px
const BOARD_WIDTH = 1280; // 🟢 ให้ขนาดบอร์ดกว้างเต็ม 1280px
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function ScaledPreview({ html, cssLink }: { html: string; cssLink?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(100);
  const [fitted, setFitted] = useState(false);
  const centerRatio = useRef(0.5);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const clampZoom = (v: number) => Math.min(200, Math.max(25, Math.round(v)));
  const scale = zoom / 100;
  const sizerW = REF_WIDTH * scale;
  const sizerWRef = useRef(sizerW);
  sizerWRef.current = sizerW;

  const fitBoardZoom = size.w ? clampZoom((size.w / BOARD_WIDTH) * 100) : 100;

  useEffect(() => {
    if (fitted || !size.w) return;
    centerRatio.current = 0.5;
    setZoom(clampZoom((size.w / BOARD_WIDTH) * 100));
    setFitted(true);
  }, [size.w, fitted]);

  useIsoLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el || !size.w) return;
    const cw = el.clientWidth;
    el.scrollLeft = sizerW > cw ? Math.max(0, centerRatio.current * sizerW - cw / 2) : 0;
  }, [sizerW, size.w]);

  const handleScroll = () => {
    const el = wrapRef.current;
    if (!el) return;
    const cw = el.clientWidth;
    centerRatio.current = sizerWRef.current > cw ? (el.scrollLeft + cw / 2) / sizerWRef.current : 0.5;
  };

  const iframeHeight = size.h ? Math.max(size.h, 450) / scale : 450;

  const srcDoc = useMemo(() => `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  ::-webkit-scrollbar{width:6px;height:6px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(168,85,247,.4);border-radius:10px}
  ::-webkit-scrollbar-thumb:hover{background:rgba(168,85,247,.6)}
  html,body{margin:0;padding:0;min-height:100%;background:#131313;font-family:'Google Sans',sans-serif}
  body{display:flex;justify-content:center;align-items:flex-start}
  #board{width:${BOARD_WIDTH}px;max-width:100%;padding:20px;box-sizing:border-box;color:#fff}
  #board img,#board video{max-width:100%;height:auto}
  ${cssLink ? `@import url('${cssLink}');` : ''}
</style></head>
<body><div id="board">${html}</div></body></html>`, [html, cssLink]);

  const lightBtn = (active: boolean): React.CSSProperties => ({
    background: active ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.06)',
    border: active ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
    color: active ? '#f3e8ff' : '#d4d4d8',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontWeight: active ? 'bold' : 'normal',
    transition: '0.15s'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, minWidth: 0, width: '100%', overflow: 'hidden' }}>
      {/* 🟢 แถบเครื่องมือซูม Responsive */}
      <div className="preview-toolbar" style={{ padding: '10px 16px', display: 'flex', gap: 10, alignItems: 'center', background: '#1c1c1c', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
        <span style={{ color: '#d8b4fe', fontSize: '0.85rem', fontWeight: 'bold' }}>🖥️ พรีวิว 1280px</span>
        <div style={{ flex: 1, minWidth: '10px' }} />
        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>ซูม:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button type="button" style={{ ...lightBtn(false), padding: '2px 8px' }} onClick={() => setZoom(z => clampZoom(z - 10))}>−</button>
          <input type="range" min={25} max={200} step={5} value={zoom} onChange={e => setZoom(Number(e.target.value))} style={{ width: 80, accentColor: '#a855f7', cursor: 'pointer' }} />
          <button type="button" style={{ ...lightBtn(false), padding: '2px 8px' }} onClick={() => setZoom(z => clampZoom(z + 10))}>+</button>
          <span style={{ color: '#e4e4e7', fontSize: '0.8rem', minWidth: 36, textAlign: 'right' }}>{zoom}%</span>
        </div>
        <div style={{ width: 1, height: 16, background: '#3f3f46', margin: '0 4px' }} className="hide-mobile" />
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" style={lightBtn(zoom === 100)} onClick={() => setZoom(100)}>100%</button>
          <button type="button" style={lightBtn(zoom === fitBoardZoom)} onClick={() => { centerRatio.current = 0.5; setZoom(fitBoardZoom); }}>พอดีจอ</button>
        </div>
      </div>
      
      <div ref={wrapRef} onScroll={handleScroll} style={{ flex: 1, minHeight: "450px", width: '100%', overflowX: 'auto', overflowY: 'hidden', background: '#131313', visibility: fitted ? 'visible' : 'hidden' }}>
        <div style={{ position: 'relative', width: sizerW, height: Math.max(size.h, 450), margin: '0 auto' }}>
          <iframe 
            title="Live Preview" 
            srcDoc={srcDoc} 
            sandbox="allow-scripts allow-popups" 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              border: 0, 
              background: '#131313', 
              width: REF_WIDTH, 
              height: iframeHeight, /* 🟢 เปลี่ยนจาก "100%" เป็น iframeHeight ตรงนี้ครับ */
              transform: `scale(${scale})`, 
              transformOrigin: 'top left' 
            }} 
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ✏️ TopicReplyClient หลัก
// ============================================================
export default function TopicReplyClient({
  slug,
  topicId,
  characters,
  userCodes,
  templates,
}: {
  slug: string;
  topicId: number;
  characters: any[];
  userCodes: any[];
  templates: any[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [selectedCharId, setSelectedCharId] = useState<string>("");
  const [selectedUserCodeId, setSelectedUserCodeId] = useState<string>("");

  const [postVars, setPostVars] = useState<Record<string, string>>({});
  const [activeBlocks, setActiveBlocks] = useState<string[]>([]);
  const [blocksData, setBlocksData] = useState<Record<string, Record<string, string>>>({});

  const availableCodes = useMemo(() => {
    if (!selectedCharId) return userCodes || [];
    const charIdNum = Number(selectedCharId);
    return (userCodes || []).filter((code) => {
      const charIds = Array.isArray(code?.characterIds) ? code.characterIds : [];
      return charIds.length === 0 || charIds.includes(charIdNum);
    });
  }, [selectedCharId, userCodes]);

  const activeUserCode = useMemo(() => {
    return (userCodes || []).find((c) => c.id.toString() === selectedUserCodeId);
  }, [selectedUserCodeId, userCodes]);

  const activeTemplate = useMemo(() => {
    if (!activeUserCode) return null;
    const found = (templates || []).find((t) => t.id === activeUserCode.templateId);
    if (!found) return null;

    let parsedSchema = found.schemaJson;
    if (typeof parsedSchema === "string") {
      try { parsedSchema = JSON.parse(parsedSchema); } catch { parsedSchema = {}; }
    }
    return { ...found, schemaJson: parsedSchema || {} };
  }, [activeUserCode, templates]);

  useEffect(() => {
    if (!activeTemplate || !activeUserCode) {
      setPostVars({});
      setActiveBlocks([]);
      setBlocksData({});
      return;
    }

    const rawStudio = activeUserCode.studioValuesJson;
    const studioData = typeof rawStudio === "string" ? JSON.parse(rawStudio || "{}") : rawStudio || {};
    setActiveBlocks(Array.isArray(studioData.blocksLayout) ? studioData.blocksLayout : []);

    const initialVars: Record<string, string> = {};
    const postVariables = Array.isArray(activeTemplate.schemaJson?.postVariables)
      ? activeTemplate.schemaJson.postVariables
      : [];

    postVariables.forEach((v: any) => {
      if (v?.name) {
        initialVars[v.name] = "";
      }
    });
    setPostVars(initialVars);
  }, [activeUserCode, activeTemplate]);

  const renderedContent = useMemo(() => {
    if (!activeTemplate || !activeUserCode) return "";

    const rawStudio = activeUserCode.studioValuesJson;
    const studioData = typeof rawStudio === "string" ? JSON.parse(rawStudio || "{}") : rawStudio || {};

    const processedVars: Record<string, string> = {};
    for (const key in postVars) {
      const rawText = postVars[key] || "";
      let htmlText = renderBB(rawText) || rawText;
      // 🟢 บังคับแปลงการเคาะ Enter (\n) ทุกจุดให้เป็นแท็ก <br>
      processedVars[key] = htmlText.replace(/\n/g, "<br>"); 
    }

    const processedBlocks: Record<string, any> = {};
    for (const blockId in blocksData) {
      processedBlocks[blockId] = {};
      for (const key in blocksData[blockId]) {
        const rawText = blocksData[blockId][key] || "";
        let htmlText = renderBB(rawText) || rawText;
        // 🟢 บังคับแปลงการเคาะ Enter ในส่วนเสริม (Blocks) ด้วย
        processedBlocks[blockId][key] = htmlText.replace(/\n/g, "<br>");
      }
    }

    return renderTemplate(
      activeTemplate.htmlContent || "",
      activeTemplate.schemaJson || {},
      studioData,
      { variables: processedVars, blocksData: processedBlocks }
    );
  }, [activeTemplate, activeUserCode, postVars, blocksData]);

  const handleSubmit = async () => {
    if (!selectedCharId) return alert("กรุณาเลือกตัวละครที่ใช้ตอบ");
    if (!selectedUserCodeId) return alert("กรุณาเลือกโค้ดธีมที่จะใช้");
    if (!renderedContent) return alert("ไม่สามารถสร้างเนื้อหาโพสต์ได้");

    setSubmitting(true);
    try {
      // 🟢 ตรวจสอบให้แน่ใจว่า URL ตรงกับตำแหน่งไฟล์ route.ts ของคุณ
      const res = await fetch(`/api/forum/${slug}/${topicId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: Number(selectedCharId),
          userCodeId: Number(selectedUserCodeId),
          postValuesJson: { variables: postVars, blocksData },
          renderedHtml: renderedContent,
        }),
      });

      if (res.ok) {
        alert("✨ โพสต์ตอบกระทู้เรียบร้อย!");
        router.refresh();
      } else {
        // 🟢 ดึงข้อความ Error สดๆ จากเซิร์ฟเวอร์มาโชว์ จะได้รู้ว่าพังที่ไหน!
        const errData = await res.json().catch(() => ({}));
        alert(`❌ เซิร์ฟเวอร์แจ้งว่า: ${errData.error || res.statusText || "หาไฟล์ API ไม่เจอ (404)"}`);
      }
    } catch (err: any) {
      alert(`❌ ระบบขัดข้อง: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reply-container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px", color: "#e2e8f0" }}>
      {/* 🟢 CSS รองรับมือถือ (Mobile Responsive) */}
      <style dangerouslySetInnerHTML={{ __html: `
        .glass-panel { background: rgba(20, 15, 30, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px; margin: 30px 0px 24px; }
        .glass-input { width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 12px; border-radius: 8px; outline: none; transition: 0.2s; font-size: 0.95rem; }
        .glass-input:focus { border-color: #a855f7; background: rgba(0,0,0,0.6); box-shadow: 0 0 10px rgba(168, 85, 247, 0.1); }
        .char-card { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 2px solid rgba(255,255,255,0.05); cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); flex: 1; min-width: 200px; }
        .char-card:hover { transform: translateY(-2px); background: rgba(255,255,255,0.08); }
        .char-card.active { background: rgba(168,85,247,0.15); border-color: #a855f7; box-shadow: 0 0 20px rgba(168,85,247,0.3), inset 0 0 10px rgba(168,85,247,0.1); transform: scale(1.02); }
        .char-card.active .char-name { color: #f0abfc; text-shadow: 0 0 8px rgba(244,114,182,0.5); }
        .btn-submit { background: linear-gradient(135deg, #a855f7, #ec4899); color: #fff; border: none; padding: 14px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; font-size: 1.1rem; box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3); transition: 0.2s; }
        .btn-submit:hover { filter: brightness(1.1); transform: translateY(-2px); }
        .responsive-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; marginBottom: 24px; }
        
        /* 📱 Media Queries สำหรับจอมือถือและแท็บเล็ต */
        @media (max-width: 768px) {
          .reply-container { padding: 8px !important; }
          .responsive-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .glass-panel { padding: 16px !important; margin-bottom: 16px !important; }
          h1 { font-size: 1.4rem !important; }
          .preview-toolbar { flex-direction: column; align-items: flex-start !important; gap: 8px !important; }
          .hide-mobile { display: none !important; }
          .char-card { width: 100%; }
        }
      `}} />

      <h1 style={{ fontSize: "1.8rem", marginBottom: "20px", color: "#f0abfc", display: "flex", alignItems: "center", gap: "10px" }}>
        <span>💬</span> เขียนตอบกระทู้
      </h1>

      <div className="glass-panel" style={{ borderTop: "4px solid #a855f7", padding: "0", overflow: "hidden" }}>
        <h3 style={{ margin: 0, padding: "16px 20px", fontSize: "1.1rem", color: "#d8b4fe", display: "flex", justifyContent: "space-between", background: "rgba(0,0,0,0.4)", borderBottom: "1px solid rgba(255,255,255,0.05)", alignItems: "center" }}>
          <span>👁️ ตัวอย่างโพสต์ที่จะแสดงผล</span>
          <span className="hide-mobile" style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "normal" }}>อัปเดตแบบเรียลไทม์</span>
        </h3>
        
        {renderedContent ? (
          <ScaledPreview html={renderedContent} cssLink={activeTemplate?.cssLink} />
        ) : (
          <div style={{ color: "#64748b", textAlign: "center", padding: "60px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <span style={{ fontSize: "2rem" }}>🎭</span>
            <span style={{ fontSize: "0.9rem" }}>กรุณาเลือกตัวละครและโค้ดธีมเพื่อดูพรีวิว</span>
          </div>
        )}
      </div>

      {/* 🟢 Responsive Grid (ยุบเป็น 1 คอลัมน์บนมือถืออัตโนมัติ) */}
      <div className="responsive-grid">
        <div className="glass-panel" style={{ marginBottom: 0 }}>
          <label style={{ display: "block", marginBottom: "12px", fontSize: "1rem", color: "#e2e8f0", fontWeight: "bold" }}>
            1. สวมบทบาทตัวละคร
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {(characters || []).map((char) => (
              <div
                key={char.id}
                className={`char-card ${selectedCharId === char.id.toString() ? "active" : ""}`}
                onClick={() => { setSelectedCharId(char.id.toString()); setSelectedUserCodeId(""); }}
              >
                <img src={char.faceUrl || char.imageMainUrl || "https://placehold.co/100"} alt={char.firstName} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.1)" }} />
                <span className="char-name" style={{ fontSize: "0.95rem", fontWeight: "bold" }}>
                  {char.firstName} {char.lastName}
                  {selectedCharId === char.id.toString() && <span style={{ marginLeft: "8px", color: "#a855f7" }}>✓</span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ marginBottom: 0 }}>
          <label style={{ display: "block", marginBottom: "12px", fontSize: "1rem", color: "#e2e8f0", fontWeight: "bold" }}>
            2. เลือกโค้ดธีมสำเร็จรูป
          </label>
          {!selectedCharId ? (
            <div style={{ padding: "16px", background: "rgba(0,0,0,0.3)", borderRadius: "8px", color: "#64748b", textAlign: "center", fontSize: "0.9rem" }}>
              กรุณาเลือกตัวละครก่อน
            </div>
          ) : (
            <select className="glass-input" value={selectedUserCodeId} onChange={(e) => setSelectedUserCodeId(e.target.value)} style={{ fontSize: "1rem", padding: "14px" }}>
              <option value="">-- กรุณาเลือกโค้ดธีม --</option>
              {availableCodes.map((code) => (
                <option key={code.id} value={code.id}>{code.customName || `โค้ด #${code.id}`}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {activeTemplate && (
        <div className="glass-panel">
          <h3 style={{ margin: "0 0 20px 0", fontSize: "1.1rem", color: "#22d3ee" }}>📝 เนื้อหาบทโรลเพลย์</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {(activeTemplate.schemaJson?.postVariables || []).map((v: any) => (
              <div key={v.name}>
                <BBEditor
                  name={v.name}
                  label={v.label}
                  value={postVars[v.name] || ""}
                  onChange={(val) => setPostVars({ ...postVars, [v.name]: val })}
                  minHeight={v.name.toLowerCase().includes("roleplay") || v.label?.includes("โรลเพลย์") ? 250 : 100}
                  hidePreview={true} 
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: "24px" }}>
            <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-submit">
              {submitting ? "⏳ กำลังส่งคำตอบ..." : "🚀 ยืนยันการตอบกระทู้"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}