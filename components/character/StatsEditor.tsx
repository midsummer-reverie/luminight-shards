"use client";

import { useEffect, useState } from "react";
import { STAT_LABELS } from "@/lib/constants";
import Radar from "./Radar";

// สไลเดอร์อยู่ซ้าย กราฟพรีวิวอยู่ขวา (จอแคบจะเรียงลงมาเอง) สีกราฟตามช่อง "สีหลัก" แบบสด
export default function StatsEditor({ initial = [], color = "#ff5fa8" }: { initial?: number[]; color?: string }) {
  const [stats, setStats] = useState<number[]>(() => 
    STAT_LABELS.map((_, i) => (initial && initial[i] !== undefined ? initial[i] : 50))
  );
  const [col, setCol] = useState(color);

  useEffect(() => {
    setCol(color);
  }, [color]);

  useEffect(() => {
    const el = document.querySelector<HTMLInputElement>('input[name="colorPrimary"]');
    if (!el) return;
    const h = () => setCol(el.value);
    el.addEventListener("input", h);
    return () => el.removeEventListener("input", h);
  }, []);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
      <div style={{ flex: "1 1 260px", minWidth: 0 }}>
        {STAT_LABELS.map((l, i) => (
          <label key={l} className="fl">
            {l} <b style={{ color: col }}>{stats[i]}</b>
            <input
              type="range" name={`s${i}`} min={0} max={100} value={stats[i] ?? 50}
              onChange={(e) => setStats((s) => s.map((v, j) => (j === i ? Number(e.target.value) : v)))}
            />
          </label>
        ))}
      </div>
      <div style={{ flex: "1 1 320px", maxWidth: 420, minWidth: 0 }}>
        <Radar stats={stats} color={col} />
      </div>
    </div>
  );
}