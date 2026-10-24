"use client";

import { useRef, useState, useEffect } from "react";
import { renderBB } from "@/lib/bbcode";

const BX: ([string, string] | "|")[] = [
  ["b", "B"], ["i", "I"], ["u", "U"], ["s", "S"], ["sup", "x²"], ["sub", "x₂"], "|",
  ["quote=ชื่อ", "❝"], ["spoiler=หัวข้อ", "👁️‍🗨️"], ["lock=รหัส,หัวข้อ", "🔒"], ["detail=หัวข้อ", "▾"], ["code", "CODE"], ["list", "• ลิสต์"], ["table", "▦"], ["hr", "―"], ["h", "H"], "|",
  ["box=@", "▢"], ["say=ชื่อ", "💬"], ["ooc", "OOC"], ["thought", "💭"], ["whisper", "ʷ"], ["sfx", "SFX"], "|",
  ["glow=@", "✦"], ["shadow=@", "◐"], ["mark=@", "mark"], ["blink=@", "✺"], ["rainbow=@,@2", "🌈"], ["shake", "~"], "|",
  ["ruby=よみ", "ルビ"], ["bar=70,@", "▰"], ["img", "IMG"], ["url=https://", "URL"],
];

const SWATCH = ["#ff5fa8", "#ffd6ea", "#7be0ff", "#6fe3a0", "#ffd35f", "#ff9f5f", "#a78bfa", "#ff5f6f"];

