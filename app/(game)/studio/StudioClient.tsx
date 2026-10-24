"use client";

import React, { useState, useEffect, useMemo, useLayoutEffect, useRef } from "react";
import { renderTemplate } from "@/utils/templateEngine";
import Link from "next/link";

// ============================================================
// 🖥️ ScaledPreview: จำลองหน้าจอ Desktop จริง ย่อสเกลสมูท
// ============================================================
const BOARD_WIDTH = 900;
const REF_WIDTHS = [1920, 1440, 1280];
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function ScaledPreview({ html, cssLink }: { html: string; cssLink?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [refWidth, setRefWidth] = useState(1280);
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
  const sizerW = refWidth * scale;
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

  const iframeHeight = size.h ? size.h / scale : 0;

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
  #board{width:${BOARD_WIDTH}px;max-width:100%;padding:40px 20px;box-sizing:border-box;color:#fff}
  #board img,#board video{max-width:100%;height:auto}
  ${cssLink ? `@import url('${cssLink}');` : ''}
</style></head>
<body><div id="board">${html}</div></body></html>`, [html, cssLink]);

  const lightBtn = (active: boolean): React.CSSProperties => ({
    background: active ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.06)',
    border: active ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
    color: active ? '#f3e8ff' : '#d4d4d8',
    padding: '2px 6px',
    borderRadius: '6px',
    fontSize: '0.72rem',
    cursor: 'pointer',
    fontWeight: active ? 'bold' : 'normal',
    transition: '0.15s'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, minWidth: 0, width: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '6px 10px', display: 'flex', gap: 6, alignItems: 'center', background: '#1c1c1c', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap', overflowX: 'auto' }}>
        <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>จอ:</span>
        <div style={{ display: 'flex', gap: 3 }}>
          {REF_WIDTHS.map(w => (
            <button key={w} style={lightBtn(refWidth === w)} onClick={() => setRefWidth(w)}>{w}</button>
          ))}
        </div>
        <div style={{ width: 1, height: 14, background: '#3f3f46', margin: '0 2px' }} />
        <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>ซูม:</span>
        <button style={{ ...lightBtn(false), padding: '2px 5px' }} onClick={() => setZoom(z => clampZoom(z - 5))}>−</button>
        <input type="range" min={25} max={200} step={5} value={zoom} onChange={e => setZoom(Number(e.target.value))} style={{ width: 65, accentColor: '#a855f7', cursor: 'pointer' }} />
        <button style={{ ...lightBtn(false), padding: '2px 5px' }} onClick={() => setZoom(z => clampZoom(z + 5))}>+</button>
        <span style={{ color: '#e4e4e7', fontSize: '0.72rem', minWidth: 28, textAlign: 'right' }}>{zoom}%</span>
        <div style={{ width: 1, height: 14, background: '#3f3f46', margin: '0 2px' }} />
        <div style={{ display: 'flex', gap: 3 }}>
          <button style={lightBtn(zoom === 100)} onClick={() => setZoom(100)}>100%</button>
          <button style={lightBtn(zoom === fitBoardZoom)} onClick={() => { centerRatio.current = 0.5; setZoom(fitBoardZoom); }}>พอดีบอร์ด</button>
        </div>
      </div>
      <div ref={wrapRef} className="custom-scrollbar" onScroll={handleScroll} style={{ flex: 1, minHeight: 0, minWidth: 0, width: '100%', overflowX: 'auto', overflowY: 'hidden', background: '#131313', visibility: fitted ? 'visible' : 'hidden' }}>
        <div style={{ position: 'relative', width: sizerW, height: size.h, margin: '0 auto' }}>
          <iframe title="Live Preview" srcDoc={srcDoc} sandbox="allow-scripts allow-popups" style={{ position: 'absolute', top: 0, left: 0, border: 0, background: '#131313', width: refWidth, height: iframeHeight, transform: `scale(${scale})`, transformOrigin: 'top left' }} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 🖼️ Image Field Helpers
// ============================================================
type SizeMode = 'cover' | 'contain' | 'auto' | 'percent' | 'percent_both' | 'px';
type PosMode = 'percent' | 'keyword' | 'px';
type KeyX = 'left' | 'center' | 'right';
type KeyY = 'top' | 'center' | 'bottom';

interface ImgData {
  url: string;
  posMode: PosMode;
  x: number;
  y: number;
  kx: KeyX;
  ky: KeyY;
  zoom: number;
  zoomH?: number;
  sizeMode: SizeMode;
  repeat: string;
}

const KEY_X: KeyX[] = ['left', 'center', 'right'];
const KEY_Y: KeyY[] = ['top', 'center', 'bottom'];
const POS_MODES = [{ value: 'percent', label: '% (50% 50%)' }, { value: 'keyword', label: 'คำสั่ง' }, { value: 'px', label: 'พิกเซล' }];
const SIZE_MODES = [{ value: 'cover', label: 'cover' }, { value: 'contain', label: 'contain' }, { value: 'percent', label: 'กว้าง %' }, { value: 'auto', label: 'auto' }];
const REPEAT_OPTIONS = [{ value: 'no-repeat', label: 'no-repeat' }, { value: 'repeat', label: 'repeat' }, { value: '', label: 'ไม่ใส่' }];

const makeImg = (o: any = {}): ImgData => ({
  url: "", posMode: 'percent', x: 50, y: 50, kx: 'center', ky: 'center',
  zoom: 100, sizeMode: 'percent', repeat: 'no-repeat', ...(o || {}),
});

const cssUrl = (u: string) => `url('${String(u).trim().replace(/'/g, '%27').replace(/\\/g, '%5C')}')`;
const imgSizeCss = (d: ImgData): string => {
  switch (d.sizeMode) {
    case 'cover': case 'contain': case 'auto': return d.sizeMode;
    case 'percent_both': return `${d.zoom}% ${d.zoomH ?? d.zoom}%`;
    case 'px': return `${d.zoom}px`;
    default: return `${d.zoom}%`;
  }
};
const imgPosCss = (d: ImgData): string => {
  switch (d.posMode) {
    case 'keyword': return `${d.kx} ${d.ky}`;
    case 'px': return `${d.x}px ${d.y}px`;
    default: return `${d.x}% ${d.y}%`;
  }
};
const imgToCss = (d: ImgData) => `${cssUrl(d.url)} ${imgPosCss(d)} / ${imgSizeCss(d)}${d.repeat ? ' ' + d.repeat : ''}`;

function ImageFieldEditor({ field, val, onChange }: { field: any; val: any; onChange: (v: any) => void }) {
  const d = makeImg(val);
  const set = (patch: Partial<ImgData>) => onChange({ ...d, ...patch });
  const hasUrl = d.url.trim() !== '';

  return (
    <div className="img-ed">
      <div className="img-row">
        <input type="url" className="glass-input" style={{ height: 32, padding: '4px 10px', fontSize: '0.85rem', flex: 1 }} placeholder="วางลิงก์รูปภาพ (https://...)" value={d.url} onChange={e => set({ url: e.target.value })} />
        <button type="button" className="tool-btn img-reset" title="รีเซ็ตค่า" onClick={() => onChange(makeImg({ url: d.url }))}>↺</button>
      </div>

      {hasUrl && (
        <div className="img-row" style={{ alignItems: 'center', gap: 8 }}>
          <div className="img-thumb" style={{ backgroundImage: cssUrl(d.url), backgroundPosition: imgPosCss(d), backgroundSize: imgSizeCss(d) }} />
          <code className="img-code">{imgPosCss(d)} / {imgSizeCss(d)}</code>
        </div>
      )}

      <div className="img-grid3">
        <label className="img-cap">ตำแหน่ง
          <select className="img-mini" value={d.posMode} onChange={e => set({ posMode: e.target.value as PosMode })}>
            {POS_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </label>
        <label className="img-cap">ขนาด
          <select className="img-mini" value={d.sizeMode} onChange={e => set({ sizeMode: e.target.value as SizeMode })}>
            {SIZE_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </label>
        <label className="img-cap">ซ้ำรูป
          <select className="img-mini" value={d.repeat} onChange={e => set({ repeat: e.target.value })}>
            {REPEAT_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </label>
      </div>

      {d.posMode === 'keyword' ? (
        <div className="img-row">
          <div className="pos-pad">
            {KEY_Y.map(ky => KEY_X.map(kx => (
              <button type="button" key={`${kx}_${ky}`} className={`pos-cell ${d.kx === kx && d.ky === ky ? 'on' : ''}`} onClick={() => set({ kx, ky })} />
            )))}
          </div>
          <code className="img-code">{d.kx} {d.ky}</code>
        </div>
      ) : (
        <div className="img-grid2">
          {(['x', 'y'] as const).map(ax => (
            <div key={ax} className="img-row">
              <span className="img-lbl">{ax.toUpperCase()}</span>
              <input type="range" className="img-range" min={d.posMode === 'px' ? -1000 : 0} max={d.posMode === 'px' ? 1000 : 100} value={d[ax]} onChange={e => set({ [ax]: Number(e.target.value) } as any)} />
              <input type="number" className="img-mini img-num" value={d[ax]} onChange={e => set({ [ax]: Number(e.target.value) } as any)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// StudioClient Component
// ============================================================
export default function StudioClient({ 
  initialTemplates, 
  initialCharacters, 
  initialSavedCodes = [], 
  isAdmin = false 
}: { 
  initialTemplates: any[], 
  initialCharacters: any[], 
  initialSavedCodes?: any[], 
  isAdmin?: boolean 
}) {
  const [saving, setSaving] = useState(false);
  const [templates] = useState<any[]>(initialTemplates);
  const [characters] = useState<any[]>(initialCharacters);
  const [savedCodes, setSavedCodes] = useState<any[]>(initialSavedCodes);

  const [selectedSavedCodeId, setSelectedSavedCodeId] = useState("");
  const [customName, setCustomName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedChars, setSelectedChars] = useState<number[]>([]);
  
  const [studioVars, setStudioVars] = useState<Record<string, any>>({});
  const [activeBlocks, setActiveBlocks] = useState<string[]>([]);

  // 📦 LocalStorage Draft System
  const [drafts, setDrafts] = useState<{ name: string; values: any; blocks: string[] }[]>([]);
  const [draftName, setDraftName] = useState("");

  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

  useEffect(() => {
    try {
      const local = localStorage.getItem("studio_drafts");
      if (local) setDrafts(JSON.parse(local));
    } catch (e) {}
  }, []);

  const saveDraft = () => {
    if (!draftName.trim()) return alert("กรุณาตั้งชื่อดราฟต์");
    const updated = [{ name: draftName, values: { ...studioVars }, blocks: [...activeBlocks] }, ...drafts];
    setDrafts(updated);
    localStorage.setItem("studio_drafts", JSON.stringify(updated));
    setDraftName("");
    alert("✨ บันทึกดราฟต์ในเครื่องสำเร็จ!");
  };

  const loadDraft = (idx: number) => {
    const d = drafts[idx];
    if (d) {
      setStudioVars(d.values || {});
      setActiveBlocks(d.blocks || []);
    }
  };

  const deleteDraft = (idx: number) => {
    const updated = drafts.filter((_, i) => i !== idx);
    setDrafts(updated);
    localStorage.setItem("studio_drafts", JSON.stringify(updated));
  };

  // 📂 โหลดโค้ดเก่าจาก DB มาแก้ไข
  useEffect(() => {
    if (!selectedSavedCodeId) return;
    const found = savedCodes.find(c => c.id.toString() === selectedSavedCodeId);
    if (found) {
      setCustomName(found.customName || found.name || "");
      setSelectedTemplateId(found.templateId?.toString() || "");
      setSelectedChars(found.characterIds || []);
      
      const parsedValues = typeof found.studioValuesJson === 'string' 
        ? JSON.parse(found.studioValuesJson) 
        : (found.studioValuesJson || {});

      setStudioVars(parsedValues.variables || {});
      setActiveBlocks(parsedValues.blocksLayout || []);
    }
  }, [selectedSavedCodeId, savedCodes]);

  const activeTemplate = useMemo(() => {
    return templates.find(t => t.id.toString() === selectedTemplateId);
  }, [selectedTemplateId, templates]);

  useEffect(() => {
    if (selectedSavedCodeId || !activeTemplate) return;
    const initial: Record<string, any> = {};
    activeTemplate.schemaJson?.studioVariables?.forEach((v: any) => {
      if (v.type === 'image' || v.type === 'image_url') {
        initial[v.name] = makeImg();
      } else {
        initial[v.name] = "";
      }
    });
    setStudioVars(initial);
    setActiveBlocks([]);
  }, [activeTemplate, selectedSavedCodeId]);

  const toggleCharacter = (id: number) => {
    setSelectedChars(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const insertTag = (refKey: string, openTag: string, closeTag: string = '') => {
    const el = textareaRefs.current[refKey];
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const currentVal = studioVars[refKey] || "";
    const before = currentVal.substring(0, start);
    const selected = currentVal.substring(start, end);
    const after = currentVal.substring(end);

    const newVal = before + openTag + selected + closeTag + after;
    setStudioVars({ ...studioVars, [refKey]: newVal });
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + openTag.length, start + openTag.length + selected.length);
    }, 0);
  };

  const handleSave = async () => {
    if (!selectedTemplateId || !customName) return alert("กรุณาตั้งชื่อและเลือกเทมเพลต");
    setSaving(true);
    
    const payload = {
      id: selectedSavedCodeId ? Number(selectedSavedCodeId) : undefined,
      templateId: Number(selectedTemplateId),
      customName,
      characterIds: selectedChars,
      studioValuesJson: { variables: studioVars, blocksLayout: activeBlocks }
    };

    try {
      const method = selectedSavedCodeId ? "PUT" : "POST";
      const res = await fetch("/api/studio", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) alert("✨ บันทึกการเปลี่ยนแปลงเรียบร้อย!");
      else alert("❌ เกิดข้อผิดพลาดในการบันทึก");
    } catch (err) {
      alert("❌ เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setSaving(false);
    }
  };

  const previewHtml = useMemo(() => {
    if (!activeTemplate) return "<div style='color:#a78bfa; text-align:center; padding:40px;'>เลือกเทมเพลตเพื่อดูพรีวิว</div>";

    const dummyPostValues: any = { variables: {}, blocksData: {} };
    activeTemplate.schemaJson?.postVariables?.forEach((v: any) => {
      dummyPostValues.variables[v.name] = `(จำลอง) ${v.label}`;
    });

    activeBlocks.forEach((blockId, index) => {
      const blockInstanceId = `${blockId}_${index}`;
      dummyPostValues.blocksData[blockInstanceId] = {};
      const blockDef = activeTemplate.schemaJson?.blocks?.find((b: any) => b.id === blockId);
      blockDef?.postVariables?.forEach((v: any) => {
        dummyPostValues.blocksData[blockInstanceId][v.name] = `(บล็อก) ${v.label}`;
      });
    });

    const processedStudioVars = { ...studioVars };
    activeTemplate.schemaJson?.studioVariables?.forEach((v: any) => {
      if (v.type === 'image' || v.type === 'image_url') {
        const imgData = makeImg(studioVars[v.name]);
        // 🟢 ส่งออกคำสั่ง CSS เต็มรูปแบบ url('...') pos / size repeat
        processedStudioVars[v.name] = imgData.url ? imgToCss(imgData) : '';
      }
    });

    return renderTemplate(
      activeTemplate.htmlContent, 
      activeTemplate.schemaJson, 
      { variables: processedStudioVars, blocksLayout: activeBlocks.map((b,i)=>`${b}_${i}`) }, 
      dummyPostValues
    );
  }, [activeTemplate, studioVars, activeBlocks]);

  return (
    <div className="studio-wrapper">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;600;700&display=swap');
        .studio-wrapper { min-height: 100vh; background: #09050e; color: #e2e8f0; font-family: 'Google Sans', sans-serif; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
        .studio-wrapper * { box-sizing: border-box; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(168, 85, 247, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(168, 85, 247, 0.5); }

        .glass-input { width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px 14px; border-radius: 8px; outline: none; transition: 0.2s; font-family: 'Google Sans', sans-serif; }
        .glass-input:focus { border-color: #a855f7; box-shadow: 0 0 0 2px rgba(168,85,247,0.2); }
        .char-btn { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 6px 12px; border-radius: 20px; cursor: pointer; color: #94a3b8; font-size: 0.85rem; transition: 0.2s; }
        .char-btn.active { background: rgba(168,85,247,0.2); border-color: #a855f7; color: #d8b4fe; }
        .char-avatar { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; background: #333; }
        .btn-primary { background: linear-gradient(135deg, #c084fc, #db2777); color: #fff; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; font-family: 'Google Sans', sans-serif; }
        .btn-secondary { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; cursor: pointer; }
        
        .img-ed { background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; border: 1px dashed rgba(168,85,247,0.3); display: flex; flex-direction: column; gap: 6px; margin-top: 6px; }
        .img-row { display: flex; align-items: center; gap: 6px; min-width: 0; }
        .img-grid3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
        .img-grid2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 10px; }
        .img-cap { display: flex; flex-direction: column; gap: 2px; font-size: 0.68rem; font-weight: 700; color: #c084fc; min-width: 0; }
        .img-lbl { font-size: 0.7rem; font-weight: 700; color: #cbd5e1; min-width: 24px; flex-shrink: 0; }
        .img-unit { font-size: 0.7rem; color: #94a3b8; width: 16px; flex-shrink: 0; }
        .img-mini { height: 26px; padding: 0 6px; font-size: 0.78rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.4); color: #fff; outline: none; width: 100%; }
        .img-num { width: 54px; flex-shrink: 0; padding: 0 4px; text-align: center; }
        .img-range { flex: 1; min-width: 0; height: 16px; margin: 0; accent-color: #a855f7; cursor: pointer; }
        .img-thumb { width: 50px; height: 32px; flex-shrink: 0; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); background-size: cover; background-position: center; }
        .img-code { font-size: 0.68rem; color: #cbd5e1; word-break: break-all; }
        .tool-btn { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 2px 6px; font-size: 0.75rem; color: #d8b4fe; cursor: pointer; }
        .tool-btn:hover { background: rgba(168,85,247,0.3); }
        .pos-pad { display: grid; grid-template-columns: repeat(3, 18px); grid-template-rows: repeat(3, 18px); gap: 2px; flex-shrink: 0; }
        .pos-cell { border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); border-radius: 3px; cursor: pointer; padding: 0; }
        .pos-cell:hover { background: rgba(168,85,247,0.3); }
        .pos-cell.on { background: #a855f7; border-color: #a855f7; }
        .editor-tb { display: flex; gap: 4px; background: rgba(0,0,0,0.3); padding: 4px; border-radius: 6px 6px 0 0; border: 1px solid rgba(255,255,255,0.1); border-bottom: none; }
      `}} />

      <header style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 style={{ fontSize: '1.2rem', margin: 0, color: '#f472b6' }}>🎨 Code Studio</h1>
          {isAdmin && (
            <Link href="/templates/create" style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid #a855f7', color: '#d8b4fe', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 'bold' }}>
              ⚙️ + เพิ่มเทมเพลตใหม่ (Admin)
            </Link>
          )}
        </div>
        <Link href="/" style={{ color: '#a78bfa', textDecoration: 'none', fontSize: '0.9rem' }}>✕ ปิดสตูดิโอ</Link>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Panel */}
        <div className="custom-scrollbar" style={{ width: '440px', background: 'rgba(20, 15, 30, 0.8)', borderRight: '1px solid rgba(255,255,255,0.05)', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* โหลดโค้ดเก่าจาก DB มาแก้ไข */}
          {savedCodes.length > 0 && (
            <div style={{ background: 'rgba(168,85,247,0.08)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(168,85,247,0.2)' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: '#d8b4fe' }}>📂 เลือกโค้ดที่เคยบันทึกไว้มาแก้ไข</label>
              <select className="glass-input" style={{ fontSize: '0.85rem', padding: '8px' }} value={selectedSavedCodeId} onChange={e => setSelectedSavedCodeId(e.target.value)}>
                <option value="">-- สร้างใหม่ / เลือกโค้ดเดิมเพื่อแก้ไข --</option>
                {savedCodes.map(sc => (
                  <option key={sc.id} value={sc.id}>{sc.customName || sc.name || `โค้ด #${sc.id}`}</option>
                ))}
              </select>
            </div>
          )}

          {/* 📝 ระบบ Draft ชั่วคราว */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>💾 ดราฟต์ชั่วคราว (ในเครื่อง)</span>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <input type="text" className="glass-input" style={{ height: 30, padding: '2px 8px', fontSize: '0.8rem' }} placeholder="ชื่อดราฟต์..." value={draftName} onChange={e => setDraftName(e.target.value)} />
              <button className="tool-btn" style={{ flexShrink: 0 }} onClick={saveDraft}>บันทึกดราฟต์</button>
            </div>
            {drafts.length > 0 && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                {drafts.map((df, i) => (
                  <div key={i} style={{ background: 'rgba(168,85,247,0.15)', padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem', display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{ cursor: 'pointer', color: '#d8b4fe' }} onClick={() => loadDraft(i)}>{df.name}</span>
                    <span style={{ cursor: 'pointer', color: '#fca5a5' }} onClick={() => deleteDraft(i)}>✕</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>ชื่อโค้ดของคุณ</label>
            <input type="text" className="glass-input" placeholder="เช่น ธีมจดหมายของน้องเอ" value={customName} onChange={e => setCustomName(e.target.value)} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>เลือกเทมเพลตต้นแบบ</label>
            <select className="glass-input" value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)}>
              <option value="">-- กรุณาเลือก --</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          {activeTemplate && (
            <>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#22d3ee' }}>⚙️ ปรับแต่งดีไซน์</h3>
                
                {activeTemplate.schemaJson?.studioVariables?.map((v: any) => {
                  const isImg = v.type === 'image' || v.type === 'image_url';
                  const isText = v.type === 'richtext' || v.type === 'roleplay';

                  return (
                    <div key={v.name} style={{ marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px' }}>{v.label}</label>
                      
                      {v.type === 'color' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input type="color" style={{ width: '50px', height: '40px', borderRadius: '4px', cursor: 'pointer', background: 'transparent', border: 'none' }} value={studioVars[v.name] || '#ffffff'} onChange={e => setStudioVars({...studioVars, [v.name]: e.target.value})} />
                          <input type="text" className="glass-input" value={studioVars[v.name] || ''} onChange={e => setStudioVars({...studioVars, [v.name]: e.target.value})} placeholder="#000000" />
                        </div>
                      ) : isText ? (
                        <div>
                          <div className="editor-tb">
                            <button className="tool-btn" onClick={() => insertTag(v.name, '[b]', '[/b]')}><b>B</b></button>
                            <button className="tool-btn" onClick={() => insertTag(v.name, '[i]', '[/i]')}><i>I</i></button>
                            <button className="tool-btn" onClick={() => insertTag(v.name, '[u]', '[/u]')}><u>U</u></button>
                            <button className="tool-btn" onClick={() => { const url = prompt("ใส่ URL:"); if(url) insertTag(v.name, `[url=${url}]`, '[/url]'); }}>🔗</button>
                            <button className="tool-btn" onClick={() => { const img = prompt("ใส่ URL รูปภาพ:"); if(img) insertTag(v.name, `[img]${img}`, '[/img]'); }}>🖼️</button>
                          </div>
                          <textarea
                            ref={el => { textareaRefs.current[v.name] = el; }}
                            className="glass-input"
                            style={{ borderRadius: '0 0 8px 8px', minHeight: '80px', resize: 'vertical' }}
                            value={studioVars[v.name] || ''}
                            onChange={e => setStudioVars({ ...studioVars, [v.name]: e.target.value })}
                            placeholder="พิมพ์ข้อความ..."
                          />
                        </div>
                      ) : isImg ? (
                        <ImageFieldEditor 
                          field={v} 
                          val={studioVars[v.name]} 
                          onChange={(newImgVal) => setStudioVars({ ...studioVars, [v.name]: newImgVal })} 
                        />
                      ) : (
                        <input type="text" className="glass-input" value={studioVars[v.name] || ''} onChange={e => setStudioVars({...studioVars, [v.name]: e.target.value})} placeholder="ระบุค่า..." />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Blocks */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#c084fc' }}>🧱 เพิ่มส่วนเสริม</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  {activeTemplate.schemaJson?.blocks?.map((b: any) => (
                    <button key={b.id} onClick={() => setActiveBlocks([...activeBlocks, b.id])} className="btn-secondary">+ {b.name}</button>
                  ))}
                </div>
                {activeBlocks.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeBlocks.map((blockId, index) => {
                      const b = activeTemplate.schemaJson.blocks.find((x:any)=>x.id===blockId);
                      return (
                        <div key={index} style={{ background: 'rgba(168,85,247,0.1)', padding: '8px 12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', color: '#d8b4fe' }}>#{index + 1} {b?.name}</span>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="tool-btn" onClick={() => {
                              if (index === 0) return;
                              const arr = [...activeBlocks];
                              [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
                              setActiveBlocks(arr);
                            }}>⬆️</button>
                            <button className="tool-btn" onClick={() => {
                              if (index === activeBlocks.length - 1) return;
                              const arr = [...activeBlocks];
                              [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
                              setActiveBlocks(arr);
                            }}>⬇️</button>
                            <button onClick={() => setActiveBlocks(activeBlocks.filter((_, i) => i !== index))} style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer' }}>✕</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Character Binding */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>เชื่อมโยงกับตัวละคร (เลือกได้หลายตัว)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {characters.map(char => (
                    <button key={char.id} onClick={() => toggleCharacter(char.id)} className={`char-btn ${selectedChars.includes(char.id) ? 'active' : ''}`}>
                      <img src={char.faceUrl || char.imageMainUrl || "https://placehold.co/100x100?text=No+Img"} alt={char.firstName} className="char-avatar" />
                      <span>{char.firstName} {char.lastName}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? "กำลังบันทึก..." : selectedSavedCodeId ? "💾 อัปเดตโค้ดที่แก้ไข" : "💾 บันทึกเก็บไว้ใช้"}
              </button>
            </>
          )}
        </div>

        {/* Right Panel: ScaledPreview */}
        <div style={{ flex: 1, background: '#131313', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <ScaledPreview html={previewHtml} cssLink={activeTemplate?.cssLink} />
        </div>
      </div>
    </div>
  );
}