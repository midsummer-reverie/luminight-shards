// components/Typewriter.tsx
"use client";
import { useEffect, useState } from "react";

export default function Typewriter({ text }: { text: string }) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    setDisplay("");
    let i = 0;
    const iv = setInterval(() => {
      setDisplay(text.slice(0, ++i) + (i < text.length ? "▌" : ""));
      if (i >= text.length) clearInterval(iv);
    }, 40);
    return () => clearInterval(iv);
  }, [text]);

  return <span className="tw">{display}</span>;
}