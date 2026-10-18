"use client";

import { useRef, useState } from "react";
import { renderBB } from "@/lib/bbcode";

// '@' = สีเอฟเฟกต์ช่องที่ 1, '@2' = ช่องที่ 2
const BX: ([string, string] | "|")[] = [
  ["b", "B"], ["i", "I"], ["u", "U"], ["s", "S"], ["sup", "x²"], ["sub", "x₂"], "|",
  ["quote=ชื่อ", "❝"], ["spoiler=หัวข้อ", "▸"], ["detail=หัวข้อ", "▾"], ["code", "CODE"], ["list", "• ลิสต์"], ["table", "▦"], ["hr", "―"], ["h", "H"], "|",
  ["box=@", "▢"], ["say=ชื่อ", "💬"], ["ooc", "OOC"], ["thought", "💭"], ["whisper", "ʷ"], ["sfx", "SFX"], "|",
  ["glow=@", "✦"], ["shadow=@", "◐"], ["mark=@", "▮"], ["blink=@", "✺"], ["rainbow=@,@2", "🌈"], ["shake", "~"], "|",
  ["ruby=よみ", "ルビ"], ["bar=70,@", "▰"], ["img", "IMG"], ["url=https://", "URL"],
];
const SWATCH = ["#ff5fa8", "#ffd6ea", "#7be0ff", "#6fe3a0", "#ffd35f", "#ff9f5f", "#a78bfa", "#ff5f6f"];
const EMOJI = ["✦", "✧", "♡", "♥", "☆", "★", "☾", "☀", "✚", "☣", "⚠", "⚔", "✿", "→", "←", "…", "♪", "※", "◆"];
const SNIPPETS: Record<string, string> = {
  scene: "[h]✦ ฉาก: ____ · เวลา: ____ · สถานที่: ____[/h]\n",
  dialog: "[say=ชื่อ]ข้อความ[/say]\n",
  narr: "[i]…[/i]\n",
};

export default function BBEditor({ name, label, defaultValue = "", minHeight = 360 }: {
  name: string; label: string; defaultValue?: string; minHeight?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState(defaultValue);
  const [c1, setC1] = useState("#ff5fa8");
  const [c2, setC2] = useState("#7be0ff");

  const wrap = (open: string, close = "") => {
    const t = ref.current;
    if (!t) return;
    t.focus();
    const a = t.selectionStart, b = t.selectionEnd, sel = t.value.slice(a, b), out = open + sel + close;
    // insertText เพื่อให้ Ctrl+Z ย้อนกลับได้
    if (!document.execCommand("insertText", false, out)) t.setRangeText(out, a, b, "end");
    t.setSelectionRange(a + open.length, a + open.length + sel.length);
    setText(t.value);
  };
  const press = (k: string) => {
    const key = k.replace("@2", c2).replace("@", c1);
    if (key === "hr") return wrap("[hr]");
    wrap(`[${key}]`, `[/${key.split("=")[0]}]`);
  };

  return (
    <div style={{ margin: "14px 0" }}>
      <div className="mut" style={{ fontWeight: 600, letterSpacing: ".1em" }}>{label}</div>

      <div className="bbt">
        {BX.map((b, i) => b === "|"
          ? <span key={i} className="mut">│</span>
          : <button key={b[0]} type="button" title={`[${b[0].split("=")[0]}]`} onClick={() => press(b[0])}>{b[1]}</button>)}
      </div>
      <div className="bbt">
        <label className="mut">สี <input type="color" defaultValue="#ff5fa8" onChange={(e) => wrap(`[color=${e.target.value}]`, "[/color]")} /></label>
        <label className="mut">ไฮไลต์ <input type="color" defaultValue="#ffd35f" onChange={(e) => wrap(`[bg=${e.target.value}]`, "[/bg]")} /></label>
        {SWATCH.map((c) => <i key={c} className="sw" style={{ background: c }} onClick={() => wrap(`[color=${c}]`, "[/color]")} />)}
        <label className="mut">สีเอฟเฟกต์
          <input type="color" value={c1} onChange={(e) => setC1(e.target.value)} />
          <input type="color" value={c2} onChange={(e) => setC2(e.target.value)} />
        </label>
        <select value="" onChange={(e) => e.target.value && wrap(`[${e.target.value}]`, `[/${e.target.value}]`)}>
          <option value="">จัดวาง</option><option value="left">ชิดซ้าย</option><option value="center">กึ่งกลาง</option>
          <option value="right">ชิดขวา</option><option value="justify">เต็มบรรทัด</option>
        </select>
        <select value="" onChange={(e) => e.target.value && wrap(`[size=${e.target.value}]`, "[/size]")}>
          <option value="">ขนาด</option>{[10, 12, 16, 20, 24, 32, 40].map((n) => <option key={n}>{n}</option>)}
        </select>
        <select value="" onChange={(e) => e.target.value && wrap(`[font=${e.target.value}]`, "[/font]")}>
          <option value="">ฟอนต์</option>{["serif", "mono", "jp", "display", "thai"].map((n) => <option key={n}>{n}</option>)}
        </select>
        <select value="" onChange={(e) => e.target.value && wrap(e.target.value)}>
          <option value="">✦ สัญลักษณ์</option>{EMOJI.map((n) => <option key={n}>{n}</option>)}
        </select>
        <select value="" onChange={(e) => e.target.value && wrap(SNIPPETS[e.target.value])}>
          <option value="">📝 เทมเพลต</option><option value="scene">หัวฉาก</option><option value="dialog">บทสนทนา</option><option value="narr">บรรยาย</option>
        </select>
      </div>

      <textarea
        ref={ref} name={name} defaultValue={defaultValue} style={{ minHeight, width: "100%" }}
        onInput={(e) => setText(e.currentTarget.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key.length === 1 && "biu".includes(e.key.toLowerCase())) {
            e.preventDefault();
            const k = e.key.toLowerCase();
            wrap(`[${k}]`, `[/${k}]`);
          }
        }}
      />
      <div className="mut" style={{ fontSize: 11 }}>
        {text.length} ตัวอักษร · ทางลัด Ctrl+B / I / U · [list] ไม่ต้องใส่ [*] ก็ได้ (หนึ่งบรรทัด = หนึ่งข้อ)
      </div>

      <div className="tag" style={{ marginTop: 14 }}>PREVIEW</div>
      <div
        style={{ border: "1px dashed var(--line)", padding: "12px 14px", marginTop: 6, whiteSpace: "pre-wrap", lineHeight: 1.8, minHeight: 60 }}
        dangerouslySetInnerHTML={{ __html: renderBB(text) || "<span class='mut'>— พรีวิวจะแสดงที่นี่ —</span>" }}
      />
    </div>
  );
}