// lib/bbcode.ts

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const SP: Record<string, [string, string]> = {
  b: ["<b>", "</b>"], i: ["<i>", "</i>"], u: ["<u>", "</u>"], s: ["<s>", "</s>"],
  sup: ["<sup>", "</sup>"], sub: ["<sub>", "<sub>"],
  left: ["<div>", "</div>"],
  center: ["<div style='text-align:center'>", "</div>"],
  right: ["<div style='text-align:right'>", "</div>"],
  justify: ["<div style='text-align:justify'>", "</div>"],
  quote: ["<blockquote class='bq'>", "</blockquote>"],
  code: ["<pre class='cd'>", "</pre>"],
  ooc: ["<span class='ooc'>(", ")</span>"],
  thought: ["<span class='thk'>", "</span>"],
  whisper: ["<small class='wh'>", "</small>"],
  sfx: ["<span class='sfx'>", "</span>"],
  shake: ["<span class='fxs'>", "</span>"],
  rainbow: ["<span class='rb'>", "</span>"],
  blink: ["<span class='bk'>", "</span>"],
  shadow: ["<span class='shd'>", "</span>"],
  mark: ["<mark class='mk'>", "</mark>"],
  h: ["<div class='hd'>", "</div>"],
  table: ["<table class='bt'>", "</table>"],
  tr: ["<tr>", "</tr>"], td: ["<td>", "</td>"], th: ["<th>", "</th>"],
};

const FONTS: Record<string, string> = {
  serif: "serif", mono: "monospace", jp: "'Noto Sans JP'", display: "'Chakra Petch'", thai: "'Noto Sans Thai'",
};

