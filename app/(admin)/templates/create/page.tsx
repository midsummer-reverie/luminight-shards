"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type VariableDef = { name: string; type: string; label: string; options?: string };
type BlockDef = { id: string; name: string; placeholder: string; html: string; postVariables: VariableDef[] };
type TemplateData = { id: number; name: string; htmlContent: string; cssLink: string; schemaJson: any };

export default function CreateTemplatePage() {
  const [templateList, setTemplateList] = useState<TemplateData[]>([]);
  const [selectedId, setSelectedId] = useState<string>("new");
  const [isSaving, setIsSaving] = useState(false);
  
  const [name, setName] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [cssLink, setCssLink] = useState("");

  const [studioVariables, setStudioVariables] = useState<VariableDef[]>([]);
  const [postVariables, setPostVariables] = useState<VariableDef[]>([]);
  const [blocks, setBlocks] = useState<BlockDef[]>([]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/admin/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplateList(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedId === "new") {
      setName(""); setHtmlContent(""); setCssLink("");
      setStudioVariables([]); setPostVariables([]); setBlocks([]);
    } else {
      const t = templateList.find((x) => x.id.toString() === selectedId);
      if (t) {
        setName(t.name || "");
        setHtmlContent(t.htmlContent || "");
        setCssLink(t.cssLink || "");
        setStudioVariables(t.schemaJson?.studioVariables || []);
        setPostVariables(t.schemaJson?.postVariables || []);
        setBlocks(t.schemaJson?.blocks || []);
      }
    }
  }, [selectedId, templateList]);

  const addVar = (setter: any, state: any) => setter([...state, { name: "", type: "text", label: "", options: "" }]);
  const removeVar = (setter: any, state: any, index: number) => setter(state.filter((_: any, i: number) => i !== index));
  const updateVar = (setter: any, state: any, index: number, field: string, value: string) => {
    const newVal = [...state];
    newVal[index][field] = value;
    setter(newVal);
  };

  const addBlock = () => setBlocks([...blocks, { id: `block_${Date.now()}`, name: "", placeholder: "{{BLOCK}}", html: "", postVariables: [] }]);
  const removeBlock = (index: number) => setBlocks(blocks.filter((_, i) => i !== index));
  const updateBlock = (index: number, field: string, value: string) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], [field]: value };
    setBlocks(newBlocks);
  };
  const addBlockVar = (blockIndex: number) => {
    const newBlocks = [...blocks];
    newBlocks[blockIndex].postVariables.push({ name: "", type: "text", label: "", options: "" });
    setBlocks(newBlocks);
  };
  const removeBlockVar = (blockIndex: number, varIndex: number) => {
    const newBlocks = [...blocks];
    newBlocks[blockIndex].postVariables = newBlocks[blockIndex].postVariables.filter((_, i) => i !== varIndex);
    setBlocks(newBlocks);
  };
  const updateBlockVar = (blockIndex: number, varIndex: number, field: string, value: string) => {
    const newBlocks = [...blocks];
    newBlocks[blockIndex].postVariables[varIndex] = { ...newBlocks[blockIndex].postVariables[varIndex], [field]: value };
    setBlocks(newBlocks);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const isNew = selectedId === "new";
    const payload = {
      id: isNew ? undefined : Number(selectedId),
      name, htmlContent, cssLink,
      schemaJson: { studioVariables, postVariables, blocks }
    };

    try {
      const res = await fetch("/api/admin/templates", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(isNew ? "✨ สร้างเทมเพลตใหม่สำเร็จ!" : "💾 อัปเดตเทมเพลตสำเร็จ!");
        await fetchTemplates(); 
        if (isNew) {
          const newData = await res.json();
          setSelectedId(newData.id.toString());
        }
      } else {
        alert("❌ เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (err) {
      alert("❌ เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-page-wrapper">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;600;700&display=swap');
        .admin-page-wrapper { min-height: 100vh; background: #09050e; color: #e2e8f0; font-family: 'Google Sans', sans-serif; padding: 40px 20px; box-sizing: border-box; }
        .admin-page-wrapper * { box-sizing: border-box; }
        .container { max-width: 900px; margin: 0 auto; width: 100%; }
        .header-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
        .page-title { font-size: 1.8rem; font-weight: bold; margin: 10px 0 0 0; color: #f472b6; }
        .back-link { color: #a78bfa; text-decoration: none; font-size: 0.9rem; font-weight: 600; }
        .glass-panel { background: rgba(20, 15, 30, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .section-title { font-size: 1.2rem; font-weight: bold; margin: 0; }
        .title-1 { color: #22d3ee; } .title-2 { color: #f472b6; } .title-3 { color: #4ade80; } .title-4 { color: #c084fc; }
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 0.85rem; color: #94a3b8; margin-bottom: 6px; font-weight: 600; }
        .glass-input { width: 100%; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; padding: 10px 14px; border-radius: 8px; outline: none; font-family: inherit; }
        .code-area { font-family: monospace; height: 350px; resize: vertical; color: #e9d5ff; }
        .var-row { display: flex; gap: 12px; align-items: center; background: rgba(0, 0, 0, 0.3); padding: 12px; border-radius: 10px; margin-bottom: 10px; border: 1px solid rgba(255, 255, 255, 0.03); flex-wrap: wrap; }
        .var-input { flex: 1; min-width: 150px; }
        .options-input { flex-basis: 100%; margin-top: 4px; border-color: rgba(192, 132, 252, 0.5); font-size: 0.85rem; }
        .btn-add { background: rgba(244, 114, 182, 0.1); color: #f472b6; border: 1px dashed #f472b6; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: bold; cursor: pointer; }
        .btn-remove { background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: bold; }
        .btn-submit { background: linear-gradient(135deg, #c084fc, #db2777); color: #fff; width: 100%; padding: 16px; border: none; border-radius: 12px; font-size: 1.1rem; font-weight: bold; cursor: pointer; margin-top: 10px; }
        .block-card { background: rgba(0,0,0,0.4); border: 1px solid rgba(192, 132, 252, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 16px; position: relative; }
        .block-header-btn { position: absolute; top: 16px; right: 16px; }
        .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px; }
        .empty-text { text-align: center; color: #64748b; font-size: 0.9rem; padding: 20px; border: 1px dashed rgba(255,255,255,0.1); border-radius: 10px; }
      `}} />

      <div className="container">
        <div className="header-row">
          <div>
            <Link href="/studio" className="back-link">← กลับไปหน้า Code Studio</Link>
            <h1 className="page-title">⚙️ Manage Templates</h1>
          </div>
          <button onClick={handleSave} disabled={isSaving} className="btn-add" style={{ background: '#db2777', color: '#fff', border: 'none', padding: '10px 20px' }}>
            {isSaving ? "กำลังบันทึก..." : (selectedId === "new" ? "✨ บันทึกสร้างใหม่" : "💾 อัปเดตข้อมูล")}
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '16px 24px', borderColor: '#c084fc', background: 'rgba(192, 132, 252, 0.1)' }}>
          <label className="form-label" style={{ color: '#e9d5ff' }}>เลือกเทมเพลตที่ต้องการจัดการ:</label>
          <select className="glass-input" style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#fbcfe8' }} value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            <option value="new">✨ + สร้างเทมเพลตใหม่</option>
            <optgroup label="แก้ไขเทมเพลตเดิม">
              {templateList.map(t => <option key={t.id} value={t.id.toString()}>✏️ {t.name}</option>)}
            </optgroup>
          </select>
        </div>

        {/* 1. HTML & CSS */}
        <div className="glass-panel">
          <div className="section-header"><h2 className="section-title title-1">1. โครงสร้าง HTML & CSS</h2></div>
          <div className="form-group">
            <label className="form-label">ชื่อเทมเพลต</label>
            <input type="text" className="glass-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น ธีมสายดาร์ก V1" />
          </div>
          <div className="form-group">
            <label className="form-label">HTML Content</label>
            <textarea className="glass-input code-area" value={htmlContent} onChange={(e) => setHtmlContent(e.target.value)} placeholder="<div class='box'>...</div>" />
          </div>
          <div className="form-group">
            <label className="form-label">CSS Link (ถ้ามี)</label>
            <input type="text" className="glass-input" value={cssLink} onChange={(e) => setCssLink(e.target.value)} />
          </div>
        </div>

        {/* 2. Studio Variables */}
        <div className="glass-panel">
          <div className="section-header">
            <h2 className="section-title title-2">2. Studio Variables (**ตัวแปร**)</h2>
            <button onClick={() => addVar(setStudioVariables, studioVariables)} className="btn-add">+ เพิ่มตัวแปร</button>
          </div>
          {studioVariables.map((v, index) => (
            <div key={index} className="var-row">
              <input placeholder="ป้ายกำกับ (เช่น ขนาดฟอนต์)" className="glass-input var-input" value={v.label} onChange={(e) => updateVar(setStudioVariables, studioVariables, index, "label", e.target.value)} />
              <input placeholder="ตัวแปร (เช่น fontSize)" className="glass-input var-input" style={{ color: '#fbcfe8' }} value={v.name} onChange={(e) => updateVar(setStudioVariables, studioVariables, index, "name", e.target.value)} />
              <select className="glass-input" style={{ width: 'auto' }} value={v.type} onChange={(e) => updateVar(setStudioVariables, studioVariables, index, "type", e.target.value)}>
                <option value="text">Text</option>
                <option value="color">Color</option>
                <option value="gradient">Gradient</option>
                <option value="image">Image URL</option>
                <option value="number">Number (Slider)</option>
                <option value="dropdown">Dropdown</option>
              </select>
              <button onClick={() => removeVar(setStudioVariables, studioVariables, index)} className="btn-remove">✕</button>
              
              {v.type === 'dropdown' && (
                <input placeholder="ระบุตัวเลือก เช่น: แดง=#ff0000, ดำ=#000" className="glass-input options-input" value={v.options || ""} onChange={(e) => updateVar(setStudioVariables, studioVariables, index, "options", e.target.value)} />
              )}

              {/* 🟢 เพิ่มช่องกำหนดค่า Min, Max, Step สำหรับประเภท Number */}
              {v.type === 'number' && (
                <input placeholder="กำหนดค่า เช่น min=10, max=100, step=1 (ค่าเริ่มต้น 0-100)" className="glass-input options-input" style={{ borderColor: 'rgba(34, 211, 238, 0.4)' }} value={v.options || ""} onChange={(e) => updateVar(setStudioVariables, studioVariables, index, "options", e.target.value)} />
              )}
            </div>
          ))}
          {studioVariables.length === 0 && <div className="empty-text">ยังไม่มีตัวแปร Studio</div>}
        </div>

        {/* 3. Post Variables */}
        <div className="glass-panel">
          <div className="section-header">
            <h2 className="section-title title-3">3. Post Variables ([[ตัวแปร]])</h2>
            <button onClick={() => addVar(setPostVariables, postVariables)} className="btn-add" style={{ color: '#4ade80', borderColor: '#4ade80' }}>+ เพิ่มตัวแปร</button>
          </div>
          {postVariables.map((v, index) => (
            <div key={index} className="var-row">
              <input placeholder="ป้ายกำกับ" className="glass-input var-input" value={v.label} onChange={(e) => updateVar(setPostVariables, postVariables, index, "label", e.target.value)} />
              <input placeholder="ตัวแปร" className="glass-input var-input" style={{ color: '#bbf7d0' }} value={v.name} onChange={(e) => updateVar(setPostVariables, postVariables, index, "name", e.target.value)} />
              <select className="glass-input" style={{ width: 'auto' }} value={v.type} onChange={(e) => updateVar(setPostVariables, postVariables, index, "type", e.target.value)}>
                <option value="bbcode">BBCode</option>
                <option value="text">Text</option>
                <option value="dropdown">Dropdown</option>
              </select>
              <button onClick={() => removeVar(setPostVariables, postVariables, index)} className="btn-remove">✕</button>
              {v.type === 'dropdown' && (
                <input placeholder="ระบุตัวเลือก เช่น: ตัวเลือก1=1, ตัวเลือก2=2" className="glass-input options-input" value={v.options || ""} onChange={(e) => updateVar(setPostVariables, postVariables, index, "options", e.target.value)} />
              )}
            </div>
          ))}
          {postVariables.length === 0 && <div className="empty-text">ยังไม่มีตัวแปร Post</div>}
        </div>

        {/* 4. Blocks */}
        <div className="glass-panel">
          <div className="section-header">
            <h2 className="section-title title-4">4. Dynamic Blocks</h2>
            <button onClick={addBlock} className="btn-add" style={{ color: '#c084fc', borderColor: '#c084fc' }}>+ เพิ่ม Block</button>
          </div>
          {blocks.map((block, bIndex) => (
            <div key={bIndex} className="block-card">
              <button onClick={() => removeBlock(bIndex)} className="btn-remove block-header-btn">ลบบล็อก</button>
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">ID</label>
                  <input type="text" className="glass-input" value={block.id} onChange={(e) => updateBlock(bIndex, "id", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">ชื่อบล็อก</label>
                  <input type="text" className="glass-input" value={block.name} onChange={(e) => updateBlock(bIndex, "name", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Placeholder</label>
                  <input type="text" className="glass-input" value={block.placeholder} onChange={(e) => updateBlock(bIndex, "placeholder", e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">HTML</label>
                <textarea className="glass-input code-area" style={{ height: '80px' }} value={block.html} onChange={(e) => updateBlock(bIndex, "html", e.target.value)} />
              </div>
            </div>
          ))}
          {blocks.length === 0 && <div className="empty-text">ไม่มีบล็อกส่วนเสริม</div>}
        </div>

        <button onClick={handleSave} disabled={isSaving} className="btn-submit">
          {isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
        </button>
      </div>
    </div>
  );
}