const EMOJI_CATEGORIES = [
  { id: "symbols", label: "✦ สัญลักษณ์", items: ["✦", "✧", "♡", "♥", "☆", "★", "☾", "☀", "✚", "☣", "⚠", "⚔", "✿", "→", "←", "…", "♪", "※", "◆", "◇", "♠", "♣", "♦", "♩", "♫", "♬", "░", "▒", "▓"] },
  { id: "smileys", label: "😃 ยิ้ม", items: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😋", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😟", "😕", "🙁", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "😈", "👿", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖"] },
  { id: "people", label: "👋 ท่าทาง", items: ["👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦵", "🦶", "👂", "鼻", "🧠", "🦷", "骨", "👀", "👁️", "👅", "👄", "💋", "🩸"] },
  { id: "hearts", label: "❤️ หัวใจ", items: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "💌", "💋", "💍"] },
  { id: "animals", label: "🐶 สัตว์", items: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🕷️", "🕸️", "🦂", "🐍", "🦎", "🦖", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🦈", "🐊", "🐅", "🐘", "🦏", "🐪", "🦒", "🦘", "🦥", "🦦", "🦨", "🐁", "🐇", "🐿️", "🌲", "🌳", "🌴", "🌵", "🌾", "🌿", "🍀", "🍁", "🍂", "🍃", "🍄", "🌹", "🥀", "🌺", "🌸", "🌻", "🌞", "🌙", "⭐", "🌟", "✨", "⚡", "💥", "🔥", "🌪️", "🌈", "☀️", "☁️", "🌧️", "⛈️", "❄️", "🌊"] },
  { id: "objects", label: "💡 สิ่งของ", items: ["⌚", "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "📷", "📸", "📹", "🎥", "📽️", "📞", "☎️", "📟", "📺", "📻", "🎙️", "⏱️", "⏲️", "⏰", "💡", "flashlight", "🏮", "📔", "📕", "📖", "📗", "📘", "📙", "📚", "📓", "📒", "📃", "📜", "📄", "📰", "📑", "🔖", "🏷️", "💰", "🪙", "💴", "💵", "💶", "💷", "💸", "💳", "🧾", "✉️", "📧", "📦", "📫", "📬", "📮", "✏️", "✒️", "🖊️", "🖌️", "🖍️", "📝", "💼", "📁", "📂", "📅", "📆", "📇", "📈", "📉", "📊", "📋", "📌", "📍", "📎", "📏", "📐", "✂️", "🔒", "🔓", "🔏", "🔐", "🔑", "🗝️", "🔨", "🪓", "⛏️", "⚒️", "🛠️", "🗡️", "⚔️", "💣", "🛡️", "🔧", "⚙️", "⚖️", "🔗", "⛓️", "🧰", "🧲", "🧪", "🧫", "🧬", "🔬", "🔭", "📡", "💉", "🩸", "💊", "🩹", "🩺", "🚪", "🛏️", "🛋️", "🚽", "🛁", "🧴", "🧹", "🧺", "🧻", "🧼", "🧯", "🛒", "🚬", "⚰️"] },
  { id: "symbols_etc", label: "🔣 เครื่องหมาย", items: ["💯", "💢", "💥", "💫", "💦", "💨", "💬", "💭", "💤", "♨️", "🛑", "⚠️", "🚸", "⛔", "🚫", "🔞", "☢️", "☣️", "⬆️", "↗️", "➡️", "↘️", "⬇️", "↙️", "⬅️", "↖️", "↕️", "↔️", "↩️", "↪️", "🔃", "🔄", "🔙", "🔚", "🔛", "🔜", "🔝", "✡️", "☯️", "✝️", "☮️", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓", "▶️", "⏩", "⏭️", "⏯️", "◀️", "⏪", "⏮️", "🔼", "⏬", "⏸️", "⏹️", "⏺️", "♀️", "♂️", "✖️", "➕", "➖", "➗", "♾️", "‼️", "⁉️", "❓", "❗", "〰️", "💲", "⚕️", "♻️", "⚜️", "🔱", "⭕", "✅", "☑️", "✔️", "❌", "❎", "©️", "®️", "™️", "#️⃣", "*️⃣", "0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫", "⚪", "🟤", "⬛", "⬜", "🔶", "🔷", "🔸", "🔹", "🔺", "🔻", "💠", "🔘"] }
];

const BUILTIN_STUDIO_TEMPLATES = [
  {
    id: "scene_header",
    category: "🎬 หัวฉาก & บรรยากาศ",
    name: "หัวฉากมาตรฐาน (Scene Header)",
    code: "[h]✦ LOCATION: ____  |  TIME: ____  |  WEATHER: ____[/h]\n[i]คำบรรยายสภาพแวดล้อมโดยรอบ...[/i]\n",
  },
  {
    id: "dialogue_box",
    category: "💬 บทสนทนาตัวละคร",
    name: "กล่องพูดตัวละคร (Character Speech)",
    code: "[say=ชื่อตัวละคร][color=#38c8ff]\"ข้อความพูดของตัวละคร...\"[/color][/say]\n",
  },
  {
    id: "thought_box",
    category: "💬 บทสนทนาตัวละคร",
    name: "ความคิดตัวละคร (Internal Thought)",
    code: "[thought][color=#a78bfa]💭 (ความคิดในใจของตัวละคร...)[/color][/thought]\n",
  },
  {
    id: "char_status",
    category: "👤 สเปค & สถานะตัวละคร",
    name: "หลอดสถานะ / HP / พลังงาน (Status Bar)",
    code: "[box=#38c8ff]\n[b]STATUS // ตัวละคร[/b]\nHP: [bar=80,#ff5f6f]80 / 100[/bar]\nENERGY: [bar=60,#38c8ff]60 / 100[/bar]\n[/box]\n",
  },
  {
    id: "quest_lore",
    category: "📜 Lore & เควสต์",
    name: "กล่องภารกิจ / Lore (Quest Box)",
    code: "[detail=📜 ข้อมูลภารกิจพิเศษ]\n[b]ภารกิจ:[/b] สำรวจพื้นที่เขตอุตสาหกรรม\n[b]รางวัล:[/b] 500 Credits\n[sfx]⚠️ โปรดระวังศัตรูระดับสูงในบริเวณ[/sfx]\n[/detail]\n",
  },
  {
    id: "spoiler_box",
    category: "👁️‍🗨️ การซ่อนข้อความ",
    name: "สปอยล์ซ่อนเนื้อหา (Spoiler)",
    code: "[spoiler=คลิกเพื่อเปิดดูเนื้อหาลับ]ข้อความสปอยล์ที่ต้องการซ่อนตรงนี้...[/spoiler]\n",
  },
  {
    id: "lock_box",
    category: "🔒 การซ่อนข้อความ",
    name: "ซ่อนแบบใส่รหัสผ่าน (Password Lock)",
    code: "[lock=1234,เนื้อหาลับสำหรับผู้มีรหัส]ข้อความที่ถูกล็อกด้วยรหัส 1234...[/lock]\n",
  },
];

export default function BBEditor({
  name,
  label,
  defaultValue = "",
  value,
  onChange,
  minHeight = 360,
  hidePreview = false,
}: {
  name?: string;
  label?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (val: string) => void;
  minHeight?: number;
  hidePreview?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [internalText, setInternalText] = useState(defaultValue);
  const text = value !== undefined ? value : internalText;

  const [showToolbar, setShowToolbar] = useState(false);

  const [textColor, setTextColor] = useState("#ff5fa8");
  const [bgColor, setBgColor] = useState("#ffd35f");
  const [c1, setC1] = useState("#ff5fa8");
  const [c2, setC2] = useState("#7be0ff");

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiTab, setEmojiTab] = useState("symbols");

  const [showStudio, setShowStudio] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<{ id: string; name: string; code: string }[]>([]);
  const [newTplName, setNewTplName] = useState("");
  const [newTplCode, setNewTplCode] = useState("");

  // 🟢 ดักฟังเหตุการณ์กดปุ่มปลดล็อกแท็ก [lock] ทั่วทั้งหน้านี้อย่างปลอดภัย
  useEffect(() => {
    const handleLockClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".lk-btn");
      if (!btn) return;

      const box = btn.closest<HTMLDivElement>(".lk-box");
      if (!box) return;

      const hasPwd = box.getAttribute("data-has-pwd") === "true";
      const rawPass = decodeURIComponent(box.getAttribute("data-pass") || "");
      const inp = box.querySelector<HTMLInputElement>(".lk-in");
      const err = box.querySelector<HTMLDivElement>(".lk-err");
      const cnt = box.querySelector<HTMLDivElement>(".lk-cnt");
      const form = box.querySelector<HTMLDivElement>(".lk-form");

      if (!hasPwd || (inp && inp.value === rawPass)) {
        if (cnt) cnt.style.display = "block";
        if (form) form.style.display = "none";
        if (err) err.style.display = "none";
      } else {
        if (err) err.style.display = "block";
      }
    };

    document.addEventListener("click", handleLockClick);
    return () => document.removeEventListener("click", handleLockClick);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("my_bb_templates");
      if (saved) setCustomTemplates(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveCustomTemplate = () => {
    if (!newTplName.trim() || !newTplCode.trim()) return;
    const item = { id: Date.now().toString(), name: newTplName, code: newTplCode };
    const updated = [...customTemplates, item];
    setCustomTemplates(updated);
    localStorage.setItem("my_bb_templates", JSON.stringify(updated));
    setNewTplName("");
    setNewTplCode("");
  };

  const deleteCustomTemplate = (id: string) => {
    const updated = customTemplates.filter((t) => t.id !== id);
    setCustomTemplates(updated);
    localStorage.setItem("my_bb_templates", JSON.stringify(updated));
  };

  const updateText = (newVal: string) => {
    if (value === undefined) setInternalText(newVal);
    if (onChange) onChange(newVal);
  };

  const wrap = (open: string, close = "") => {
    const t = ref.current;
    if (!t) return;
    t.focus();
    const a = t.selectionStart,
      b = t.selectionEnd,
      sel = t.value.slice(a, b),
      out = open + sel + close;
    if (!document.execCommand("insertText", false, out)) t.setRangeText(out, a, b, "end");
    t.setSelectionRange(a + open.length, a + open.length + sel.length);
    updateText(t.value);
  };

  const press = (k: string) => {
    const key = k.replace("@2", c2).replace("@", c1);
    if (key === "hr") return wrap("[hr]");
    wrap(`[${key}]`, `[/${key.split("=")[0]}]`);
  };

  const currentEmojiCat = EMOJI_CATEGORIES.find((c) => c.id === emojiTab) || EMOJI_CATEGORIES[0];

  return (
    <div style={{ margin: "14px 0", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        {label && <div className="mut" style={{ fontWeight: 600, letterSpacing: ".1em" }}>{label}</div>}
        
        <button
          type="button"
          onClick={() => setShowToolbar(!showToolbar)}
          style={{
            background: showToolbar ? "rgba(168, 85, 247, 0.15)" : "rgba(255, 255, 255, 0.05)",
            border: `1px solid ${showToolbar ? "#a855f7" : "rgba(255, 255, 255, 0.1)"}`,
            color: showToolbar ? "#d8b4fe" : "#94a3b8",
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "11px",
            cursor: "pointer",
            transition: "0.2s",
            fontWeight: "bold"
          }}
        >
          {showToolbar ? "➖ ซ่อนเครื่องมือ" : "➕ เครื่องมือตกแต่ง"}
        </button>
      </div>

      {showToolbar && (
        <>
          <div className="bbt">
            {BX.map((b, i) =>
              b === "|" ? (
                <span key={i} className="mut">│</span>
              ) : (
                <button key={b[0]} type="button" title={`[${b[0].split("=")[0]}]`} onClick={() => press(b[0])}>
                  {b[1]}
                </button>
              )
            )}
          </div>

          <div className="bbt">
            <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <span className="mut">สี</span>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                style={{ width: "28px", height: "24px", cursor: "pointer", border: "none", background: "none" }}
              />
              <button
                type="button"
                onClick={() => wrap(`[color=${textColor}]`, "[/color]")}
                style={{ padding: "2px 6px", fontSize: "11px", cursor: "pointer" }}
              >
                ใช้สี
              </button>
            </div>

            <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <span className="mut">ไฮไลต์</span>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                style={{ width: "28px", height: "24px", cursor: "pointer", border: "none", background: "none" }}
              />
              <button
                type="button"
                onClick={() => wrap(`[bg=${bgColor}]`, "[/bg]")}
                style={{ padding: "2px 6px", fontSize: "11px", cursor: "pointer" }}
              >
                ไฮไลต์
              </button>
            </div>

            {SWATCH.map((c) => (
              <i key={c} className="sw" style={{ background: c }} onClick={() => wrap(`[color=${c}]`, "[/color]")} />
            ))}

            <div style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
              <span className="mut">สีเอฟเฟกต์</span>
              <input type="color" value={c1} onChange={(e) => setC1(e.target.value)} style={{ width: "24px", height: "20px" }} />
              <input type="color" value={c2} onChange={(e) => setC2(e.target.value)} style={{ width: "24px", height: "20px" }} />
            </div>

            <select value="" onChange={(e) => e.target.value && wrap(`[${e.target.value}]`, `[/${e.target.value}]`)}>
              <option value="">จัดวาง</option>
              <option value="left">ชิดซ้าย</option>
              <option value="center">กึ่งกลาง</option>
              <option value="right">ชิดขวา</option>
              <option value="justify">เต็มบรรทัด</option>
            </select>

            <select value="" onChange={(e) => e.target.value && wrap(`[size=${e.target.value}]`, "[/size]")}>
              <option value="">ขนาด</option>
              {[10, 12, 16, 20, 24, 32, 40].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>

            <select value="" onChange={(e) => e.target.value && wrap(`[font=${e.target.value}]`, "[/font]")}>
              <option value="">ฟอนต์</option>
              {["serif", "mono", "jp", "display", "thai"].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowStudio(false);
              }}
              style={{
                background: showEmojiPicker ? "rgba(56, 200, 255, 0.2)" : undefined,
                borderColor: showEmojiPicker ? "#38c8ff" : undefined,
              }}
            >
              😀 อิโมจิ
            </button>

            <button
              type="button"
              onClick={() => {
                setShowStudio(!showStudio);
                setShowEmojiPicker(false);
              }}
              style={{
                background: showStudio ? "#a78bfa33" : "rgba(167, 139, 250, 0.15)",
                border: "1px solid #a78bfa",
                color: "#a78bfa",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              🎨 สตูดิโอโค้ด
            </button>
          </div>
        </>
      )}

      {showToolbar && showStudio && (
        <div
          style={{
            position: "absolute",
            zIndex: 60,
            left: 0,
            right: 0,
            background: "#0a0712",
            border: "1px solid #a78bfa",
            padding: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.95)",
            marginBottom: "8px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", fontWeight: "bold", color: "#a78bfa" }}>
              🎨 สตูดิโอโค้ด (คลังโค้ดสำเร็จรูป & โค้ดส่วนตัว)
            </span>
            <button
              type="button"
              onClick={() => setShowStudio(false)}
              style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: "14px" }}
            >
              ✕
            </button>
          </div>

          <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "12px" }}>
            * คลิกที่โค้ดสำเร็จรูปเพื่อดึงมาวางลงในพื้นที่พิมพ์ทันที ไม่ต้องก็อปปี้วางเอง
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px", maxHeight: "180px", overflowY: "auto", marginBottom: "16px" }}>
            {BUILTIN_STUDIO_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => {
                  wrap(tpl.code);
                  setShowStudio(false);
                }}
                style={{
                  padding: "10px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid #333",
                  cursor: "pointer",
                  borderRadius: "2px",
                }}
              >
                <div style={{ fontSize: "10px", color: "#a78bfa", fontWeight: "bold" }}>{tpl.category}</div>
                <div style={{ fontSize: "12px", color: "#fff", margin: "2px 0 4px 0" }}>{tpl.name}</div>
                <div style={{ fontSize: "10px", color: "#777", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {tpl.code.replace(/\n/g, " ")}
                </div>
              </div>
            ))}

            {customTemplates.map((tpl) => (
              <div
                key={tpl.id}
                style={{
                  padding: "10px",
                  background: "rgba(167, 139, 250, 0.08)",
                  border: "1px solid #a78bfa44",
                  position: "relative",
                  borderRadius: "2px",
                }}
              >
                <div
                  onClick={() => {
                    wrap(tpl.code);
                    setShowStudio(false);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <div style={{ fontSize: "10px", color: "#ffd35f", fontWeight: "bold" }}>⭐ โค้ดส่วนตัว</div>
                  <div style={{ fontSize: "12px", color: "#fff", margin: "2px 0 4px 0" }}>{tpl.name}</div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteCustomTemplate(tpl.id)}
                  style={{ position: "absolute", top: "6px", right: "6px", background: "none", border: "none", color: "#ff5f6f", cursor: "pointer", fontSize: "11px" }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px dashed #333", paddingTop: "12px" }}>
            <div style={{ fontSize: "12px", color: "#fff", marginBottom: "8px", fontWeight: "bold" }}>➕ บันทึกโค้ดไว้ใช้เอง:</div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
              <input
                type="text"
                placeholder="ชื่อเรียกโค้ด..."
                value={newTplName}
                onChange={(e) => setNewTplName(e.target.value)}
                style={{ flex: 1, padding: "6px 10px", background: "#000", border: "1px solid #444", color: "#fff", fontSize: "12px" }}
              />
              <button
                type="button"
                onClick={saveCustomTemplate}
                style={{ padding: "6px 12px", background: "#a78bfa", border: "none", color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}
              >
                บันทึกเก็บไว้
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="วางชุดโค้ด BBCode หรือข้อความที่ต้องการบันทึกไว้ใช้งาน..."
              value={newTplCode}
              onChange={(e) => setNewTplCode(e.target.value)}
              style={{ width: "100%", padding: "6px 10px", background: "#000", border: "1px solid #444", color: "#fff", fontSize: "12px", fontFamily: "monospace" }}
            />
          </div>
        </div>
      )}

      {showToolbar && showEmojiPicker && (
        <div
          style={{
            position: "absolute",
            zIndex: 50,
            left: 0,
            right: 0,
            background: "#0c0814",
            border: "1px solid var(--line, #38c8ff)",
            padding: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.9)",
            marginBottom: "8px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: "bold", color: "#38c8ff" }}>😀 คลังอิโมจิ & สัญลักษณ์พิเศษ</span>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(false)}
              style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: "14px" }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px", borderBottom: "1px solid #333", paddingBottom: "6px" }}>
            {EMOJI_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setEmojiTab(cat.id)}
                style={{
                  padding: "3px 8px",
                  fontSize: "11px",
                  background: emojiTab === cat.id ? "#38c8ff22" : "transparent",
                  border: `1px solid ${emojiTab === cat.id ? "#38c8ff" : "#333"}`,
                  color: emojiTab === cat.id ? "#fff" : "#aaa",
                  cursor: "pointer",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(34px, 1fr))",
              gap: "4px",
              maxHeight: "160px",
              overflowY: "auto",
              paddingRight: "4px",
            }}
          >
            {currentEmojiCat.items.map((emoji, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => wrap(emoji)}
                style={{
                  height: "34px",
                  fontSize: "16px",
                  color: "#ffffff",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid #333",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <textarea
        className="glass-input"
        ref={ref}
        name={name}
        value={text}
        style={{ minHeight, width: "100%", padding: "12px", background: "rgba(0,0,0,0.4)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
        onInput={(e) => updateText(e.currentTarget.value)}
        onChange={(e) => updateText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key.length === 1 && "biu".includes(e.key.toLowerCase())) {
            e.preventDefault();
            const k = e.key.toLowerCase();
            wrap(`[${k}]`, `[/${k}]`);
          }
        }}
      />

      <div className="mut" style={{ fontSize: 11 }}>
        {text.length} ตัวอักษร · ทางลัด Ctrl+B / I / U
      </div>
      {!hidePreview && (
        <>
          <div className="tag" style={{ marginTop: 14 }}>
            PREVIEW
          </div>
          <div
            style={{
              border: "1px dashed var(--line)",
              padding: "12px 14px",
              marginTop: 6,
              whiteSpace: "pre-wrap",
              lineHeight: 1.8,
              minHeight: 60,
            }}
            dangerouslySetInnerHTML={{
              __html: renderBB(text) || "<span class='mut'>— พรีวิวจะแสดงที่นี่ —</span>",
            }}
          />
        </>
      )}
    </div>
  );
}