"use client";
import { useEffect, useRef } from "react";

interface CanvasFXProps {
  shardColor?: string;
  glowColor?: string;
}

export default function CanvasFX({ 
  shardColor = "#ff5fa8", 
  glowColor = "rgba(255,95,168,0.15)" 
}: CanvasFXProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const colorRef = useRef(shardColor);
  colorRef.current = shardColor;

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext("2d");
    if (!cx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    cv.width = W;
    cv.height = H;

    const rs = () => {
      W = cv.width = window.innerWidth;
      H = cv.height = window.innerHeight;
    };
    window.addEventListener("resize", rs);

    const mk = (x: number, y: number, b: boolean) => ({
      x, y,
      s: b ? 2 + Math.random() * 3 : 3 + Math.random() * 7,
      vx: b ? (Math.random() - 0.5) * 7 : (Math.random() - 0.5) * 0.3,
      vy: b ? (Math.random() - 0.5) * 7 : -0.2 - Math.random() * 0.5,
      r: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.03,
      l: b ? 1 : null,
      a: 0.1 + Math.random() * 0.22
    });

    let ps: any[] = [];
    for (let i = 0; i < 45; i++) ps.push(mk(Math.random() * W, Math.random() * H, false));

    let animId: number;
    const tick = () => {
      cx.clearRect(0, 0, W, H);
      ps = ps.filter(p => p.l === null || p.l > 0);
      ps.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        if (p.l !== null) {
          p.l -= 0.03;
          p.vx *= 0.94;
          p.vy *= 0.94;
        } else if (p.y < -20) {
          p.y = H + 20;
          p.x = Math.random() * W;
        }
        cx.save();
        cx.translate(p.x, p.y);
        cx.rotate(p.r);
        cx.globalAlpha = p.l !== null ? p.l * 0.8 : p.a;
        
        // 🟢 ดึงค่าสีจาก CSS Variable (--cy) ถ้ามี ไม่งั้นใช้ค่าจาก prop / default
        let activeColor = colorRef.current;
        if (typeof window !== "undefined") {
          const rootColor = getComputedStyle(document.documentElement).getPropertyValue('--cy').trim();
          if (rootColor) activeColor = rootColor;
        }

        cx.fillStyle = p.l !== null ? '#ffa6d0' : activeColor;
        
        cx.beginPath();
        cx.moveTo(0, -p.s);
        cx.lineTo(p.s * 0.6, 0);
        cx.lineTo(0, p.s * 1.4);
        cx.lineTo(-p.s * 0.6, 0);
        cx.fill();
        cx.restore();
      });
      animId = requestAnimationFrame(tick);
    };
    tick();

    const onMouseClick = (e: MouseEvent) => {
      for (let i = 0; i < 10; i++) ps.push(mk(e.clientX, e.clientY, true));
    };
    const onMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`;
      }
    };

    window.addEventListener("click", onMouseClick);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("resize", rs);
      window.removeEventListener("click", onMouseClick);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} id="fx" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: -1, pointerEvents: "none" }} />
      <div 
        ref={glowRef} 
        id="glow" 
        style={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          width: 300, 
          height: 300, 
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 60%)`, 
          pointerEvents: "none", 
          zIndex: -1 
        }} 
      />
    </>
  );
}