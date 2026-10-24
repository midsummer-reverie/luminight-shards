"use client";

import { useEffect } from "react";

export default function ThemeInjector({ color }: { color: string }) {
  useEffect(() => {
    const root = document.documentElement;
    
    // 1. เซ็ตสีธีมของตัวละคร
    root.style.setProperty("--cy", color);
    root.style.setProperty("--line", `${color}40`);
    
    // 2. ปรับสีพื้นฐาน (พื้นหลัง, กล่อง, ตัวอักษร) ให้เป็นโทน เทา-ดำ-ขาว ที่เป็นกลาง (ไม่ติดชมพู)
    root.style.setProperty("--bg", "#0a0a0a");       // ดำสนิท (จากเดิมอมม่วง)
    root.style.setProperty("--panel", "#141414");    // เทาเข้ม (จากเดิมอมชมพู)
    root.style.setProperty("--mut", "#888888");      // เทากลาง
    root.style.setProperty("--tx", "#f0f0f0");       // ขาว

    // 3. ปรับพื้นหลัง body ให้เรืองแสงตามสีตัวละคร
    const originalBackground = document.body.style.background;
    document.body.style.background = `var(--bg) radial-gradient(circle at 80% -10%, ${color}33 0, transparent 45%)`;

    // 4. คืนค่าเดิมทั้งหมดเมื่อกดออกจากหน้านี้ (Cleanup)
    return () => {
      root.style.removeProperty("--cy");
      root.style.removeProperty("--line");
      root.style.removeProperty("--bg");
      root.style.removeProperty("--panel");
      root.style.removeProperty("--mut");
      root.style.removeProperty("--tx");
      document.body.style.background = originalBackground;
    };
  }, [color]);

  return null; // ไม่ต้องแสดงผล UI ใดๆ แค่รันเบื้องหลัง
}