"use client";

import { useEffect, useRef, useState } from "react";

// หน้าจอจำลองกว้าง 1280px: ใน iframe หน่วย vw = 1% ของ 1280 และ % อ้างอิงความกว้าง 1280 พอดี
export const RENDER_WIDTH = 1280;

const GOOGLE_SANS = "https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght,GRAD@0,17..18,400..700,-50..200;1,17..18,400..700,-50..200&display=swap";
const NOTO_THAI = "https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;600&display=swap";

const escAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const safeHttp = (u?: string) => {
  try {
    const x = new URL(u ?? "");
    return x.protocol === "https:" || x.protocol === "http:" ? x.toString() : null;
  } catch {
    return null;
  }
};

function buildDoc(html: string, cssLink: string | null) {
  return (
    `<!doctype html><html><head><meta charset="utf-8"><base target="_blank">` +
    `<link rel="stylesheet" href="${escAttr(GOOGLE_SANS)}"><link rel="stylesheet" href="${escAttr(NOTO_THAI)}">` +
    `<style>html,body{margin:0;padding:0;background:transparent;color:#fff;overflow:hidden}` +
    `body{box-sizing:border-box;font:14px/1.6 "Google Sans","Noto Sans Thai",system-ui,sans-serif}img{max-width:100%}` +
    `::-webkit-scrollbar{display:none!important}</style>` +
    (cssLink ? `<link rel="stylesheet" href="${escAttr(cssLink)}">` : "") +
    `</head><body><div id="content-wrapper" style="padding:24px;">${html}</div></body></html>`
  );
}

export default function PostRender({ html, cssLink }: { html: string; cssLink?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const stopInner = useRef<(() => void) | null>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(240);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, el.clientWidth / RENDER_WIDTH));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => () => stopInner.current?.(), []);

  const onLoad = () => {
    const doc = frameRef.current?.contentDocument;
    const wrapper = doc?.getElementById("content-wrapper");
    if (!doc || !wrapper) return;

    // วัดจาก wrapper เท่านั้น: documentElement.scrollHeight จะไม่ยอมต่ำกว่าความสูง iframe ปัจจุบัน
    // ทำให้โพสต์สั้นค้างความสูงเดิม (240) และไม่หดกลับเมื่อเนื้อหาเปลี่ยน
    const measure = () => {
      const h = Math.ceil(wrapper.scrollHeight);
      if (h > 0) setHeight(h);
    };

    stopInner.current?.();
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(wrapper);

    const mo = new MutationObserver(measure);
    mo.observe(doc.body, { childList: true, subtree: true, attributes: true });

    const pending = Array.from(doc.images).filter((img) => !img.complete);
    pending.forEach((img) => {
      img.addEventListener("load", measure);
      img.addEventListener("error", measure);
    });
    doc.fonts?.ready.then(measure); // วัดซ้ำหลังฟอนต์โหลดเสร็จ

    stopInner.current = () => {
      ro.disconnect();
      mo.disconnect();
      pending.forEach((img) => {
        img.removeEventListener("load", measure);
        img.removeEventListener("error", measure);
      });
    };
  };

  return (
    <div ref={boxRef} className="tp-render" style={{ overflow: "hidden" }}>
      <div style={{ width: RENDER_WIDTH * scale, height: height * scale, margin: "0 auto", overflow: "hidden" }}>
        <iframe
          ref={frameRef}
          title="post"
          scrolling="no"
          sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          srcDoc={buildDoc(html, safeHttp(cssLink))}
          onLoad={onLoad}
          style={{
            display: "block", border: 0, width: RENDER_WIDTH, height,
            transform: `scale(${scale})`, transformOrigin: "top left",
            background: "transparent", overflow: "hidden",
          }}
        />
      </div>
    </div>
  );
}