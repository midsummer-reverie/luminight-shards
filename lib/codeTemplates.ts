// lib/codeTemplates.ts
import { renderBB } from "./bbcode";

export type CodeType = "roleplay" | "announcement" | "document";

// โครงสร้างข้อมูลที่ใช้เซฟ
export interface SavedCodeProfile {
  id: string;
  type: CodeType;
  name: string; // ชื่อโปรไฟล์ เช่น "อิจิโกะ (ชุดต่อสู้)"
  characterName?: string; // เอาไว้จัดกลุ่มตัวละคร
  data: any; // ข้อมูลย่อยตามแต่ละประเภท
}

// ฟังก์ชันประกอบร่าง: เอากรอบ (Profile) + เนื้อหา (Content) + หมายเหตุ (Note) มารวมเป็น HTML
export function generateFinalHtml(profile: SavedCodeProfile, contentBB: string, noteBB: string): string {
  const contentHtml = renderBB(contentBB).replace(/\n/g, "<br/>");
  const noteHtml = renderBB(noteBB).replace(/\n/g, "<br/>");

  if (profile.type === "roleplay") {
    const d = profile.data;
    const pic1Css = d.pic1?.trim() ? `url('${d.pic1}')` : "";
    const pic2Css = d.pic2?.trim() ? `url('${d.pic2}')` : "";
    
    const styleVars = `--lmnsrp-bg:${d.bg};--lmnsrp-acc1:${d.acc1};--lmnsrp-acc2:${d.acc2};--lmnsrp-txt:${d.txt};--lmnsrp-pic1:${pic1Css};--lmnsrp-pic2:${pic2Css};`;

    return `<link href="https://cdn.jsdelivr.net/gh/midsummer-reverie/rpth-code@refs/heads/main/lrv-luminight-rp.css" rel="stylesheet">
<div class="lmnsrp-box" style="${styleVars}">
  <div class="lmnsrp-headgrid">
    <div class="lmnsrp-class">${renderBB(d.rpClass)}</div>
    <div class="lmnsrp-rank">${renderBB(d.rank)}</div>
    <div class="lmnsrp-namegrid">
      <div class="lmnsrp-jpn">${renderBB(d.nameJpn)}</div>
      <div class="lmnsrp-spark"></div>
      <div class="lmnsrp-sn">${renderBB(d.surname)}</div>
    </div>
    <div class="lmnsrp-fn">${renderBB(d.firstName)}</div>
    <div class="lmnsrp-deco1"></div>
  </div>
  <div class="lmnsrp-picflex">
    <div class="lmnsrp-pic1"></div>
    <div class="lmnsrp-pic2"></div>
    <div class="lmnsrp-deco2"></div>
  </div>
  <div class="lmnsrp-deco3"></div>
  <div class="lmnsrp-loc">${renderBB(d.location)}</div>
  <div class="lmnsrp-content">${contentHtml}</div>
  <div class="lmnsrp-note">${noteHtml}</div>
  <div class="lmnsrp-deco4"></div>
</div>`;
  }

  if (profile.type === "announcement") {
    const d = profile.data;
    return `<div style="background:${d.bg}; border: 2px solid ${d.borderColor}; padding: 20px; color:${d.txt}; font-family: 'Google Sans', sans-serif;">
      <h2 style="color:${d.borderColor}; margin-top:0;">📢 ${renderBB(d.title)}</h2>
      <div style="font-size: 14px;">${contentHtml}</div>
      ${noteHtml ? `<div style="margin-top:16px; font-size:12px; opacity:0.7;">${noteHtml}</div>` : ""}
    </div>`;
  }

  return contentHtml;
}