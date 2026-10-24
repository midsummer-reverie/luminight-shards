"use client";

import { useEffect } from "react";

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  if (isNaN(num)) return { h: 200, s: 50, l: 5 };

  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export default function ForumThemeStyle({ themeColor }: { themeColor: string }) {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    const { h, s } = hexToHsl(themeColor);
    const darkBgColor = "#060608";
    const darkGradientBg = `radial-gradient(circle at 50% -20%, hsl(${h}, ${Math.max(s, 40)}%, 12%) 0%, #08080a 70%, #040405 100%)`;

    const oldBodyBg = body.style.background;
    const oldBodyBgColor = body.style.backgroundColor;

    body.style.backgroundColor = darkBgColor;
    body.style.background = darkGradientBg;
    body.style.backgroundAttachment = "fixed";

    // 🟢 สร้าง Dynamic Style แทรกย้อมทับ Navbar และเมนูแท็บทั้งหมดแบบ 100%
    const styleEl = document.createElement("style");
    styleEl.id = "forum-dynamic-theme-override";
    styleEl.innerHTML = `
      /* 1. Override ตัวแปรสีหลักทั้งหมดใน Root */
      :root {
        --cy: ${themeColor} !important;
        --cy-glow: ${themeColor}66 !important;
        --pink: ${themeColor} !important;
        --pink-glow: ${themeColor}66 !important;
        --border-color: ${themeColor}44 !important;
        --bg: #060608 !important;
        --accent: ${themeColor} !important;
        --primary: ${themeColor} !important;
      }

      /* 2. ย้อมสี Navbar, Header, และเมนูลิงก์ทุกปุ่ม */
      header, nav, .navbar, .top-bar, [class*="nav"], [class*="header"] {
        border-color: ${themeColor}55 !important;
        box-shadow: 0 4px 20px ${themeColor}22 !important;
      }

      /* ย้อมสีขอบปุ่มเมนูทั้งหมดใน Navbar (หน้าแรก, ฟอรั่ม, กิลด์, โปรไฟล์) */
      header a, nav a, .navbar a, .top-bar a,
      header button, nav button, .navbar button,
      [class*="nav"] a, [class*="nav"] button, [class*="header"] a {
        border-color: ${themeColor}55 !important;
        color: #e4e4e7 !important;
      }

      /* 🟢 ย้อมสีปุ่ม Active (ปุ่มเมนูที่กำลังเลือกอยู่ เช่น 'ฟอรั่ม') และ Hover */
      header a[class*="active"], nav a[class*="active"], .navbar a[class*="active"],
      header a.active, nav a.active, .navbar a.active,
      [class*="nav"] a[class*="active"], [class*="nav"] .active,
      header a:hover, nav a:hover, .navbar a:hover, [class*="nav"] a:hover {
        border-color: ${themeColor} !important;
        background-color: ${themeColor}18 !important;
        color: ${themeColor} !important;
        box-shadow: 0 0 12px ${themeColor}44 !important;
        text-shadow: 0 0 8px ${themeColor}aa !important;
      }

      /* 3. ล้างกล่อง (.box, .card) ให้เป็นโทนดำ Neutral สะอาด */
      .box, .card, [class*="box"], [class*="card"] {
        background-color: rgba(10, 10, 12, 0.85) !important;
        border-color: ${themeColor}55 !important;
        color: #e4e4e7 !important;
      }

      /* ซ่อนหรือเปลี่ยนสี Pseudo-element (::before, ::after) */
      .box::after, .card::after, div::after,
      .box::before, .card::before, div::before {
        border-color: ${themeColor} !important;
        background-color: transparent !important;
      }

      /* 4. ข้อความมิวต์ (.mut) */
      .mut, .muted, [class*="mut"] {
        color: #94a3b8 !important;
      }
    `;

    document.head.appendChild(styleEl);

    return () => {
      body.style.background = oldBodyBg;
      body.style.backgroundColor = oldBodyBgColor;
      body.style.backgroundAttachment = "";

      const activeStyle = document.getElementById("forum-dynamic-theme-override");
      if (activeStyle) {
        activeStyle.remove();
      }
    };
  }, [themeColor]);

  return null;
}