const COLOR = "(#[0-9a-f]{3,8}|[a-z]+)";
const NAME = String.raw`([^\]\n]{1,30})`;
const SAFE_URL = /^https?:\/\/[^\s'"]+$/;

const pair = (t: string) => new RegExp(String.raw`\[${t}\]([\s\S]*?)\[\/${t}\]`, "gi");
const param = (t: string, arg: string) => new RegExp(String.raw`\[${t}=${arg}\]([\s\S]*?)\[\/${t}\]`, "gi");

export function renderBB(input: string): string {
  if (!input || typeof input !== "string") return "";

  const lockBlocks: string[] = [];
  let s = input.replace(
    /\[lock(?:=([^\]\n]*))?\]([\s\S]*?)\[\/lock\]/gi,
    (_m, arg: string | undefined, content: string) => {
      const idx = lockBlocks.length;
      
      let rawPass = "";
      let headTitle = "RESTRICTED CONTENT";

      if (arg) {
        const parts = arg.split(",");
        rawPass = parts[0] ? parts[0].trim() : "";
        if (parts.length > 1 && parts[1].trim()) {
          headTitle = parts.slice(1).join(",").trim();
        }
      }

      const hasPassword = rawPass.length > 0;
      const id = "lk_" + Math.random().toString(36).substring(2, 9);
      const renderedInner = renderBB(content);
      const encodedPass = encodeURIComponent(rawPass);

      // 🟢 อัปเดตสไตล์ปุ่ม <button> ให้เป็น Gradient สีฟ้า-ม่วง เรืองแสงและโดดเด่น
      const htmlBlock = `<div id="${id}" class="box2 lk-box" style="border:1px solid var(--line);padding:16px 18px;margin:14px 0;width:100%;box-sizing:border-box;background:#0d0814;">` +
        `<div class="tag" style="color:var(--cy);margin-bottom:10px;font-size:12px;font-family:var(--font-hud);letter-spacing:0.1em;display:flex;align-items:center;gap:6px;">` +
          `<span>🔒 ${esc(headTitle)}</span>` +
          (!hasPassword ? `<span style="opacity:0.6;font-size:10px;">(CLICK TO VIEW)</span>` : ``) +
        `</div>` +
        `<div class="lk-form" style="display:flex;gap:10px;align-items:center;width:100%;">` +
          (hasPassword
            ? `<input type="password" class="lk-in" placeholder="ENTER PASSWORD..." style="flex:1;min-width:0;background:#050308;color:var(--tx);border:1px solid var(--line);padding:8px 12px;font-size:13px;width:100%;box-sizing:border-box;outline:none;" />`
            : `<div style="flex:1;font-size:12px;color:var(--mut);">เนื้อหาส่วนนี้ซ่อนอยู่ กดปุ่มเพื่อเปิดอ่าน</div>`) +
          `<button type="button" class="mini lk-btn" data-pass="${encodedPass}" style="flex-shrink:0;padding:8px 20px;cursor:pointer;background:linear-gradient(135deg, #38c8ff 0%, #a78bfa 100%);color:#fff;font-weight:bold;border:1px solid #7be0ff;border-radius:6px;box-shadow:0 0 12px rgba(56,200,255,0.35);text-shadow:0 1px 2px rgba(0,0,0,0.6);" onclick="var p=this.closest('.lk-box'),i=p.querySelector('.lk-in'),e=p.querySelector('.lk-err'),c=p.querySelector('.lk-cnt'),f=p.querySelector('.lk-form'),pwd=this.getAttribute('data-pass');if(!${hasPassword}||(i&&i.value.trim()===decodeURIComponent(pwd))){c.style.display='block';f.style.display='none';if(e)e.style.display='none';}else{if(e)e.style.display='block';}">${hasPassword ? "UNLOCK" : "VIEW CONTENT"}</button>` +
        `</div>` +
        `<div class="lk-err" style="display:none;color:#ff5f6f;font-size:12px;margin-top:8px;font-weight:bold;">❌ รหัสผ่านไม่ถูกต้อง</div>` +
        `<div class="lk-cnt" style="display:none;margin-top:14px;padding-top:14px;border-top:1px dashed var(--line);">${renderedInner}</div>` +
      `</div>`;

      lockBlocks.push(htmlBlock);
      return `___LOCK_BLOCK_${idx}___`;
    }
  );

  s = esc(s);

  s = s.replace(/\[list(=1)?\]([\s\S]*?)\[\/list\]/gi, (m, o: string | undefined, x: string) =>
    x.includes("[*]")
      ? m
      : `[list${o ?? ""}]` + x.split("\n").filter((l) => l.trim()).map((l) => "[*]" + l.trim()).join("") + "[/list]",
  );

  for (let k = 0; k < 2; k++) {
    for (const [t, [o, c]] of Object.entries(SP)) s = s.replace(pair(t), (_m, x: string) => o + x + c);

    s = s
      .replace(param("color", COLOR), (_m, a: string, x: string) => `<span style='color:${a}'>${x}</span>`)
      .replace(param("bg", COLOR), (_m, a: string, x: string) => `<span style='background:${a};padding:0 3px'>${x}</span>`)
      .replace(param("glow", COLOR), (_m, a: string, x: string) => `<span style='color:#fff;text-shadow:0 0 6px ${a},0 0 14px ${a}'>${x}</span>`)
      .replace(param("shadow", COLOR), (_m, a: string, x: string) => `<span style='text-shadow:2px 2px 0 ${a}'>${x}</span>`)
      .replace(param("mark", COLOR), (_m, a: string, x: string) => `<mark class='mk' style='background:${a};color:#08050a'>${x}</mark>`)
      .replace(param("blink", COLOR), (_m, a: string, x: string) => `<span class='bk' style='--bk:${a}'>${x}</span>`)
      .replace(param("rainbow", `${COLOR},${COLOR}`), (_m, a: string, b: string, x: string) =>
        `<span style='background:linear-gradient(90deg,${a},${b},${a});-webkit-background-clip:text;background-clip:text;color:transparent'>${x}</span>`)
      .replace(param("size", String.raw`(\d{1,2})`), (_m, n: string, x: string) => `<span style='font-size:${Math.min(+n, 40)}px'>${x}</span>`)
      .replace(param("font", "(serif|mono|jp|display|thai)"), (_m, f: string, x: string) => `<span style='font-family:${FONTS[f]}'>${x}</span>`)
      .replace(param("quote", NAME), (_m, n: string, x: string) => `<blockquote class='bq'><b>${n}</b><br>${x}</blockquote>`)
      .replace(param("say", NAME), (_m, n: string, x: string) => `<div class='say'><b>${n}</b>${x}</div>`)
      .replace(param("spoiler", NAME), (_m, n: string, x: string) => `<details class='sp'><summary>${n}</summary>${x}</details>`)
      .replace(param("detail", NAME), (_m, n: string, x: string) => `<details class='dt'><summary>${n}</summary><div>${x}</div></details>`)
      .replace(param("box", COLOR), (_m, a: string, x: string) => `<div class='box2' style='--bc:${a}'>${x}</div>`)
      .replace(param("ruby", String.raw`([^\]\n]{1,20})`), (_m, r: string, x: string) => `<ruby>${x}<rt>${r}</rt></ruby>`)
      .replace(param("bar", String.raw`(\d{1,3}),${COLOR}`), (_m, n: string, a: string, x: string) =>
        `<div class='pb'><i style='width:${Math.min(+n, 100)}%;background:${a}'></i><span>${x}</span></div>`)
      .replace(param("bar", String.raw`(\d{1,3})`), (_m, n: string, x: string) =>
        `<div class='pb'><i style='width:${Math.min(+n, 100)}%'></i><span>${x}</span></div>`)
      .replace(param("roll", String.raw`(\d{1,2}d\d{1,3})`), (_m, d: string, x: string) => `<span class='roll'>🎲 ${d} <b>${x}</b></span>`)
      .replace(param("url", String.raw`(https?:\/\/[^\]\s'"]+)`), (_m, u: string, x: string) => `<a href='${u}' target='_blank' rel='noopener noreferrer'>${x}</a>`)
      .replace(param("img", String.raw`(\d{2,3})`), (m, w: string, x: string) => (SAFE_URL.test(x) ? `<img class='bbi' style='width:${w}px' src='${x}' alt=''>` : m))
      .replace(pair("spoiler"), (_m, x: string) => `<details class='sp'><summary>spoiler</summary>${x}</details>`)
      .replace(pair("url"), (m, x: string) => (SAFE_URL.test(x) ? `<a href='${x}' target='_blank' rel='noopener noreferrer'>${x}</a>` : m))
      .replace(pair("img"), (m, x: string) => (SAFE_URL.test(x) ? `<img class='bbi' src='${x}' alt=''>` : m))
      .replace(/\[list(=1)?\]([\s\S]*?)\[\/list\]/gi, (_m, o: string | undefined, x: string) => {
        const t = o ? "ol" : "ul";
        return `<${t} class='bl2'>${x.split("[*]").slice(1).map((y) => `<li>${y.trim()}</li>`).join("")}</${t}>`;
      });
  }

  s = s
    .replace(/\[hr\]/gi, "<hr class='bh'>")
    .replace(/\[dice=(\d{1,2}d\d{1,3})\]/gi, "<span class='roll'>🎲 $1 <b>?</b></span>");

  lockBlocks.forEach((html, i) => {
    s = s.replace(`___LOCK_BLOCK_${i}___`, () => html);
  });

  return s;
}