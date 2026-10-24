import type { TemplateSchema, StudioValues, PostValues } from "@/db/schema";

// 🟢 Helper แปลง Object รูปภาพใน Studio ให้เป็น CSS String เต็มรูปแบบ
function formatImageCss(val: any): string {
  if (!val) return "";
  if (typeof val === "string") return val; // กรณีเป็น Raw URL สตริงธรรมดา

  const url = val.url ? String(val.url).trim().replace(/'/g, "%27").replace(/\\/g, "%5C") : "";
  if (!url) return "";

  // คำนวณ Position
  let pos = `${val.x ?? 50}% ${val.y ?? 50}%`;
  if (val.posMode === "keyword") pos = `${val.kx ?? "center"} ${val.ky ?? "center"}`;
  else if (val.posMode === "px") pos = `${val.x ?? 0}px ${val.y ?? 0}px`;

  // คำนวณ Size
  let size = `${val.zoom ?? 100}%`;
  if (val.sizeMode === "cover" || val.sizeMode === "contain" || val.sizeMode === "auto") {
    size = val.sizeMode;
  } else if (val.sizeMode === "percent_both") {
    size = `${val.zoom ?? 100}% ${val.zoomH ?? val.zoom ?? 100}%`;
  } else if (val.sizeMode === "px") {
    size = `${val.zoom ?? 100}px`;
  }

  const repeat = val.repeat ? ` ${val.repeat}` : "";
  return `url('${url}') ${pos} / ${size}${repeat}`;
}

// 🟢 Escape อักขระพิเศษสำหรับ RegExp
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function renderTemplate(
  rawHtml: string = "",
  schema?: TemplateSchema,
  studioValues?: StudioValues,
  postValues?: PostValues
): string {
  let resultHtml = rawHtml || "";

  const studioVars = studioValues?.variables || {};
  const postVars = postValues?.variables || {};
  const blocksData = postValues?.blocksData || {};
  const blocksLayout = studioValues?.blocksLayout || [];
  const studioVariables = schema?.studioVariables || [];
  const postVariables = schema?.postVariables || [];
  const schemaBlocks = schema?.blocks || [];

  // 1. แปลงค่า Studio Variables (**ชื่อตัวแปร**)
  studioVariables.forEach((v) => {
    const rawVal = studioVars[v.name];
    let value = "";

    if (v.type === "image" || v.type === "image_url" || (typeof rawVal === "object" && rawVal !== null)) {
      value = formatImageCss(rawVal);
    } else {
      value = rawVal !== undefined && rawVal !== null ? String(rawVal) : "";
    }

    const regex = new RegExp(`\\*\\*${escapeRegExp(v.name)}\\*\\*`, "g");
    resultHtml = resultHtml.replace(regex, () => value);
  });

  // 2. แปลงค่า Post Variables ของโครงหลัก ([[ชื่อตัวแปร]])
  postVariables.forEach((v) => {
    const rawVal = postVars[v.name];
    const value = rawVal !== undefined && rawVal !== null ? String(rawVal) : "";
    const regex = new RegExp(`\\[\\[${escapeRegExp(v.name)}\\]\\]`, "g");
    resultHtml = resultHtml.replace(regex, () => value);
  });

  // 3. จัดการ Dynamic Blocks ตาม Placeholder
  const blockGroups: Record<string, string> = {};

  blocksLayout.forEach((blockInstanceId) => {
    const currentBlockData = blocksData[blockInstanceId] || {};
    const blockType = blockInstanceId.split("_")[0];
    const blockDef = schemaBlocks.find((b) => b.id === blockType);

    if (!blockDef) return;

    let currentBlockHtml = blockDef.html || "";

    // แทนที่ [[ตัวแปรโพสต์]] ภายในบล็อก
    (blockDef.postVariables || []).forEach((v) => {
      const rawVal = currentBlockData[v.name];
      const value = rawVal !== undefined && rawVal !== null ? String(rawVal) : "";
      const regex = new RegExp(`\\[\\[${escapeRegExp(v.name)}\\]\\]`, "g");
      currentBlockHtml = currentBlockHtml.replace(regex, () => value);
    });

    const placeholder = blockDef.placeholder;
    if (placeholder) {
      if (!blockGroups[placeholder]) {
        blockGroups[placeholder] = "";
      }
      blockGroups[placeholder] += currentBlockHtml;
    }
  });

  // 4. นำกลุ่มบล็อกทั้งหมดไปแทนที่ใน HTML หลัก
  for (const [placeholder, blocksHtml] of Object.entries(blockGroups || {})) {
    const regex = new RegExp(escapeRegExp(placeholder), "g");
    resultHtml = resultHtml.replace(regex, () => blocksHtml);
  }

  // 5. เคลียร์ Placeholder ที่เหลือค้าง
  schemaBlocks.forEach((b) => {
    if (b.placeholder) {
      const regex = new RegExp(escapeRegExp(b.placeholder), "g");
      resultHtml = resultHtml.replace(regex, "");
    }
  });

  return resultHtml;
}